import {
  getSystemOverview,
  runSelfDiagnostics,
  getTunnelStatus,
  startTunnel,
  stopTunnel,
} from '../../services/system/index.js';

export async function getStatus(req, res, next) {
  try {
    const bootId = req.headers['x-server-boot'] || req.app.get('SERVER_BOOT_ID') || 'boot_live';
    const data = await getSystemOverview(bootId);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function runDiagnostics(req, res, next) {
  try {
    const report = await runSelfDiagnostics();
    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTunnel(req, res, next) {
  try {
    const status = await getTunnelStatus();
    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
}

export async function startTunnelHandler(req, res, next) {
  try {
    const status = await startTunnel();
    res.status(200).json({
      success: true,
      message: 'Túnel Cloudflare iniciado com sucesso!',
      data: status,
    });
  } catch (error) {
    next(error);
  }
}

export async function stopTunnelHandler(req, res, next) {
  try {
    const result = await stopTunnel();
    res.status(200).json({
      success: true,
      message: 'Túnel encerrado com sucesso.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
