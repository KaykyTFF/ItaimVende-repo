import {
  getSystemOverview,
  runSelfDiagnostics,
  getTunnelStatus,
  startTunnel,
  stopTunnel,
  auditStorageOrphans,
  cleanStorageOrphans,
  seedDemoProducts,
  cleanDemoProducts,
  getRecentDataOverview,
  toggleProductStatus,
  toggleUserStatus,
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

export async function auditStorageHandler(req, res, next) {
  try {
    const audit = await auditStorageOrphans();
    res.status(200).json({
      success: true,
      data: audit,
    });
  } catch (error) {
    next(error);
  }
}

export async function cleanStorageHandler(req, res, next) {
  try {
    const result = await cleanStorageOrphans();
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} arquivo(s) órfão(s) removido(s) com sucesso.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function seedProductsHandler(req, res, next) {
  try {
    const result = await seedDemoProducts();
    res.status(201).json({
      success: true,
      message: `${result.count} anúncio(s) de teste criado(s) com sucesso!`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function cleanSeedHandler(req, res, next) {
  try {
    const result = await cleanDemoProducts();
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} anúncio(s) de teste removido(s).`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRecentDataHandler(req, res, next) {
  try {
    const data = await getRecentDataOverview();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleProductStatusHandler(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await toggleProductStatus(id);
    res.status(200).json({
      success: true,
      message: `Status do anúncio alterado para ${updated.status}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleUserStatusHandler(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await toggleUserStatus(id);
    res.status(200).json({
      success: true,
      message: `Status do usuário alterado para ${updated.status}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}
