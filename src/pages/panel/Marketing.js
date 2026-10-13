// Operium Club — Pantalla D: Panel de Marketing y Audiencias
// Desktop-first, Tu Público, segmentos, consentimiento estricto y envío simulado de campañas

import { getState, subscribe, sendCampaign } from '../../store.js';
import { getVenue, VENUES } from '../../data/venues.js';

export default function Marketing() {
  function render() {
    const state = getState();
    const { members, campaigns } = state;

    // Segmentos calculados dinámicamente desde el store
    const nuevoMembers = members.filter(m => m.segment === 'nuevo');
    const recurrenteMembers = members.filter(m => m.segment === 'recurrente');
    const sinInteraccionMembers = members.filter(m => m.segment === 'sin_interaccion');

    const totalMembers = members.length;
    const nuevoCount = nuevoMembers.length;
    const recurrenteCount = recurrenteMembers.length;
    const sinInteraccionCount = sinInteraccionMembers.length;

    const nuevoPct = Math.round((nuevoCount / totalMembers) * 100);
    const recurrentePct = Math.round((recurrenteCount / totalMembers) * 100);
    const sinInteraccionPct = Math.round((sinInteraccionCount / totalMembers) * 100);

    // Campañas
    const draftCampaign = campaigns.find(c => c.id === 'camp-01') || campaigns[0];
    const completedCampaign = campaigns.find(c => c.id === 'camp-02') || campaigns[1];

    // Cálculos dinámicos de elegibilidad para camp-01 (o la de borrador/activa)
    const venueDraft = getVenue(draftCampaign.venueId) || { name: 'Mood', accentColor: '#9B59B6' };
    
    // Miembros que cumplen el segmento de la campaña
    const segmentTargetMembers = members.filter(m => m.segment === draftCampaign.segment);
    // Elegibles (cumplen segmento + canal + venue)
    const eligibleDraft = segmentTargetMembers.filter(m => {
      const channelOk = draftCampaign.channel === 'email' ? m.consent.email : m.consent.sms;
      const venueOk = m.consent.byVenue && m.consent.byVenue[draftCampaign.venueId];
      return channelOk && venueOk;
    });
    // Excluidos con desglose
    const excludedSinCanal = segmentTargetMembers.filter(m => {
      return draftCampaign.channel === 'email' ? !m.consent.email : !m.consent.sms;
    });
    const excludedSinVenue = segmentTargetMembers.filter(m => {
      return !m.consent.byVenue || !m.consent.byVenue[draftCampaign.venueId];
    });
    const excludedTotal = segmentTargetMembers.filter(m => {
      const channelOk = draftCampaign.channel === 'email' ? m.consent.email : m.consent.sms;
      const venueOk = m.consent.byVenue && m.consent.byVenue[draftCampaign.venueId];
      return !channelOk || !venueOk;
    });

    const isDraftSent = draftCampaign.status === 'sent' || draftCampaign.status === 'completed';

    return `
      <div class="panel-page marketing-page">
        <!-- Encabezado de Página -->
        <header class="panel-page__header">
          <div class="panel-page__title-group">
            <div class="panel-page__badge-row">
              <span class="badge badge--gold">Pantalla D — Panel de Negocio</span>
              <span class="badge badge--outline">Audiencias & Consentimiento</span>
              <span class="badge badge--warning">DATOS FICTICIOS — DEMO</span>
            </div>
            <h1 class="panel-page__title">Tu Público</h1>
            <p class="panel-page__subtitle">
              Segmentación de base de miembros, verificación rigurosa de consentimiento (DS 016-2024-JUS) y ejecución de campañas contextuales con respuesta simulada.
            </p>
          </div>
          <div class="panel-page__stats-pill">
            <div class="stat-pill">
              <span class="stat-pill__label">Base total</span>
              <span class="stat-pill__value">${totalMembers}</span>
            </div>
            <div class="stat-pill">
              <span class="stat-pill__label">Con email opt-in</span>
              <span class="stat-pill__value">${members.filter(m => m.consent.email).length}</span>
            </div>
            <div class="stat-pill">
              <span class="stat-pill__label">Campañas activas</span>
              <span class="stat-pill__value">${campaigns.length}</span>
            </div>
          </div>
        </header>

        <!-- SECCIÓN 1: Desglose de Segmentos -->
        <section class="marketing-section">
          <div class="section-header-row">
            <div>
              <h2 class="section-title">Distribución de Segmentos</h2>
              <p class="section-subtitle">Categorización basada en actividad verificable dentro de la red del club.</p>
            </div>
            <span class="badge badge--subtle">${totalMembers} miembros registrados</span>
          </div>

          <!-- Barra Visual Segmentada Proporcional -->
          <div class="segment-bar-container">
            <div class="segment-bar">
              <div 
                class="segment-bar__part segment-bar__part--nuevo" 
                style="width: ${nuevoPct}%;" 
                title="Nuevo: ${nuevoCount} miembros (${nuevoPct}%)"
              ></div>
              <div 
                class="segment-bar__part segment-bar__part--recurrente" 
                style="width: ${recurrentePct}%;" 
                title="Recurrente: ${recurrenteCount} miembros (${recurrentePct}%)"
              ></div>
              <div 
                class="segment-bar__part segment-bar__part--inactivo" 
                style="width: ${sinInteraccionPct}%;" 
                title="Sin interacción: ${sinInteraccionCount} miembros (${sinInteraccionPct}%)"
              ></div>
            </div>
            <div class="segment-bar__legend">
              <div class="legend-item">
                <span class="legend-dot legend-dot--nuevo"></span>
                <span>Nuevo: <strong>${nuevoCount}</strong> (${nuevoPct}%)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot legend-dot--recurrente"></span>
                <span>Recurrente: <strong>${recurrenteCount}</strong> (${recurrentePct}%)</span>
              </div>
              <div class="legend-item">
                <span class="legend-dot legend-dot--inactivo"></span>
                <span>Sin interacción: <strong>${sinInteraccionCount}</strong> (${sinInteraccionPct}%)</span>
              </div>
            </div>
          </div>

          <!-- Tarjetas Descriptivas de Cada Segmento -->
          <div class="segments-grid">
            <div class="card card--segment card--segment-nuevo">
              <div class="card__header">
                <div class="segment-icon-badge">🌱</div>
                <div>
                  <h3 class="segment-card-title">Nuevo</h3>
                  <span class="badge badge--pill badge--nuevo">${nuevoCount} miembros (${nuevoPct}%)</span>
                </div>
              </div>
              <div class="card__body">
                <p class="segment-card-desc">
                  Miembros registrados recientemente en el club que aún no registran asistencia a eventos.
                </p>
                <div class="segment-card-meta">
                  <div class="meta-row">
                    <span>Consentimiento email:</span>
                    <strong>${nuevoMembers.filter(m => m.consent.email).length} / ${nuevoCount}</strong>
                  </div>
                  <div class="meta-row">
                    <span>Acción recomendada:</span>
                    <span class="text-accent">Bienvenida & exploración</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="card card--segment card--segment-recurrente">
              <div class="card__header">
                <div class="segment-icon-badge">🔥</div>
                <div>
                  <h3 class="segment-card-title">Recurrente</h3>
                  <span class="badge badge--pill badge--recurrente">${recurrenteCount} miembros (${recurrentePct}%)</span>
                </div>
              </div>
              <div class="card__body">
                <p class="segment-card-desc">
                  Miembros con 2 o más interacciones y asistencias verificadas en la red de locales.
                </p>
                <div class="segment-card-meta">
                  <div class="meta-row">
                    <span>Consentimiento email:</span>
                    <strong>${recurrenteMembers.filter(m => m.consent.email).length} / ${recurrenteCount}</strong>
                  </div>
                  <div class="meta-row">
                    <span>Acción recomendada:</span>
                    <span class="text-accent">Beneficio preferencial & fidelización</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="card card--segment card--segment-inactivo">
              <div class="card__header">
                <div class="segment-icon-badge">💤</div>
                <div>
                  <h3 class="segment-card-title">Sin Interacción</h3>
                  <span class="badge badge--pill badge--inactivo">${sinInteraccionCount} miembros (${sinInteraccionPct}%)</span>
                </div>
              </div>
              <div class="card__body">
                <p class="segment-card-desc">
                  Miembros registrados pero inactivos en las últimas semanas. Candidatos a reactivación controlada.
                </p>
                <div class="segment-card-meta">
                  <div class="meta-row">
                    <span>Consentimiento email:</span>
                    <strong>${sinInteraccionMembers.filter(m => m.consent.email).length} / ${sinInteraccionCount}</strong>
                  </div>
                  <div class="meta-row">
                    <span>Acción recomendada:</span>
                    <span class="text-accent">Re-engagement según gustos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- SECCIÓN 2: Campañas Contextuales y Consentimiento -->
        <section class="marketing-section">
          <div class="section-header-row">
            <div>
              <h2 class="section-title">Campañas Contextuales</h2>
              <p class="section-subtitle">Filtrado estricto por consentimiento explícito de canal y local antes de cualquier envío.</p>
            </div>
          </div>

          <!-- CAMPAÑA 1: Borrador / En Vivo (camp-01) -->
          <div class="card card--campaign-active" style="--venue-color: ${venueDraft.accentColor};" id="card-camp-01">
            <div class="card__header card__header--split">
              <div>
                <div class="badge-row">
                  <span class="badge badge--venue" style="background-color: ${venueDraft.accentColor}22; color: ${venueDraft.accentColor}; border: 1px solid ${venueDraft.accentColor}55;">
                    ${venueDraft.icon || '🌙'} ${venueDraft.name}
                  </span>
                  <span class="badge ${isDraftSent ? 'badge--success' : 'badge--warning'}">
                    ${isDraftSent ? '✓ Enviada (DEMO)' : '⏳ Preparada / Borrador'}
                  </span>
                  <span class="badge badge--subtle">Canal: Email</span>
                  <span class="badge badge--subtle">Segmento: Recurrente</span>
                </div>
                <h3 class="campaign-title">${draftCampaign.name}</h3>
                <p class="campaign-meta-text">ID: <code>${draftCampaign.id}</code> • Creada: ${draftCampaign.createdAt}</p>
              </div>

              <div class="campaign-header-action">
                ${!isDraftSent ? `
                  <button 
                    type="button" 
                    class="btn btn--primary btn--lg btn-send-campaign" 
                    id="btn-send-camp-01"
                    data-campaign-id="${draftCampaign.id}"
                    style="--btn-color: ${venueDraft.accentColor};"
                  >
                    <span>⚡ Envío simulado DEMO</span>
                  </button>
                ` : `
                  <div class="sent-badge-box">
                    <span class="sent-badge-box__icon">✓</span>
                    <div>
                      <strong>Envío simulado completado</strong>
                      <span class="sent-badge-box__time">${draftCampaign.sentAt ? new Date(draftCampaign.sentAt).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }) : 'Hoy'}</span>
                    </div>
                  </div>
                `}
              </div>
            </div>

            <div class="card__body">
              <div class="campaign-layout-grid">
                <!-- Columna Izquierda: Mensaje y Previsualización -->
                <div class="campaign-preview-box">
                  <div class="campaign-preview-box__header">
                    <span class="preview-box__title">Previsualización del Mensaje</span>
                    <span class="badge badge--xs badge--subtle">Plantilla dinámica</span>
                  </div>
                  <div class="message-preview">
                    <div class="message-preview__header">
                      <span><strong>De:</strong> club@operium.club (Mood)</span>
                      <span><strong>Asunto:</strong> Invitación especial — Mood Sessions</span>
                    </div>
                    <div class="message-preview__body">
                      "${draftCampaign.message}"
                    </div>
                    <div class="message-preview__footer">
                      <small>Variables aplicadas: <code>{{nombre}}</code> → Nombre del miembro verificado.</small>
                    </div>
                  </div>

                  <!-- Regla Legal de Consentimiento -->
                  <div class="consent-notice-box">
                    <div class="consent-notice-box__icon">🛡️</div>
                    <div class="consent-notice-box__text">
                      <strong>Validación previa obligatoria:</strong>
                      Conforme al DS 016-2024-JUS (Protección de Datos Personales en Perú), se valida que cada destinatario cuente con opt-in activo tanto para el canal (<strong>email</strong>) como para el establecimiento (<strong>${venueDraft.name}</strong>). Los perfiles sin doble consentimiento son excluidos automáticamente.
                    </div>
                  </div>
                </div>

                <!-- Columna Derecha: Auditoría de Audiencia y Exclusiones -->
                <div class="campaign-audit-box">
                  <h4 class="audit-box__title">Auditoría de Audiencia (Reglas de Exclusión)</h4>

                  <div class="audit-metrics-row">
                    <div class="audit-metric audit-metric--eligible">
                      <span class="audit-metric__label">Público Elegible</span>
                      <span class="audit-metric__value" id="camp-01-eligible-count">${isDraftSent ? (draftCampaign.eligibleCount || eligibleDraft.length) : eligibleDraft.length}</span>
                      <span class="audit-metric__sub">Cumplen ambos consentimientos</span>
                    </div>
                    <div class="audit-metric audit-metric--excluded">
                      <span class="audit-metric__label">Público Excluido</span>
                      <span class="audit-metric__value" id="camp-01-excluded-count">${isDraftSent ? (draftCampaign.excludedCount || excludedTotal.length) : excludedTotal.length}</span>
                      <span class="audit-metric__sub">Filtro de privacidad estricto</span>
                    </div>
                  </div>

                  <!-- Desglose Detallado de Motivos de Exclusión -->
                  <div class="exclusion-reasons-card">
                    <h5 class="exclusion-reasons-title">Motivos de exclusión detallados:</h5>
                    <ul class="exclusion-reasons-list">
                      <li class="exclusion-reason-item">
                        <span class="exclusion-reason-badge">⚠️</span>
                        <div class="exclusion-reason-info">
                          <span class="exclusion-reason-name">Sin consentimiento de email</span>
                          <span class="exclusion-reason-count">${excludedSinCanal.length} miembros del segmento</span>
                        </div>
                      </li>
                      <li class="exclusion-reason-item">
                        <span class="exclusion-reason-badge">🚫</span>
                        <div class="exclusion-reason-info">
                          <span class="exclusion-reason-name">Sin autorización para ${venueDraft.name}</span>
                          <span class="exclusion-reason-count">${excludedSinVenue.length} miembros del segmento</span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <!-- Muestra de Miembros Excluidos (Transparencia) -->
                  <div class="excluded-samples-box">
                    <span class="excluded-samples-title">Muestra de miembros protegidos por exclusión:</span>
                    <div class="excluded-tags-cloud">
                      ${excludedTotal.slice(0, 6).map(m => `
                        <span class="excluded-member-tag" title="Motivo: ${!m.consent.email ? 'Sin email' : 'Sin permiso para Mood'}">
                          ${m.name} <small>(${!m.consent.email ? 'No email' : 'No Mood'})</small>
                        </span>
                      `).join('')}
                      ${excludedTotal.length > 6 ? `<span class="excluded-member-tag excluded-member-tag--more">+${excludedTotal.length - 6} más</span>` : ''}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Estado de Respuestas Simuladas (si ya fue enviada) -->
              ${isDraftSent ? `
                <div class="campaign-results-banner animate-fade-in" id="camp-01-results">
                  <div class="results-banner__header">
                    <span class="results-banner__title">📊 Resultados del Envío Simulado (DEMO)</span>
                    <span class="badge badge--success">Tasa de entrega: 100% (Simulada)</span>
                  </div>
                  <div class="results-metrics-grid">
                    <div class="result-metric-card">
                      <span class="result-metric-card__label">Destinatarios</span>
                      <span class="result-metric-card__value">${draftCampaign.eligibleCount || eligibleDraft.length}</span>
                      <span class="result-metric-card__sub">Enviados exitosamente</span>
                    </div>
                    <div class="result-metric-card">
                      <span class="result-metric-card__label">Aperturas estimadas (65%)</span>
                      <span class="result-metric-card__value text-success">${draftCampaign.responses?.opened || Math.floor(eligibleDraft.length * 0.65)}</span>
                      <span class="result-metric-card__sub">Interés de lectura</span>
                    </div>
                    <div class="result-metric-card">
                      <span class="result-metric-card__label">Clics estimados (35%)</span>
                      <span class="result-metric-card__value text-accent">${draftCampaign.responses?.clicked || Math.floor(eligibleDraft.length * 0.35)}</span>
                      <span class="result-metric-card__sub">Clic en invitación</span>
                    </div>
                    <div class="result-metric-card">
                      <span class="result-metric-card__label">Eventos guardados (15%)</span>
                      <span class="result-metric-card__value text-gold">${draftCampaign.responses?.saved || Math.floor(eligibleDraft.length * 0.15)}</span>
                      <span class="result-metric-card__sub">Guardado en Mi Club</span>
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </section>

        <!-- SECCIÓN 3: Campaña Histórica Completada -->
        <section class="marketing-section">
          <div class="section-header-row">
            <div>
              <h2 class="section-title">Campañas Históricas</h2>
              <p class="section-subtitle">Registro de campañas ejecutadas con métricas consolidadas.</p>
            </div>
          </div>

          <div class="card card--campaign-completed">
            <div class="card__header card__header--split">
              <div>
                <div class="badge-row">
                  <span class="badge badge--venue" style="background-color: #7ED32122; color: #7ED321; border: 1px solid #7ED32155;">
                    ⚡ Play
                  </span>
                  <span class="badge badge--success">✓ Completada</span>
                  <span class="badge badge--subtle">Canal: Email</span>
                  <span class="badge badge--subtle">Segmento: Recurrente</span>
                </div>
                <h3 class="campaign-title">${completedCampaign.name}</h3>
                <p class="campaign-meta-text">ID: <code>${completedCampaign.id}</code> • Enviada: ${completedCampaign.sentAt ? completedCampaign.sentAt.split('T')[0] : '2026-10-01'}</p>
              </div>
              <div class="campaign-summary-pill">
                <span class="pill-number">${completedCampaign.eligibleCount}</span>
                <span class="pill-desc">Destinatarios</span>
              </div>
            </div>

            <div class="card__body">
              <div class="results-metrics-grid">
                <div class="result-metric-card">
                  <span class="result-metric-card__label">Aperturas</span>
                  <span class="result-metric-card__value">${completedCampaign.responses?.opened || 12}</span>
                  <span class="result-metric-card__sub">${Math.round(((completedCampaign.responses?.opened || 12) / completedCampaign.eligibleCount) * 100)}% de tasa de apertura</span>
                </div>
                <div class="result-metric-card">
                  <span class="result-metric-card__label">Clics</span>
                  <span class="result-metric-card__value">${completedCampaign.responses?.clicked || 7}</span>
                  <span class="result-metric-card__sub">${Math.round(((completedCampaign.responses?.clicked || 7) / completedCampaign.eligibleCount) * 100)}% CTR sobre envíos</span>
                </div>
                <div class="result-metric-card">
                  <span class="result-metric-card__label">Guardados</span>
                  <span class="result-metric-card__value">${completedCampaign.responses?.saved || 3}</span>
                  <span class="result-metric-card__sub">${Math.round(((completedCampaign.responses?.saved || 3) / completedCampaign.eligibleCount) * 100)}% intención de asistencia</span>
                </div>
                <div class="result-metric-card">
                  <span class="result-metric-card__label">Exclusiones respetadas</span>
                  <span class="result-metric-card__value">${completedCampaign.excludedCount || 7}</span>
                  <span class="result-metric-card__sub">4 sin email • 3 sin Play</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- SECCIÓN 4: Tabla Resumen del Historial -->
        <section class="marketing-section">
          <div class="section-header-row">
            <div>
              <h2 class="section-title">Historial Completo de Campañas</h2>
            </div>
          </div>

          <div class="card card--table-container">
            <div class="table-responsive">
              <table class="panel-table">
                <thead>
                  <tr>
                    <th>Campaña</th>
                    <th>Local</th>
                    <th>Canal</th>
                    <th>Segmento</th>
                    <th>Estado</th>
                    <th>Elegibles</th>
                    <th>Aperturas</th>
                    <th>Clics</th>
                    <th>Guardados</th>
                  </tr>
                </thead>
                <tbody>
                  ${campaigns.map(c => {
                    const venue = getVenue(c.venueId) || { name: c.venueId, accentColor: '#D4A857' };
                    return `
                      <tr>
                        <td>
                          <strong>${c.name}</strong>
                          <div class="table-subtext">ID: ${c.id}</div>
                        </td>
                        <td>
                          <span class="badge badge--venue" style="color: ${venue.accentColor}; background-color: ${venue.accentColor}22;">
                            ${venue.name}
                          </span>
                        </td>
                        <td>${c.channel.toUpperCase()}</td>
                        <td><span class="badge badge--outline">${c.segment}</span></td>
                        <td>
                          <span class="badge ${c.status === 'completed' || c.status === 'sent' ? 'badge--success' : 'badge--warning'}">
                            ${c.status === 'completed' ? 'Completada' : c.status === 'sent' ? 'Enviada (DEMO)' : 'Borrador'}
                          </span>
                        </td>
                        <td><strong>${c.eligibleCount || '-'}</strong></td>
                        <td>${c.responses?.opened ?? '-'}</td>
                        <td>${c.responses?.clicked ?? '-'}</td>
                        <td>${c.responses?.saved ?? '-'}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function mount() {
    function setupInteractions() {
      const sendBtn = document.getElementById('btn-send-camp-01');
      if (sendBtn) {
        sendBtn.addEventListener('click', () => {
          const campaignId = sendBtn.dataset.campaignId || 'camp-01';
          const success = sendCampaign(campaignId);
          if (success) {
            // El store notificará a los suscriptores y re-renderizará
          }
        });
      }
    }

    setupInteractions();

    const unsubscribe = subscribe(() => {
      const pageEl = document.querySelector('.marketing-page');
      if (pageEl && pageEl.parentElement) {
        pageEl.parentElement.innerHTML = render();
        setupInteractions();
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
