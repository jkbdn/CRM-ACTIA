import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { api } from "../api.js";
import { compactDate, formatCurrency } from "../utils.js";

export default function Dashboard({ notify }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    setLoading(true);
    try {
      setData(await api.dashboard());
    } catch (error) {
      notify("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const maxValue = Math.max(...(data?.stages || []).map((stage) => stage.estimated_value), 1);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Actividad comercial, oportunidades abiertas y fechas próximas.</p>
        </div>
        <button className="button secondary" type="button" onClick={loadDashboard}>
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {loading && <div className="loading">Cargando dashboard...</div>}

      {data && (
        <>
          <div className="stats-grid">
            <Stat label="Contactos" value={data.contactsTotal} />
            <Stat label="Oportunidades abiertas" value={data.opportunitiesOpen} />
            <Stat label="Valor pipeline" value={formatCurrency(data.pipelineValue)} />
            <Stat label="Honorarios previstos" value={formatCurrency(data.expectedFees)} />
            <Stat label="Ganadas" value={data.opportunitiesWon} tone="success" />
            <Stat label="Perdidas" value={data.opportunitiesLost} tone="danger" />
          </div>

          <div className="dashboard-grid">
            <section className="panel">
              <div className="panel-header">
                <h2>Oportunidades por etapa</h2>
              </div>
              <div className="stage-list">
                {data.stages.map((stage) => (
                  <div className="stage-row" key={stage.stage}>
                    <div className="stage-row-top">
                      <span>{stage.stage}</span>
                      <strong>{stage.count}</strong>
                    </div>
                    <div className="bar-track" aria-hidden="true">
                      <span style={{ width: `${Math.max((stage.estimated_value / maxValue) * 100, stage.count ? 6 : 0)}%` }} />
                    </div>
                    <small>{formatCurrency(stage.estimated_value)}</small>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <h2>Próximas tareas</h2>
              </div>
              <div className="compact-list">
                {data.upcomingTasks.length === 0 && <p className="empty">Sin tareas próximas.</p>}
                {data.upcomingTasks.map((task) => (
                  <article key={task.id} className="compact-item">
                    <div>
                      <strong>{task.title}</strong>
                      <span>{task.opportunity_name || task.contact_name || "Sin asociación"}</span>
                    </div>
                    <time>{compactDate(task.due_date)}</time>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <h2>Propuestas próximas</h2>
              </div>
              <div className="compact-list">
                {data.upcomingProposals.length === 0 && <p className="empty">Sin propuestas próximas.</p>}
                {data.upcomingProposals.map((opportunity) => (
                  <article key={opportunity.id} className="compact-item">
                    <div>
                      <strong>{opportunity.name}</strong>
                      <span>{opportunity.client_name || "Sin cliente"}</span>
                    </div>
                    <time>{compactDate(opportunity.proposal_deadline)}</time>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </section>
  );
}

function Stat({ label, value, tone = "default" }) {
  return (
    <article className={`stat-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
