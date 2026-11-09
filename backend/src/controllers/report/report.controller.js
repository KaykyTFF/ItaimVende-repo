import {
  createReport,
  getTicketByProtocolOrId,
  listReports,
  updateReportStatus,
  moderateRemoveProduct,
  moderateSuspendAccount,
  moderateDismissReport,
} from '../../services/report/index.js';

export async function addReport(req, res, next) {
  try {
    const data = await createReport(req.params.productId, req.body, req.user);
    res.status(201).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTicket(req, res, next) {
  try {
    const ticket = await getTicketByProtocolOrId(req.params.protocolOrId);
    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
}

export async function listAllReports(req, res, next) {
  try {
    const data = await listReports(req.query);
    res.status(200).json({
      success: true,
      data: data.items,
      summary: data.summary,
      pagination: data.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getReportDetails(req, res, next) {
  try {
    const report = await getTicketByProtocolOrId(req.params.id);
    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTicketStatus(req, res, next) {
  try {
    const data = await updateReportStatus(req.params.id, req.body.status);
    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/reports/:id/remove-product
 * Moderador aprova remoção de anúncio fraudulento e limpa o bucket
 */
export async function actionRemoveProduct(req, res, next) {
  try {
    const { reasonNote } = req.body || {};
    const result = await moderateRemoveProduct(req.user, req.params.id, reasonNote);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/reports/:id/suspend-account
 * Moderador suspende a conta do vendedor denunciado e arquiva seus anúncios
 */
export async function actionSuspendAccount(req, res, next) {
  try {
    const { reasonNote, statusType = 'SUSPENDED' } = req.body || {};
    const result = await moderateSuspendAccount(req.user, req.params.id, reasonNote, statusType);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/reports/:id/dismiss
 * Moderador descarta denúncia improcedente
 */
export async function actionDismissReport(req, res, next) {
  try {
    const { reasonNote } = req.body || {};
    const result = await moderateDismissReport(req.user, req.params.id, reasonNote);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

