import { createReport } from '../../services/report.service.js';

export async function addReport(req, res, next) {
  try {
    const data = await createReport(req.params.productId, req.body);
    res.status(201).json({
      success: true,
      ...data,
    });
  } catch (error) {
    next(error);
  }
}
