// Operium Club — Pantalla F: Resumen del Grupo — Operium
// Desktop-first, Comparativa de los 4 locales, Calendario combinado Oct 16-17,
// Indicadores derivados, Métricas agregadas sin datos personales entre marcas.

import { getState, subscribe, getVenueMetrics, getGroupMetrics } from '../../store.js';
import { VENUES } from '../../data/venues.js';

export default function Group() {
  function render() {
    const state = getState();
    const { events } = state;
    const groupData = getGroupMetrics();

    // Totales agregados a nivel de grupo
    const totalVenues = VENUES.length;
    const totalEvents = events.length;
    const totalCapacity = VENUES.reduce((acc, v) => acc + (v.capacity || 0), 0);
    const totalSaved = groupData.reduce((acc, item) => acc + item.metrics.totalSaved, 0);
    const totalCheckins = groupData.reduce((acc, item) => acc + item.metrics.totalCheckins, 0);
    const totalSignals = groupData.reduce((acc, item) => acc + item.metrics.totalSignals, 0);
    const totalFollowers = groupData.reduce((acc, item) => acc + item.metrics.followers, 0);

    const groupConversionRate = totalSaved > 0 
      ? ((totalCheckins / totalSaved) * 100).toFixed(1) 
      : '0.0';

    // Eventos agrupados por fecha (Viernes 16 y Sábado 17 Oct)
    const eventsOct16 = events.filter(e => e.date === '2026-10-16').sort((a, b) => a.time.localeCompare(b.time));
    const eventsOct17 = events.filter(e => e.date === '2026-10-17').sort((a, b) => a.time.localeCompare(b.time));

    return `
      <div class="panel-page group-page">
        <!-- Encabezado de Página -->
        <header class="panel-page__header">
          <div class="panel-page__title-group">
            <div class="panel-page__badge-row">
              <span class="badge badge--gold">Pantalla F — Panel de Negocio</span>
              <span class="badge badge--outline">Visión Ejecutiva Multicentro</span>
              <span class="badge badge--warning">DATOS FICTICIOS — DEMO</span>
            </div>
            <h1 class="panel-page__title">Resumen del Grupo — Operium</h1>
            <p class="panel-page__subtitle">
              Tablero consolidado de desempeño para Conan y la dirección general. Comparativa transversal de los 4 establecimientos y agenda de fin de semana con indicadores derivados.
            </p>
          </div>
        </header>

        <!-- BANNER DE PRIVACIDAD OBLIGATORIO -->
        <div class="panel-callout panel-callout--privacy">
          <div class="panel-callout__icon">🛡️</div>
          <div class="panel-callout__content">
            <strong class="panel-callout__headline">Vista consolidada — Solo métricas agregadas, sin datos personales entre marcas</strong>
            <p class="panel-callout__desc">
              Cada establecimiento opera como un silo de privacidad independiente. Esta vista directiva expone exclusivamente agregaciones matemáticas, tasas de conversión y aforos. 
              <strong>Ningún local ni usuario puede acceder a nombres, teléfonos ni historiales personales de clientes de otra marca del grupo.</strong>
            </p>
          </div>
        </div>

        <!-- SECCIÓN 1: Tarjetas de Comparativa de los 4 Locales (Side-by-Side) -->
        <section class="group-section">
          <div class="section-header-row">
            <div>
              <h2 class="section-title">Comparativa de Establecimientos</h2>
              <p class="section-subtitle">Evaluación de volumen de interés, efectividad de captación y asistencia en puerta.</p>
            </div>
            <span class="badge badge--subtle">4 de 4 marcas activas</span>
          </div>

          <div class="group-venues-grid">
            ${groupData.map(({ venue, metrics }) => {
              const venueCapRatio = venue.capacity ? Math.round((metrics.totalCheckins / venue.capacity) * 100) : 0;

              return `
                <div class="card card--venue-group" style="--venue-color: ${venue.accentColor};">
                  <!-- Cabecera de la Marca -->
                  <div class="card__header card__header--venue">
                    <div class="venue-group-title-row">
                      <div class="venue-group-icon" style="background-color: ${venue.accentColor}22; border-color: ${venue.accentColor};">
                        <span>${venue.icon}</span>
                      </div>
                      <div>
                        <h3 class="venue-group-name">${venue.name}</h3>
                        <span class="badge badge--outline">${venue.category}</span>
                      </div>
                    </div>
                  </div>

                  <div class="card__body">
                    <div class="venue-group-meta">
                      <span>👤 <strong>Encargado:</strong> ${venue.manager}</span>
                      <span>👥 <strong>Aforo oficial:</strong> ${venue.capacity} pax</span>
                    </div>

                    <!-- Métricas Principales -->
                    <div class="venue-group-metrics-grid">
                      <div class="group-metric-cell">
                        <span class="group-metric-label">Eventos</span>
                        <span class="group-metric-val">${metrics.events}</span>
                      </div>
                      <div class="group-metric-cell">
                        <span class="group-metric-label">Guardados</span>
                        <span class="group-metric-val text-gold">${metrics.totalSaved}</span>
                      </div>
                      <div class="group-metric-cell">
                        <span class="group-metric-label">Check-ins</span>
                        <span class="group-metric-val" style="color: ${venue.accentColor}; font-weight: 700;">${metrics.totalCheckins}</span>
                      </div>
                      <div class="group-metric-cell">
                        <span class="group-metric-label">Seguidores</span>
                        <span class="group-metric-val">${metrics.followers}</span>
                      </div>
                      <div class="group-metric-cell">
                        <span class="group-metric-label">Señales promotores</span>
                        <span class="group-metric-val">${metrics.totalSignals}</span>
                      </div>
                      <div class="group-metric-cell">
                        <span class="group-metric-label">Capacidad usada</span>
                        <span class="group-metric-val">${venueCapRatio}%</span>
                      </div>
                    </div>

                    <!-- INDICADOR DERIVADO DESTACADO -->
                    <div class="group-derived-box" style="border-left: 3px solid ${venue.accentColor};">
                      <div class="derived-box-header">
                        <span class="derived-label">Tasa de Conversión (Asistencia / Interés):</span>
                        <span class="derived-value" style="color: ${venue.accentColor};">${metrics.conversionRate}%</span>
                      </div>
                      <div class="progress-bar">
                        <div 
                          class="progress-bar__fill" 
                          style="width: ${Math.min(100, Math.max(5, parseFloat(metrics.conversionRate)))}%; background-color: ${venue.accentColor};"
                        ></div>
                      </div>
                      <small class="derived-note">
                        ${metrics.totalCheckins} asistencias de ${metrics.totalSaved} guardados previos en Mi Club.
                      </small>
                    </div>

                    <div class="group-venue-footer">
                      <span class="badge badge--xs badge--subtle">🛡️ Sin fichas de usuario visibles</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>

        <!-- SECCIÓN 2: Calendario Combinado de los 4 Locales (16-17 Octubre 2026) -->
        <section class="group-section">
          <div class="section-header-row">
            <div>
              <h2 class="section-title">Calendario Combinado del Grupo (Viernes 16 & Sábado 17 Octubre 2026)</h2>
              <p class="section-subtitle">Tira horizontal de programación simultánea en los 4 locales del consorcio.</p>
            </div>
            <span class="badge badge--gold">Calendario Unificado</span>
          </div>

          <div class="combined-calendar">
            <!-- DÍA 1: VIERNES 16 OCTUBRE -->
            <div class="calendar-day-block">
              <div class="calendar-day-header">
                <div class="calendar-day-title">
                  <span class="calendar-day-badge">VIERNES</span>
                  <h3>16 de Octubre de 2026</h3>
                </div>
                <span class="badge badge--outline">${eventsOct16.length} convocatorias</span>
              </div>

              <div class="calendar-events-strip">
                ${eventsOct16.map(event => {
                  const venue = VENUES.find(v => v.id === event.venueId) || { name: event.venueId, accentColor: '#D4A857', icon: '📍' };
                  return `
                    <div class="calendar-event-card" style="--venue-color: ${venue.accentColor};">
                      <div class="calendar-event-top">
                        <span class="calendar-event-time">${event.time} - ${event.endTime}</span>
                        <span class="badge badge--venue" style="color: ${venue.accentColor}; background-color: ${venue.accentColor}22; border-color: ${venue.accentColor}55;">
                          ${venue.icon} ${venue.name}
                        </span>
                      </div>
                      <h4 class="calendar-event-title">${event.title}</h4>
                      <p class="calendar-event-subtitle">${event.subtitle}</p>
                      
                      <div class="calendar-event-stats">
                        <span>⭐ <strong>${event.savedCount}</strong> guardados</span>
                        <span class="divider-dot">•</span>
                        <span style="color: ${venue.accentColor};">🎟️ <strong>${event.checkinCount || 0}</strong> check-ins</span>
                      </div>

                      <div class="calendar-event-benefit">
                        🎁 <small>${event.benefit?.title}</small>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- DÍA 2: SÁBADO 17 OCTUBRE -->
            <div class="calendar-day-block">
              <div class="calendar-day-header">
                <div class="calendar-day-title">
                  <span class="calendar-day-badge">SÁBADO</span>
                  <h3>17 de Octubre de 2026</h3>
                </div>
                <span class="badge badge--outline">${eventsOct17.length} convocatorias</span>
              </div>

              <div class="calendar-events-strip">
                ${eventsOct17.map(event => {
                  const venue = VENUES.find(v => v.id === event.venueId) || { name: event.venueId, accentColor: '#D4A857', icon: '📍' };
                  return `
                    <div class="calendar-event-card" style="--venue-color: ${venue.accentColor};">
                      <div class="calendar-event-top">
                        <span class="calendar-event-time">${event.time} - ${event.endTime}</span>
                        <span class="badge badge--venue" style="color: ${venue.accentColor}; background-color: ${venue.accentColor}22; border-color: ${venue.accentColor}55;">
                          ${venue.icon} ${venue.name}
                        </span>
                      </div>
                      <h4 class="calendar-event-title">${event.title}</h4>
                      <p class="calendar-event-subtitle">${event.subtitle}</p>
                      
                      <div class="calendar-event-stats">
                        <span>⭐ <strong>${event.savedCount}</strong> guardados</span>
                        <span class="divider-dot">•</span>
                        <span style="color: ${venue.accentColor};">🎟️ <strong>${event.checkinCount || 0}</strong> check-ins</span>
                      </div>

                      <div class="calendar-event-benefit">
                        🎁 <small>${event.benefit?.title}</small>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </section>

        <!-- SECCIÓN 3: Fila de Totales Agregados del Consorcio (Resumen Final) -->
        <section class="group-section">
          <div class="card card--totals-row">
            <div class="card__header">
              <div class="totals-title-group">
                <span class="badge badge--pill badge--gold">Consolidado Total Operium</span>
                <h3 class="totals-title">Balance Agregado del Grupo</h3>
              </div>
              <span class="badge badge--subtle">4 Establecimientos • 2 Jornadas</span>
            </div>

            <div class="card__body">
              <div class="totals-grid">
                <div class="total-metric-box">
                  <span class="total-metric-label">Locales Integrados</span>
                  <span class="total-metric-value">${totalVenues}</span>
                  <span class="total-metric-sub">S. Perú, Mood, Adriá, Play</span>
                </div>

                <div class="total-metric-box">
                  <span class="total-metric-label">Eventos Programados</span>
                  <span class="total-metric-value">${totalEvents}</span>
                  <span class="total-metric-sub">2 eventos por local</span>
                </div>

                <div class="total-metric-box">
                  <span class="total-metric-label">Capacidad Combinada</span>
                  <span class="total-metric-value">${totalCapacity}</span>
                  <span class="total-metric-sub">Aforo total del grupo</span>
                </div>

                <div class="total-metric-box">
                  <span class="total-metric-label">Interés Total (Guardados)</span>
                  <span class="total-metric-value text-gold">${totalSaved}</span>
                  <span class="total-metric-sub">Intenciones en Mi Club</span>
                </div>

                <div class="total-metric-box">
                  <span class="total-metric-label">Asistencias Validadas</span>
                  <span class="total-metric-value text-success">${totalCheckins}</span>
                  <span class="total-metric-sub">Check-ins en puerta</span>
                </div>

                <div class="total-metric-box">
                  <span class="total-metric-label">Conversión Media Grupo</span>
                  <span class="total-metric-value text-accent">${groupConversionRate}%</span>
                  <span class="total-metric-sub">Asistencias / Guardados</span>
                </div>

                <div class="total-metric-box">
                  <span class="total-metric-label">Señales de Origen</span>
                  <span class="total-metric-value">${totalSignals}</span>
                  <span class="total-metric-sub">Atribuidas a promotores</span>
                </div>

                <div class="total-metric-box">
                  <span class="total-metric-label">Comunidad (Seguidores)</span>
                  <span class="total-metric-value">${totalFollowers}</span>
                  <span class="total-metric-sub">Suma de seguimientos</span>
                </div>
              </div>

              <div class="totals-legal-disclaimer">
                <small>
                  * Cifras reconciliadas dinámicamente desde el estado del club. En caso de simular el fin de semana o registrar check-ins adicionales, este resumen se recalcula en tiempo real sin requerir recargas de página.
                </small>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function mount() {
    const unsubscribe = subscribe(() => {
      const pageEl = document.querySelector('.group-page');
      if (pageEl && pageEl.parentElement) {
        pageEl.parentElement.innerHTML = render();
      }
    });

    return () => {
      unsubscribe();
    };
  }

  return {
    html: render(),
    mount,
  };
}
