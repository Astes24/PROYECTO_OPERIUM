// Operium Club — Códigos QR reales (escaneables) en SVG

import qrcode from 'qrcode-generator';

// Contenido del pase: identifica miembro y evento. En producción iría firmado
// por el servidor; en la demo basta con que sea único por persona y fecha.
export const passPayload = (memberId, eventId) => `OPC1|${eventId}|${memberId}`;

export function qrSvg(text, { size = 160, label = 'Código QR' } = {}) {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const quiet = 2;
  let d = '';
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.isDark(r, c)) d += `M${c + quiet},${r + quiet}h1v1h-1z`;
    }
  }
  const box = n + quiet * 2;
  return `
    <svg class="qr" viewBox="0 0 ${box} ${box}" width="${size}" height="${size}" role="img" aria-label="${label}" shape-rendering="crispEdges">
      <rect width="${box}" height="${box}" fill="#FAF3E8"/>
      <path d="${d}" fill="#0D0D0D"/>
    </svg>
  `;
}
