import { getUserPrivacyDossier } from '../../services/account/account.privacy.service.js';

/**
 * Consulta o dossiê de dados pessoais do titular (LGPD Art. 18, II)
 */
export async function getPrivacyDossier(req, res, next) {
  try {
    const dossier = await getUserPrivacyDossier(req.user.id);
    
    // Se o cliente solicitou download de arquivo JSON direto
    if (req.query.download === 'true') {
      const fileName = `itaimvende-meus-dados-lgpd-${req.user.id.slice(-6)}.json`;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.status(200).send(JSON.stringify(dossier, null, 2));
    }

    res.status(200).json({
      success: true,
      dossier,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Exportação direta para portabilidade dos dados (LGPD Art. 18, V)
 */
export async function exportUserPersonalData(req, res, next) {
  try {
    const dossier = await getUserPrivacyDossier(req.user.id);
    const fileName = `itaimvende-portabilidade-dados-${req.user.id.slice(-6)}.json`;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.status(200).send(JSON.stringify(dossier, null, 2));
  } catch (error) {
    next(error);
  }
}

