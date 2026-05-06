import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { api } from "../api.js";
import { compactDate, formatCurrency, formatNumber } from "../utils.js";

export default function Pipeline({ meta, notify }) {
  const [opportunities, setOpportunities] = useState([]);
  const [filters, setFilters] = useState({ search: "", owner: "", project_type: "" });
  const [loading, setLoading] = useState(false);

  async function loadPipeline() {
    setLoading(true);
    try {
      setOpportunities(await api.opportunities.list(filters));
    } catch (error) {
      notify("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPipeline();
  }, [filters.search, filters.owner, filters.project_type]);

  const grouped = useMemo(() => {
    return meta.pipelineStages.reduce((acc, stage) => {
      acc[stage] = opportunities.filter((opportunity) => opportunity.stage === stage);
      return acc;
    }, {});
  }, [opportunities, meta.pipelineStages]);

  async function changeStage(opportunity, stage) {
    try {
      const updated = await api.opportunities.updateStage(opportunity.id, stage);
      setOpportunities((items) => items.map((item) => (item.id === opportunity.id ? updated : item)));
      notify("success", "Etapa actualizada.");
    } catch (error) {
      notify("error", error.message);
    }
  }

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <section className="page pipeline-page">
      <div className="page-header">
        <div>
          <h1>Pipeline</h1>
          <p>Kanban comercial por etapa de oportunidad.</p>
        </div>
      </div>

      <div className="toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Buscar oportunidad, cliente o ubicación"
          />
        </label>
        <input value={filters.owner} onChange={(event) => updateFilter("owner", event.target.value)} placeholder="Responsable" />
        <select value={filters.project_type} onChange={(event) => updateFilter("project_type", event.target.value)}>
          <option value="">Todos los tipos</option>
          {meta.projectTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="loading">Cargando pipeline...</div>}

      <div className="kanban-board">
        {meta.pipelineStages.map((stage) => (
          <section className="kanban-column" key={stage}>
            <div className="kanban-column-header">
              <h2>{stage}</h2>
              <span>{grouped[stage]?.length || 0}</span>
            </div>
            <div className="kanban-list">
              {(grouped[stage] || []).map((opportunity) => (
                <article className="kanban-card" key={opportunity.id}>
                  <div className="kanban-card-header">
                    <strong>{opportunity.name}</strong>
                    <span>{opportunity.project_type}</span>
                  </div>
                  <dl>
                    <div>
                      <dt>Cliente</dt>
                      <dd>{opportunity.client_name || "-"}</dd>
                    </div>
                    <div>
                      <dt>Honorarios</dt>
                      <dd>{formatCurrency(opportunity.expected_fees)}</dd>
                    </div>
                    <div>
                      <dt>Prob.</dt>
                      <dd>{formatNumber(opportunity.probability)}%</dd>
                    </div>
                    <div>
                      <dt>Propuesta</dt>
                      <dd>{compactDate(opportunity.proposal_deadline)}</dd>
                    </div>
                    <div>
                      <dt>Responsable</dt>
                      <dd>{opportunity.internal_owner || "-"}</dd>
                    </div>
                  </dl>
                  <label className="stage-select">
                    <span>Etapa</span>
                    <select value={opportunity.stage} onChange={(event) => changeStage(opportunity, event.target.value)}>
                      {meta.pipelineStages.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </article>
              ))}
              {(grouped[stage] || []).length === 0 && <p className="empty-column">Sin oportunidades</p>}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
