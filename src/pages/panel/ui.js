// Operium Club — Piezas comunes del panel de negocio

import { icon } from '../../icons.js';
import { ctxLabel } from '../../metrics.js';
import { VENUES } from '../../data/venues.js';

// Cabecera de pantalla: contexto, título, conclusión y (opcional) cifras a la derecha
export function pageHeader({ ctx, eyebrow, title, insight = '', aside = '' }) {
  const venue = VENUES.find(v => v.id === ctx);
  const who = ctx === 'all' ? 'Todo el grupo' : `${ctxLabel(ctx)} · ${venue?.manager ? `Encargado: ${venue.manager}` : ''}`;
  return `
    <header class="vt-header nb-header">
      <div>
        <span class="section-title__eyebrow">${eyebrow} · ${who}</span>
        <h1 class="panel-page__title">${title}</h1>
        ${insight ? `<p class="nb-insight">${icon('sparkle', { size: 15 })}<span>${insight}</span></p>` : ''}
      </div>
      ${aside}
    </header>
  `;
}

// Botón de simulación: mismo aspecto en todas las pantallas para que el cliente
// distinga lo que es producto de lo que hacemos para la demo.
export function simButton(label, attrs = '') {
  return `<button type="button" class="sim-btn" ${attrs}>${icon('zap', { size: 14 })}<span>${label}</span></button>`;
}

export function statusChip(status) {
  return `<span class="nb-status nb-status--${status.key}">${status.label}</span>`;
}

// Variación frente al fin de semana anterior
export function delta(now, prev) {
  if (!prev) return '';
  const diff = Math.round(((now - prev) / prev) * 100);
  if (diff === 0) return '<span class="nb-delta">igual que la semana pasada</span>';
  const up = diff > 0;
  return `<span class="nb-delta nb-delta--${up ? 'up' : 'down'}">${up ? '+' : '−'}${Math.abs(diff)}% vs. semana pasada</span>`;
}

// Barras de una serie (tendencia de fines de semana)
export function trendBars(rows, valueKey, { highlightLast = true, suffix = '' } = {}) {
  const max = Math.max(...rows.map(r => r[valueKey]), 1);
  return `
    <div class="nb-trend" role="img" aria-label="Tendencia por fin de semana">
      ${rows.map((r, i) => `
        <div class="nb-trend__col ${highlightLast && i === rows.length - 1 ? 'nb-trend__col--last' : ''}">
          <span class="nb-trend__val">${r[valueKey].toLocaleString('es-PE')}${suffix}</span>
          <span class="nb-trend__bar" style="height: ${Math.max(6, Math.round((r[valueKey] / max) * 100))}%;"></span>
          <span class="nb-trend__label">${r.short || r.label}</span>
        </div>
      `).join('')}
    </div>
  `;
}

// Barra apilada de origen del público
export function sourceBar(bySource) {
  const total = bySource.promotor + bySource.campana + bySource.directo || 1;
  const parts = [
    ['promotor', 'Promotores', bySource.promotor],
    ['campana', 'Campañas', bySource.campana],
    ['directo', 'Directo', bySource.directo],
  ];
  return `
    <div class="nb-source">
      <div class="nb-source__bar">
        ${parts.map(([key, , n]) => `<span class="nb-source__part nb-source__part--${key}" style="width: ${(n / total) * 100}%;"></span>`).join('')}
      </div>
      <div class="nb-source__legend">
        ${parts.map(([key, label, n]) => `
          <span><i class="nb-source__dot nb-source__part--${key}"></i>${label} <strong>${Math.round((n / total) * 100)}%</strong></span>
        `).join('')}
      </div>
    </div>
  `;
}
