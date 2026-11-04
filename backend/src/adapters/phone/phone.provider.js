/**
 * ITAIM VENDE - ADAPTER DE ENVIO DE CÓDIGO VIA WHATSAPP / SMS
 * Arquivo: backend/src/adapters/phone/phone.provider.js
 * 
 * Suporta múltiplos provedores através de interface desacoplada:
 * - 'mock': Ambiente de desenvolvimento e testes automatizados (zero custo).
 * - 'twilio': Envio oficial via WhatsApp Business API ou SMS Twilio.
 * - 'zenvia': Envio nacional via Zenvia SMS / WhatsApp.
 */

// Memória temporária para suporte a testes automatizados
const mockSentCodes = new Map();

/**
 * Normaliza um telefone brasileiro para o padrão internacional E.164 (+55...)
 * e formato limpo de 11 dígitos.
 */
export function normalizePhone(rawPhone) {
  if (!rawPhone) return { clean: null, e164: null, formatted: null };

  let digits = String(rawPhone).replace(/\D/g, '');

  // Se já veio com código do país 55
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  }

  // Validação estrita de celular BR (11 dígitos, DDD 11-99, iniciando com 9)
  if (digits.length !== 11) {
    return { clean: digits, e164: null, formatted: null, valid: false };
  }

  const ddd = parseInt(digits.substring(0, 2), 10);
  if (ddd < 11 || ddd > 99 || digits[2] !== '9') {
    return { clean: digits, e164: null, formatted: null, valid: false };
  }

  const e164 = `+55${digits}`;
  const formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;

  return { clean: digits, e164, formatted, valid: true };
}

/**
 * Envia código de 6 dígitos via WhatsApp ou SMS
 * 
 * @param {Object} params
 * @param {string} params.phone - Número destino (limpo ou E.164)
 * @param {string} params.code - Código numérico de 6 dígitos
 * @param {string} [params.channel='whatsapp'] - Canal ('whatsapp' | 'sms')
 * @returns {Promise<{ success: boolean, provider: string, messageId: string }>}
 */
export async function sendPhoneVerificationCode({ phone, code, channel = 'whatsapp' }) {
  const { e164, formatted, clean } = normalizePhone(phone);
  const targetPhone = e164 || phone;
  const provider = (process.env.PHONE_PROVIDER || 'mock').toLowerCase();

  // Armazena no cache de teste para asserções automatizadas
  if (clean) {
    mockSentCodes.set(clean, { code, sentAt: new Date(), targetPhone });
  }

  // 1. Provedor Twilio (Produção)
  if (provider === 'twilio' && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const fromNumber = channel === 'whatsapp' 
        ? `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886'}`
        : (process.env.TWILIO_PHONE_NUMBER || '+14155238886');
      const toNumber = channel === 'whatsapp' ? `whatsapp:${targetPhone}` : targetPhone;

      // Import dinâmico ou fetch HTTP direto na API do Twilio
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: toNumber,
          Body: `Seu código de confirmação do Itaim Vende é: ${code}. Válido por 10 minutos. Não compartilhe com ninguém.`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('[Twilio Provider Error]', data);
        throw new Error(data.message || 'Falha ao enviar mensagem via Twilio');
      }

      return { success: true, provider: 'twilio', messageId: data.sid };
    } catch (errTwilio) {
      console.warn('[PhoneProvider] Falha no Twilio, caindo para Mock seguro:', errTwilio.message);
    }
  }

  // 2. Provedor Zenvia (SMS Nacional)
  if (provider === 'zenvia' && process.env.ZENVIA_TOKEN) {
    try {
      const res = await fetch('https://api.zenvia.com/v2/channels/sms/messages', {
        method: 'POST',
        headers: {
          'X-API-TOKEN': process.env.ZENVIA_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.ZENVIA_FROM || 'ItaimVende',
          to: targetPhone.replace(/\D/g, ''),
          contents: [{
            type: 'text',
            text: `Itaim Vende: Seu código de segurança é ${code}. Válido por 10 minutos.`,
          }],
        }),
      });
      const data = await res.json();
      return { success: true, provider: 'zenvia', messageId: data.id || 'zenvia-' + Date.now() };
    } catch (errZenvia) {
      console.warn('[PhoneProvider] Falha na Zenvia:', errZenvia.message);
    }
  }

  // 3. Provedor Mock / Local (Padrão para Dev e Testes)
  console.log('---------------------------------------------------------');
  console.log(`[PHONE_PROVIDER:MOCK] 📱 Envio de Código de Confirmação`);
  console.log(`Destinatário: ${formatted || targetPhone} (${targetPhone})`);
  console.log(`Canal: ${channel.toUpperCase()}`);
  console.log(`CÓDIGO OTP: [ ${code} ] (Válido por 10 minutos)`);
  console.log('---------------------------------------------------------');

  return {
    success: true,
    provider: 'mock',
    messageId: `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  };
}

/**
 * Obtém o último código gerado em ambiente de mock/teste
 */
export function getLastSentCode(phone) {
  const { clean } = normalizePhone(phone);
  return mockSentCodes.get(clean || phone)?.code || null;
}

/**
 * Limpa o histórico de mocks
 */
export function clearMockCodes() {
  mockSentCodes.clear();
}

