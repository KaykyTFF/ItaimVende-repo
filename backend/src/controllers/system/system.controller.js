import { getSystemOverview, runSelfDiagnostics } from '../../services/system/index.js';

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
