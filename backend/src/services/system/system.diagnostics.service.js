import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import prisma from '../../config/prisma.js';
import { ENV } from '../../config/env.js';
import { UPLOAD_DIR, UPLOAD_PERFIL_DIR, UPLOAD_VENDAS_DIR } from '../../config/upload.js';

function humanizarTempo(segundos) {
  const d = Math.floor(segundos / (3600 * 24));
  const h = Math.floor((segundos % (3600 * 24)) / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = Math.floor(segundos % 60);

  const partes = [];
  if (d > 0) partes.push(`${d}d`);
  if (h > 0) partes.push(`${h}h`);
  if (m > 0) partes.push(`${m}m`);
  partes.push(`${s}s`);
  return partes.join(' ');
}

function obterEstatisticasPasta(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return { exists: false, count: 0, sizeBytes: 0, sizeMb: '0.00', writable: false };
  }

  let totalSize = 0;
  let fileCount = 0;
  try {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          fileCount++;
          totalSize += stat.size;
        }
      } catch {
        // Ignora arquivos bloqueados
      }
    }
  } catch {
    // Ignora erros de leitura
  }

  let writable = false;
  try {
    const testFile = path.join(dirPath, `.write_check_${Date.now()}`);
    fs.writeFileSync(testFile, 'ok');
    fs.unlinkSync(testFile);
    writable = true;
  } catch {
    writable = false;
  }

  return {
    exists: true,
    count: fileCount,
    sizeBytes: totalSize,
    sizeMb: (totalSize / (1024 * 1024)).toFixed(2),
    writable,
  };
}

/**
 * Coleta a visão geral do sistema em tempo real
 */
export async function getSystemOverview(serverBootId = 'boot_unknown') {
  const startDb = performance.now();
  let dbStatus = 'online';
  let dbLatencyMs = 0;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Math.round(performance.now() - startDb);
  } catch (err) {
    dbStatus = 'error';
    dbLatencyMs = -1;
  }

  // Estatísticas das tabelas
  let stats = {
    users: 0,
    verifiedUsers: 0,
    products: 0,
    activeProducts: 0,
    pausedProducts: 0,
    soldProducts: 0,
    categories: 0,
    conversations: 0,
    messages: 0,
    orders: 0,
    favorites: 0,
    reviews: 0,
    reports: 0,
  };

  if (dbStatus === 'online') {
    try {
      const [
        users,
        verifiedUsers,
        products,
        activeProducts,
        pausedProducts,
        soldProducts,
        categories,
        conversations,
        messages,
        orders,
        favorites,
        reviews,
        reports,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isVerified: true } }),
        prisma.product.count(),
        prisma.product.count({ where: { status: 'ATIVO' } }),
        prisma.product.count({ where: { status: 'PAUSADO' } }),
        prisma.product.count({ where: { status: 'VENDIDO' } }),
        prisma.category.count(),
        prisma.conversation.count(),
        prisma.message.count(),
        prisma.order.count(),
        prisma.favorite.count(),
        prisma.review.count(),
        prisma.report.count(),
      ]);

      stats = {
        users,
        verifiedUsers,
        products,
        activeProducts,
        pausedProducts,
        soldProducts,
        categories,
        conversations,
        messages,
        orders,
        favorites,
        reviews,
        reports,
      };
    } catch (e) {
      dbStatus = 'degraded';
    }
  }

  // Estatísticas de armazenamento
  const storageUploads = obterEstatisticasPasta(UPLOAD_DIR);
  const storagePerfil = obterEstatisticasPasta(UPLOAD_PERFIL_DIR);
  const storageVendas = obterEstatisticasPasta(UPLOAD_VENDAS_DIR);

  const storageStatus = (storageUploads.writable && storagePerfil.writable && storageVendas.writable)
    ? 'online'
    : 'warning';

  // Métricas do processo Node.js
  const uptimeSeconds = Math.floor(process.uptime());
  const mem = process.memoryUsage();

  return {
    status: dbStatus === 'online' && storageStatus === 'online' ? 'healthy' : 'warning',
    timestamp: new Date().toISOString(),
    server: {
      bootId: serverBootId,
      uptimeSeconds,
      uptimeFormatted: humanizarTempo(uptimeSeconds),
      environment: ENV.NODE_ENV,
      port: ENV.PORT,
      corsOrigin: ENV.CORS_ORIGIN,
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid,
      memory: {
        rssMb: Math.round(mem.rss / (1024 * 1024)),
        heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
        heapTotalMb: Math.round(mem.heapTotal / (1024 * 1024)),
        externalMb: Math.round(mem.external / (1024 * 1024)),
      },
    },
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      stats,
    },
    storage: {
      status: storageStatus,
      totalFiles: storageUploads.count + storagePerfil.count + storageVendas.count,
      totalSizeMb: (
        parseFloat(storageUploads.sizeMb) +
        parseFloat(storagePerfil.sizeMb) +
        parseFloat(storageVendas.sizeMb)
      ).toFixed(2),
      folders: {
        root: { path: '/uploads', ...storageUploads },
        perfil: { path: '/uploads/perfil', ...storagePerfil },
        vendas: { path: '/uploads/vendas', ...storageVendas },
      },
    },
  };
}

/**
 * Executa uma bateria completa de autodiagnóstico nos módulos do sistema
 */
export async function runSelfDiagnostics() {
  const tests = [];

  // Teste 1: Conexão e Latência do Banco de Dados
  const t1Start = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const t1Time = Math.round(performance.now() - t1Start);
    tests.push({
      id: 'db_connection',
      name: 'Banco de Dados (PostgreSQL / Prisma)',
      category: 'database',
      status: 'pass',
      durationMs: t1Time,
      message: `Conexão ativa e responsiva (${t1Time}ms)`,
    });
  } catch (err) {
    tests.push({
      id: 'db_connection',
      name: 'Banco de Dados (PostgreSQL / Prisma)',
      category: 'database',
      status: 'fail',
      durationMs: Math.round(performance.now() - t1Start),
      message: `Falha na conexão: ${err.message}`,
    });
  }

  // Teste 2: Categorias Oficiais
  const t2Start = performance.now();
  try {
    const count = await prisma.category.count();
    const t2Time = Math.round(performance.now() - t2Start);
    tests.push({
      id: 'categories_seed',
      name: 'Categorias Oficiais do Marketplace',
      category: 'data',
      status: count >= 10 ? 'pass' : 'warn',
      durationMs: t2Time,
      message: count >= 10
        ? `${count} categorias carregadas com sucesso.`
        : `Atenção: Apenas ${count} categorias encontradas (recomendado: 10).`,
    });
  } catch (err) {
    tests.push({
      id: 'categories_seed',
      name: 'Categorias Oficiais do Marketplace',
      category: 'data',
      status: 'fail',
      durationMs: Math.round(performance.now() - t2Start),
      message: `Erro ao consultar categorias: ${err.message}`,
    });
  }

  // Teste 3: Consulta Paginada de Produtos & Vitrine
  const t3Start = performance.now();
  try {
    const products = await prisma.product.findMany({
      take: 5,
      include: {
        category: true,
        seller: { select: { id: true, name: true, city: true, ratingAverage: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    const t3Time = Math.round(performance.now() - t3Start);
    tests.push({
      id: 'products_query',
      name: 'Vitrine e Busca de Produtos',
      category: 'api',
      status: 'pass',
      durationMs: t3Time,
      message: `Consulta paginada OK. ${products.length} anúncios lidos na amostra.`,
    });
  } catch (err) {
    tests.push({
      id: 'products_query',
      name: 'Vitrine e Busca de Produtos',
      category: 'api',
      status: 'fail',
      durationMs: Math.round(performance.now() - t3Start),
      message: `Erro na vitrine: ${err.message}`,
    });
  }

  // Teste 4: Permissões de Gravação e Leitura no Disco (Uploads)
  const t4Start = performance.now();
  try {
    const perfilCheck = obterEstatisticasPasta(UPLOAD_PERFIL_DIR);
    const vendasCheck = obterEstatisticasPasta(UPLOAD_VENDAS_DIR);
    const t4Time = Math.round(performance.now() - t4Start);

    if (perfilCheck.writable && vendasCheck.writable) {
      tests.push({
        id: 'storage_check',
        name: 'Pastas de Upload (Perfil e Vendas)',
        category: 'storage',
        status: 'pass',
        durationMs: t4Time,
        message: `Diretórios ativos e com permissão total de escrita/leitura.`,
      });
    } else {
      tests.push({
        id: 'storage_check',
        name: 'Pastas de Upload (Perfil e Vendas)',
        category: 'storage',
        status: 'fail',
        durationMs: t4Time,
        message: 'Permissões insuficientes para gravação na pasta de uploads.',
      });
    }
  } catch (err) {
    tests.push({
      id: 'storage_check',
      name: 'Pastas de Upload (Perfil e Vendas)',
      category: 'storage',
      status: 'fail',
      durationMs: Math.round(performance.now() - t4Start),
      message: `Erro no armazenamento: ${err.message}`,
    });
  }

  // Teste 5: Usuário Administrador
  const t5Start = performance.now();
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, isVerified: true },
    });
    const t5Time = Math.round(performance.now() - t5Start);
    tests.push({
      id: 'admin_account',
      name: 'Conta de Administração Oficial',
      category: 'security',
      status: admin ? 'pass' : 'warn',
      durationMs: t5Time,
      message: admin
        ? `Admin ativo: ${admin.name} (${admin.email})`
        : 'Aviso: Nenhuma conta com perfil ADMIN cadastrada.',
    });
  } catch (err) {
    tests.push({
      id: 'admin_account',
      name: 'Conta de Administração Oficial',
      category: 'security',
      status: 'fail',
      durationMs: Math.round(performance.now() - t5Start),
      message: `Erro ao verificar admin: ${err.message}`,
    });
  }

  // Teste 6: Integridade do Chat e Mensageria
  const t6Start = performance.now();
  try {
    const totalConversas = await prisma.conversation.count();
    const totalMsgs = await prisma.message.count();
    const t6Time = Math.round(performance.now() - t6Start);
    tests.push({
      id: 'chat_subsystem',
      name: 'Módulo de Chat e Mensagens',
      category: 'chat',
      status: 'pass',
      durationMs: t6Time,
      message: `Submódulo de chat saudável (${totalConversas} conversas, ${totalMsgs} mensagens).`,
    });
  } catch (err) {
    tests.push({
      id: 'chat_subsystem',
      name: 'Módulo de Chat e Mensagens',
      category: 'chat',
      status: 'fail',
      durationMs: Math.round(performance.now() - t6Start),
      message: `Falha no chat: ${err.message}`,
    });
  }

  // Teste 7: Configuração de Variáveis de Ambiente e Segurança
  const t7Start = performance.now();
  const hasJwtSecret = Boolean(ENV.JWT_SECRET && ENV.JWT_SECRET.length >= 10);
  const t7Time = Math.round(performance.now() - t7Start);
  tests.push({
    id: 'env_security',
    name: 'Variáveis de Ambiente & JWT Secret',
    category: 'security',
    status: hasJwtSecret ? 'pass' : 'fail',
    durationMs: t7Time,
    message: hasJwtSecret
      ? 'Chaves criptográficas JWT e ambiente configurados corretamente.'
      : 'JWT_SECRET ausente ou muito fraco.',
  });

  const totalPassed = tests.filter((t) => t.status === 'pass').length;
  const totalWarnings = tests.filter((t) => t.status === 'warn').length;
  const totalFailed = tests.filter((t) => t.status === 'fail').length;

  return {
    overallStatus: totalFailed > 0 ? 'critical' : (totalWarnings > 0 ? 'warning' : 'healthy'),
    summary: {
      total: tests.length,
      passed: totalPassed,
      warnings: totalWarnings,
      failed: totalFailed,
    },
    executedAt: new Date().toISOString(),
    tests,
  };
}
