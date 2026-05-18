import React, { useEffect, useState } from "react";
import { Download, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { api, exportUrl } from "../api.js";
import { Field, SelectInput, TextArea, TextInput } from "../components/FormFields.jsx";
import { formatCurrency, formatDate, formatNumber } from "../utils.js";

const emptyOpportunity = {
  name: "",
  contact_id: "",
  company: "",
  project_type: "residencial",
  location: "",
  estimated_area: "",
  client_budget: "",
  expected_fees: "",
  estimated_value: "",
  probability: 50,
  expected_close_date: "",
  proposal_deadline: "",
  internal_owner: "",
  stage: "Lead recibido",
  notes: ""
};

export default function Opportunities({ meta, notify }) {
  const [opportunities, setOpportunities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    stage: "",
    owner: "",
    project_type: "",
    close_from: "",
    close_to: "",
    proposal_from: "",
    proposal_to: ""
  });
  const [form, setForm] = useState(emptyOpportunity);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadOpportunities() {
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
    loadOpportunities();
  }, [
    filters.search,
    filters.stage,
    filters.owner,
    filters.project_type,
    filters.close_from,
    filters.close_to,
    filters.proposal_from,
    filters.proposal_to
  ]);

  useEffect(() => {
    api.contacts.list({}).then(setContacts).catch(() => setContacts([]));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyOpportunity);
    setModalOpen(true);
  }

  function openEdit(opportunity) {
    setEditing(opportunity.id);
    setForm({
      ...opportunity,
      contact_id: opportunity.contact_id ?? ""
    });
    setModalOpen(true);
  }

  async function submitForm(event) {
    event.preventDefault();
    const payload = { ...form, contact_id: form.contact_id || null };
    try {
      if (editing) {
        await api.opportunities.update(editing, payload);
        notify("success", "Oportunidad actualizada.");
      } else {
        await api.opportunities.create(payload);
        notify("success", "Oportunidad creada.");
      }
      setModalOpen(false);
      loadOpportunities();
    } catch (error) {
      notify("error", error.message);
    }
  }

  async function removeOpportunity(opportunity) {
    if (!window.confirm(`Eliminar "${opportunity.name}"?`)) return;
    try {
      await api.opportunities.remove(opportunity.id);
      notify("success", "Oportunidad eliminada.");
      loadOpportunities();
    } catch (error) {
      notify("error", error.message);
    }
  }

  async function importOpportunities(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const result = await api.importCsv("opportunities", await file.text());
      notify("success", `${result.imported} oportunidades importadas.`);
      loadOpportunities();
    } catch (error) {
      notify("error", error.message);
    } finally {
      event.target.value = "";
    }
  }

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateFilters = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const contactOptions = contacts.map((contact) => ({
    value: String(contact.id),
    label: `${contact.name}${contact.company ? ` - ${contact.company}` : ""}`
  }));

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Oportunidades</h1>
          <p>Propuestas, fechas límite, honorarios y responsables.</p>
        </div>
        <div className="actions">
          <a className="button secondary" href={exportUrl("opportunities")} download="oportunidades.csv">
            <Download size={16} />
            CSV
          </a>
          <label className="button secondary file-button">
            <Upload size={16} />
            Importar
            <input type="file" accept=".csv,text/csv" onChange={importOpportunities} />
          </label>
          <button className="button primary" type="button" onClick={openCreate}>
            <Plus size={16} />
            Nueva
          </button>
        </div>
      </div>

      <div className="toolbar toolbar-wide">
        <label className="search-field">
          <Search size={16} />
          <input
            value={filters.search}
            onChange={(event) => updateFilters("search", event.target.value)}
            placeholder="Buscar oportunidad, cliente o ubicación"
          />
        </label>
        <select value={filters.stage} onChange={(event) => updateFilters("stage", event.target.value)}>
          <option value="">Todas las etapas</option>
          {meta.pipelineStages.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>
        <select value={filters.project_type} onChange={(event) => updateFilters("project_type", event.target.value)}>
          <option value="">Todos los tipos</option>
          {meta.projectTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input value={filters.owner} onChange={(event) => updateFilters("owner", event.target.value)} placeholder="Responsable" />
        <input type="date" value={filters.close_from} onChange={(event) => updateFilters("close_from", event.target.value)} />
        <input type="date" value={filters.close_to} onChange={(event) => updateFilters("close_to", event.target.value)} />
        <input type="date" value={filters.proposal_from} onChange={(event) => updateFilters("proposal_from", event.target.value)} />
        <input type="date" value={filters.proposal_to} onChange={(event) => updateFilters("proposal_to", event.target.value)} />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Oportunidad</th>
              <th>Cliente</th>
              <th>Tipo</th>
              <th>Ubicación</th>
              <th>Honorarios</th>
              <th>Prob.</th>
              <th>Cierre</th>
              <th>Propuesta</th>
              <th>Etapa</th>
              <th className="table-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              opportunities.map((opportunity) => (
                <tr key={opportunity.id}>
                  <td>
                    <strong>{opportunity.name}</strong>
                    <small>{opportunity.internal_owner || "Sin responsable"}</small>
                  </td>
                  <td>{opportunity.client_name || "-"}</td>
                  <td><span className="tag">{opportunity.project_type}</span></td>
                  <td>{opportunity.location || "-"}</td>
                  <td>{formatCurrency(opportunity.expected_fees)}</td>
                  <td>{formatNumber(opportunity.probability)}%</td>
                  <td>{formatDate(opportunity.expected_close_date)}</td>
                  <td>{formatDate(opportunity.proposal_deadline)}</td>
                  <td><span className="tag stage-tag">{opportunity.stage}</span></td>
                  <td className="row-actions">
                    <button type="button" className="icon-button" onClick={() => openEdit(opportunity)} aria-label="Editar oportunidad">
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      onClick={() => removeOpportunity(opportunity)}
                      aria-label="Eliminar oportunidad"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {loading && <div className="loading">Cargando oportunidades...</div>}
        {!loading && opportunities.length === 0 && <p className="empty">No hay oportunidades con esos filtros.</p>}
      </div>

      {modalOpen && (
        <div className="modal-backdrop" role="presentation">
          <form className="modal-panel wide-modal" onSubmit={submitForm}>
            <div className="modal-header">
              <h2>{editing ? "Editar oportunidad" : "Nueva oportunidad"}</h2>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Cerrar">
                ×
              </button>
            </div>
            <div className="form-grid">
              <TextInput label="Nombre" value={form.name} onChange={(value) => updateForm("name", value)} required />
              <SelectInput
                label="Contacto asociado"
                value={String(form.contact_id ?? "")}
                onChange={(value) => updateForm("contact_id", value)}
                options={contactOptions}
              />
              <TextInput label="Empresa asociada" value={form.company} onChange={(value) => updateForm("company", value)} />
              <SelectInput
                label="Tipo de proyecto"
                value={form.project_type}
                onChange={(value) => updateForm("project_type", value)}
                options={meta.projectTypes}
                required
                emptyLabel="Selecciona tipo"
              />
              <TextInput label="Ubicación" value={form.location} onChange={(value) => updateForm("location", value)} />
              <TextInput
                label="Superficie estimada"
                type="number"
                min="0"
                value={form.estimated_area}
                onChange={(value) => updateForm("estimated_area", value)}
              />
              <TextInput
                label="Presupuesto cliente"
                type="number"
                min="0"
                value={form.client_budget}
                onChange={(value) => updateForm("client_budget", value)}
              />
              <TextInput
                label="Honorarios previstos"
                type="number"
                min="0"
                value={form.expected_fees}
                onChange={(value) => updateForm("expected_fees", value)}
              />
              <TextInput
                label="Valor estimado"
                type="number"
                min="0"
                value={form.estimated_value}
                onChange={(value) => updateForm("estimated_value", value)}
              />
              <TextInput
                label="Probabilidad"
                type="number"
                min="0"
                max="100"
                value={form.probability}
                onChange={(value) => updateForm("probability", value)}
              />
              <TextInput
                label="Fecha prevista de cierre"
                type="date"
                value={form.expected_close_date}
                onChange={(value) => updateForm("expected_close_date", value)}
              />
              <TextInput
                label="Fecha límite de propuesta"
                type="date"
                value={form.proposal_deadline}
                onChange={(value) => updateForm("proposal_deadline", value)}
              />
              <TextInput label="Responsable interno" value={form.internal_owner} onChange={(value) => updateForm("internal_owner", value)} />
              <SelectInput
                label="Etapa"
                value={form.stage}
                onChange={(value) => updateForm("stage", value)}
                options={meta.pipelineStages}
                required
                emptyLabel="Selecciona etapa"
              />
            </div>
            <TextArea label="Notas" value={form.notes} onChange={(value) => updateForm("notes", value)} />
            <div className="modal-actions">
              <button className="button secondary" type="button" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button className="button primary" type="submit">
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
