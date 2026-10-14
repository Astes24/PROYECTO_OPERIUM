// Operium Club — Piezas comunes del panel de negocio


// Cabecera de pantalla: título y (opcional) cifras o acción a la derecha.
// El local activo ya está en la barra lateral.
export function pageHeader({ title, aside = '' }) {
  return `
    <header class="vt-header nb-header">
      <div>
        <h1 class="panel-page__title">${title}</h1>
      </div>
      ${aside}
    </header>
  `;
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
