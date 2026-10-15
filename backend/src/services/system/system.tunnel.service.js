import { spawn, exec } from 'child_process';
import { AppError } from '../../utils/errors.js';

let tunnelProcess = null;
let currentTunnelUrl = null;
let tunnelStartTime = null;
const tunnelLogs = [];

const METRICS_PORT = 20241;
const METRICS_URL = `http://127.0.0.1:${METRICS_PORT}`;

function addTunnelLog(msg) {
  if (!msg) return;
  const lines = String(msg).split('\n').filter(Boolean);
  for (const l of lines) {
    const line = `[${new Date().toLocaleTimeString()}] ${l.trim()}`;
    tunnelLogs.unshift(line);
    if (tunnelLogs.length > 50) tunnelLogs.pop();
  }
}

/**
 * Consulta a API interna de métricas do cloudflared se ele já estiver em execução
 */
async function queryCloudflaredMetrics() {
  try {
    const res = await fetch(`${METRICS_URL}/quicktunnel`, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.hostname) {
        return {
          hostname: data.hostname,
          url: `https://${data.hostname}`,
        };
      }
    }
  } catch {
    // Não está respondendo na porta de métricas
  }
  return null;
}

/**
 * Retorna o status detalhado do túnel
 */
export async function getTunnelStatus() {
  // 1. Tenta consultar o endpoint de métricas interno do cloudflared
  const quick = await queryCloudflaredMetrics();
  if (quick) {
    currentTunnelUrl = quick.url;
    return {
      running: true,
      url: quick.url,
      hostname: quick.hostname,
      source: tunnelProcess ? 'managed' : 'external',
      startedAt: tunnelStartTime || new Date().toISOString(),
      logs: tunnelLogs.slice(0, 15),
    };
  }

  // 2. Se o processo gerenciado existe e tem URL conhecida
  if (tunnelProcess && !tunnelProcess.killed && currentTunnelUrl) {
    return {
      running: true,
      url: currentTunnelUrl,
      hostname: new URL(currentTunnelUrl).hostname,
      source: 'managed',
      startedAt: tunnelStartTime,
      logs: tunnelLogs.slice(0, 15),
    };
  }

  // Desconectado
  currentTunnelUrl = null;
  return {
    running: false,
    url: null,
    source: null,
    logs: tunnelLogs.slice(0, 15),
  };
}

/**
 * Inicia o túnel Cloudflare e aguarda a geração da URL pública
 */
export async function startTunnel() {
  // 1. Se já estiver online, retorna o link atual imediatamente
  const status = await getTunnelStatus();
  if (status.running && status.url) {
    addTunnelLog(`Túnel já está ativo em: ${status.url}`);
    return status;
  }

  addTunnelLog('Iniciando processo do Cloudflare Tunnel na porta 3000...');

  // 2. Dispara o executável cloudflared
  const args = [
    'tunnel',
    '--url',
    'http://localhost:3000',
    '--metrics',
    `127.0.0.1:${METRICS_PORT}`,
  ];

  try {
    tunnelProcess = spawn('cloudflared', args, {
      shell: true,
      detached: false,
      windowsHide: true,
    });
  } catch (err) {
    addTunnelLog(`Falha ao invocar cloudflared: ${err.message}`);
    throw new AppError(`Não foi possível iniciar o cloudflared: ${err.message}`, 500);
  }

  tunnelStartTime = new Date().toISOString();
  currentTunnelUrl = null;

  const extractUrl = (text) => {
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match && !currentTunnelUrl) {
      currentTunnelUrl = match[0];
      addTunnelLog(`Link público capturado do terminal: ${currentTunnelUrl}`);
    }
  };

  tunnelProcess.stdout?.on('data', (data) => {
    const text = data.toString();
    addTunnelLog(text);
    extractUrl(text);
  });

  tunnelProcess.stderr?.on('data', (data) => {
    const text = data.toString();
    addTunnelLog(text);
    extractUrl(text);
  });

  tunnelProcess.on('exit', (code, signal) => {
    addTunnelLog(`Processo cloudflared encerrado (código ${code})`);
    tunnelProcess = null;
    currentTunnelUrl = null;
  });

  // 3. Aguarda até obter a URL pública (polling por até 25 segundos)
  const maxAttempts = 50;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (currentTunnelUrl) {
      return {
        running: true,
        url: currentTunnelUrl,
        hostname: new URL(currentTunnelUrl).hostname,
        startedAt: tunnelStartTime,
        logs: tunnelLogs.slice(0, 15),
      };
    }

    const quick = await queryCloudflaredMetrics();
    if (quick) {
      currentTunnelUrl = quick.url;
      addTunnelLog(`Link público obtido das métricas: ${quick.url}`);
      return {
        running: true,
        url: quick.url,
        hostname: quick.hostname,
        startedAt: tunnelStartTime,
        logs: tunnelLogs.slice(0, 15),
      };
    }
  }

  throw new AppError('O túnel foi disparado, mas demorou mais de 25 segundos para gerar a URL. Verifique os logs.', 504);
}

/**
 * Encerra qualquer túnel ativo
 */
export async function stopTunnel() {
  addTunnelLog('Encerrando processo do túnel...');

  if (tunnelProcess) {
    try {
      tunnelProcess.kill('SIGTERM');
      setTimeout(() => {
        if (tunnelProcess) {
          try { tunnelProcess.kill('SIGKILL'); } catch {}
        }
      }, 1500);
    } catch {}
    tunnelProcess = null;
  }

  // No Windows, encerra o executável cloudflared se estiver rodando
  try {
    exec('taskkill /F /IM cloudflared.exe /T', () => {});
  } catch {}

  currentTunnelUrl = null;
  tunnelStartTime = null;
  addTunnelLog('Túnel desconectado com sucesso.');

  return {
    running: false,
    url: null,
    message: 'Túnel desconectado com sucesso.',
  };
}
