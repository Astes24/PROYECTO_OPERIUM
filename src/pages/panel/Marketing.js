// Operium Club — Negocio: Campañas
// Pregunta: ¿a quién puedo invitar? Segmentos de la base y campañas que solo
// llegan a quien autorizó el canal y el local (Ley 29733, DS 016-2024-JUS).

import { getState, subscribe, sendCampaign } from '../../store.js';
import { getVenue } from '../../data/venues.js';
import { icon } from '../../icons.js';
import { ctxVenues, ctxLabel, fmt, pct } from '../../metrics.js';
import { pageHeader } from './ui.js';

const SEGMENTS = [
  { key: 'recurrente', label: 'Recurrentes', css: 'recurrente', desc: 'Dos o más visitas verificadas.', action: 'Beneficio preferencial' },
  { key: 'nuevo', label: 'Nuevos', css: 'nuevo', desc: 'Registrados, aún sin asistencia.', action: 'Bienvenida y primera visita' },
  { key: 'sin_interaccion', label: 'Sin actividad', css: 'inactivo', desc: 'Sin interacción en las últimas semanas.', action: 'Reactivación según gustos' },
];
const segmentLabel = (key) => SEGMENTS.find(s => s.key === key)?.label.toLowerCase() || key;

export default function Marketing() {
  let selectedId = null;

  function render() {
    const { members, campaigns, currentVenueId: ctx } = getState();
    const venueIds = ctxVenues(ctx).map(v => v.id);

    // Base: en un local, quien autorizó recibir comunicaciones de ese local
    const base = ctx === 'all' ? members : members.filter(m => m.consent.byVenue[ctx]);
    const ctxCampaigns = campaigns.filter(c => venueIds.includes(c.venueId));
    if (!ctxCampaigns.some(c => c.id === selectedId)) {
      selectedId = (ctxCampaigns.find(c => c.status === 'draft') || ctxCampaigns[0])?.id || null;
    }
    const campaign = ctxCampaigns.find(c => c.id === selectedId);

    let audit = null;
    if (campaign) {
      const venue = getVenue(campaign.venueId);
      const target = members.filter(m => m.segment === campaign.segment);
      const channelOk = (m) => (campaign.channel === 'email' ? m.consent.email : m.consent.sms);
      const venueOk = (m) => m.consent.byVenue[campaign.venueId];
      const excluded = target.filter(m => !channelOk(m) || !venueOk(m));
      const sent = campaign.status === 'sent' || campaign.status === 'completed';
      audit = {
        venue,
        target,
        eligible: target.filter(m => channelOk(m) && venueOk(m)),
        excluded,
        noChannel: target.filter(m => !channelOk(m)).length,
        noVenue: target.filter(m => !venueOk(m)).length,
        sent,
        channel: campaign.channel === 'email' ? 'email' : 'SMS',
      };
    }


    return `
      <div class="panel-page nb-page marketing-page">
        ${pageHeader({
          title: 'Campañas',
          aside: `
            <dl class="vt-kpis">
              <div><dt>${ctx === 'all' ? 'Miembros' : `Autorizan a ${ctxLabel(ctx)}`}</dt><dd>${fmt(base.length)}</dd></div>
              <div><dt>Aceptan email</dt><dd>${fmt(base.filter(m => m.consent.email).length)}</dd></div>
            </dl>
          `,
        })}

        <section class="nb-block">
          <div class="mk-segbar" role="img" aria-label="Segmentos de la base">
            ${SEGMENTS.map(sg => `<span class="mk-segbar__part mk-segbar__part--${sg.css}" style="width: ${pct(base.filter(m => m.segment === sg.key).length, base.length)}%;"></span>`).join('')}
          </div>
          <div class="mk-segments">
            ${SEGMENTS.map(sg => {
              const list = base.filter(m => m.segment === sg.key);
              return `
                <div class="mk-segment">
                  <span class="vt-fact__label"><span class="mk-swatch mk-swatch--${sg.css}"></span>${sg.label}</span>
                  <span class="mk-segment__value">${list.length}<small>${pct(list.length, base.length)}%</small></span>
                  <p>${sg.desc}</p>
                </div>
              `;
            }).join('')}
          </div>
        </section>

        ${campaign ? `
          <section class="vt-panel mk-campaign" id="card-campaign">
            ${ctxCampaigns.length > 1 ? `
              <div class="nb-filter mk-campaign__picker" role="group" aria-label="Campañas">
                ${ctxCampaigns.map(c => `
                  <button type="button" class="nb-filter__opt ${c.id === selectedId ? 'nb-filter__opt--active' : ''}" data-campaign="${c.id}">
                    ${getVenue(c.venueId)?.icon || ''}${c.name.split(' — ')[0]}
                  </button>
                `).join('')}
              </div>
            ` : ''}
            <div class="mk-campaign__head">
              <div>
                <span class="section-title__eyebrow">${audit.venue?.name} · ${audit.channel} · ${segmentLabel(campaign.segment)}</span>
                <h2 class="vt-panel__title">${campaign.name}</h2>
              </div>
              ${!audit.sent ? `
                <button type="button" class="btn btn--primary btn--lg btn-send-campaign" data-campaign-id="${campaign.id}">
                  ${icon('mail', { size: 18 })} Enviar campaña
                </button>
              ` : `
                <span class="badge badge--success">${icon('check', { size: 12 })} ${campaign.status === 'completed' ? 'Completada' : 'Enviada'}</span>
              `}
            </div>

            <div class="mk-campaign__grid">
              <div class="mk-mail">
                <div class="mk-mail__meta">
                  <span>De: club@operium.club</span>
                  <span>Asunto: ${campaign.name.split(' — ')[1] || campaign.name}</span>
                </div>
                <p class="mk-mail__body">${campaign.message.replace('{{nombre}}', '<mark>{{nombre}}</mark>')}</p>
              </div>

              <div class="mk-audit">
                <div class="mk-audit__totals">
                  <div>
                    <span class="vt-fact__label">Reciben</span>
                    <span class="mk-audit__value">${audit.sent ? campaign.eligibleCount : audit.eligible.length}</span>
                  </div>
                  <div>
                    <span class="vt-fact__label">Excluidos</span>
                    <span class="mk-audit__value mk-audit__value--off">${audit.sent ? campaign.excludedCount : audit.excluded.length}</span>
                  </div>
                </div>
                <ul class="mk-audit__reasons">
                  <li><span>Sin permiso de ${audit.channel}</span><strong>${audit.noChannel}</strong></li>
                  <li><span>Sin permiso para ${audit.venue?.name}</span><strong>${audit.noVenue}</strong></li>
                </ul>
                <p class="mk-audit__sample">Ley 29733 · DS 016-2024-JUS</p>
              </div>
            </div>

            ${audit.sent ? `
              <div class="mk-results">
                <div><span class="vt-fact__label">Enviados</span><strong>${campaign.eligibleCount}</strong></div>
                <div><span class="vt-fact__label">Aperturas</span><strong>${campaign.responses?.opened ?? 0}</strong></div>
                <div><span class="vt-fact__label">Clics</span><strong>${campaign.responses?.clicked ?? 0}</strong></div>
                <div><span class="vt-fact__label">Guardados</span><strong>${campaign.responses?.saved ?? 0}</strong></div>
                ${campaign.status === 'completed' ? '' : '<p>Respuesta simulada</p>'}
              </div>
            ` : ''}
          </section>
        ` : `<p class="vt-panel__note">No hay campañas para ${ctxLabel(ctx)}.</p>`}

        <section class="nb-block">
          <div class="nb-block__head">
            <h2 class="vt-panel__title">Historial</h2>
          </div>
          <div class="table-responsive">
            <table class="vt-table nb-table">
              <thead>
                <tr><th>Campaña</th><th>Local</th><th>Estado</th><th>Enviados</th><th>Aperturas</th><th>Clics</th><th>Guardados</th></tr>
              </thead>
              <tbody>
                ${ctxCampaigns.map(c => {
                  const venue = getVenue(c.venueId) || { name: c.venueId, icon: '' };
                  const done = c.status === 'completed' || c.status === 'sent';
                  return `
                    <tr>
                      <td data-label="Campaña"><strong>${c.name}</strong><small>${c.channel === 'email' ? 'Email' : 'SMS'} · ${segmentLabel(c.segment)}</small></td>
                      <td data-label="Local"><span class="mk-venue">${venue.icon}${venue.name}</span></td>
                      <td data-label="Estado"><span class="badge ${done ? 'badge--success' : 'badge--warning'}">${c.status === 'completed' ? 'Completada' : c.status === 'sent' ? 'Enviada' : 'Borrador'}</span></td>
                      <td data-label="Enviados">${done ? c.eligibleCount : '—'}</td>
                      <td data-label="Aperturas">${done ? c.responses?.opened ?? '—' : '—'}</td>
                      <td data-label="Clics">${done ? c.responses?.clicked ?? '—' : '—'}</td>
                      <td data-label="Guardados">${done ? c.responses?.saved ?? '—' : '—'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    `;
  }

  function mount() {
    function rerender() {
      const el = document.querySelector('.marketing-page');
      if (el?.parentElement) {
        el.parentElement.innerHTML = render();
        setup();
      }
    }
    function setup() {
      document.querySelectorAll('.marketing-page [data-campaign]').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedId = btn.dataset.campaign;
          rerender();
        });
      });
      document.querySelector('.marketing-page .btn-send-campaign')?.addEventListener('click', (e) => {
        sendCampaign(e.currentTarget.dataset.campaignId);
      });
    }
    setup();
    const unsubscribe = subscribe(rerender);
    return () => unsubscribe();
  }

  return { html: render(), mount };
}
