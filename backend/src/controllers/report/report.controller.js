import {
  createReport,
  getTicketByProtocolOrId,
  listReports,
  updateReportStatus,
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
      pagination: data.pagination,
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
