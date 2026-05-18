import React, { useEffect, useState } from "react";
import { CheckCircle2, Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { api, exportUrl } from "../api.js";
import { SelectInput, TextArea, TextInput } from "../components/FormFields.jsx";
import { formatDate } from "../utils.js";

const emptyTask = {
  title: "",
  description: "",
  contact_id: "",
  opportunity_id: "",
  owner: "",
  due_date: "",
  priority: "media",
  status: "pendiente"
};

export default function Tasks({ meta, notify }) {
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "", priority: "", owner: "" });
  const [form, setForm] = useState(emptyTask);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadTasks() {
    setLoading(true);
    try {
      setTasks(await api.tasks.list(filters));
    } catch (error) {
      notify("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [filters.search, filters.status, filters.priority, filters.owner]);

  useEffect(() => {
    api.contacts.list({}).then(setContacts).catch(() => setContacts([]));
    api.opportunities.list({}).then(setOpportunities).catch(() => setOpportunities([]));
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyTask);
    setModalOpen(true);
  }

  function openEdit(task) {
    setEditing(task.id);
    setForm({
      ...task,
      contact_id: task.contact_id ?? "",
      opportunity_id: task.opportunity_id ?? ""
    });
    setModalOpen(true);
  }

  async function submitForm(event) {
    event.preventDefault();
    const payload = {
      ...form,
      contact_id: form.contact_id || null,
      opportunity_id: form.opportunity_id || null
    };

    try {
      if (editing) {
        await api.tasks.update(editing, payload);
        notify("success", "Tarea actualizada.");
      } else {
        await api.tasks.create(payload);
        notify("success", "Tarea creada.");
      }
      setModalOpen(false);
      loadTasks();
    } catch (error) {
      notify("error", error.message);
    }
  }

  async function removeTask(task) {
    if (!window.confirm(`Eliminar "${task.title}"?`)) return;
    try {
      await api.tasks.remove(task.id);
      notify("success", "Tarea eliminada.");
      loadTasks();
    } catch (error) {
      notify("error", error.message);
    }
  }

  async function toggleComplete(task) {
    const nextStatus = task.status === "completada" ? "pendiente" : "completada";
    try {
      await api.tasks.updateStatus(task.id, nextStatus);
      notify("success", nextStatus === "completada" ? "Tarea completada." : "Tarea reabierta.");
      loadTasks();
    } catch (error) {
      notify("error", error.message);
    }
  }

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateFilters = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const contactOptions = contacts.map((contact) => ({
    value: String(contact.id),
    label: `${contact.name}${contact.company ? ` - ${contact.company}` : ""}`
  }));
  const opportunityOptions = opportunities.map((opportunity) => ({
    value: String(opportunity.id),
    label: opportunity.name
  }));

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Tareas</h1>
          <p>Seguimiento comercial asociado a contactos y oportunidades.</p>
        </div>
        <div className="actions">
          <a className="button secondary" href={exportUrl("tasks")} download="tareas.csv">
            <Download size={16} />
            CSV
          </a>
          <button className="button primary" type="button" onClick={openCreate}>
            <Plus size={16} />
            Nueva
          </button>
        </div>
      </div>

      <div className="toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            value={filters.search}
            onChange={(event) => updateFilters("search", event.target.value)}
            placeholder="Buscar tarea, contacto u oportunidad"
          />
        </label>
        <select value={filters.status} onChange={(event) => updateFilters("status", event.target.value)}>
          <option value="">Todos los estados</option>
          {meta.taskStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select value={filters.priority} onChange={(event) => updateFilters("priority", event.target.value)}>
          <option value="">Todas las prioridades</option>
          {meta.taskPriorities.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        <input value={filters.owner} onChange={(event) => updateFilters("owner", event.target.value)} placeholder="Responsable" />
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Asociación</th>
              <th>Responsable</th>
              <th>Fecha límite</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th className="table-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              tasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.title}</strong>
                    <small>{task.description || "-"}</small>
                  </td>
                  <td>{task.opportunity_name || task.contact_name || "-"}</td>
                  <td>{task.owner || "-"}</td>
                  <td>{formatDate(task.due_date)}</td>
                  <td><span className={`tag priority-${task.priority}`}>{task.priority}</span></td>
                  <td><span className={`tag status-${task.status.replace(/\s/g, "-")}`}>{task.status}</span></td>
                  <td className="row-actions">
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => toggleComplete(task)}
                      aria-label={task.status === "completada" ? "Reabrir tarea" : "Completar tarea"}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <button type="button" className="icon-button" onClick={() => openEdit(task)} aria-label="Editar tarea">
                      <Pencil size={16} />
                    </button>
                    <button type="button" className="icon-button danger" onClick={() => removeTask(task)} aria-label="Eliminar tarea">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {loading && <div className="loading">Cargando tareas...</div>}
        {!loading && tasks.length === 0 && <p className="empty">No hay tareas con esos filtros.</p>}
      </div>

      {modalOpen && (
        <div className="modal-backdrop" role="presentation">
          <form className="modal-panel" onSubmit={submitForm}>
            <div className="modal-header">
              <h2>{editing ? "Editar tarea" : "Nueva tarea"}</h2>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Cerrar">
                ×
              </button>
            </div>
            <div className="form-grid">
              <TextInput label="Título" value={form.title} onChange={(value) => updateForm("title", value)} required />
              <SelectInput
                label="Contacto asociado"
                value={String(form.contact_id ?? "")}
                onChange={(value) => updateForm("contact_id", value)}
                options={contactOptions}
              />
              <SelectInput
                label="Oportunidad asociada"
                value={String(form.opportunity_id ?? "")}
                onChange={(value) => updateForm("opportunity_id", value)}
                options={opportunityOptions}
              />
              <TextInput label="Responsable" value={form.owner} onChange={(value) => updateForm("owner", value)} />
              <TextInput label="Fecha límite" type="date" value={form.due_date} onChange={(value) => updateForm("due_date", value)} />
              <SelectInput
                label="Prioridad"
                value={form.priority}
                onChange={(value) => updateForm("priority", value)}
                options={meta.taskPriorities}
                required
              />
              <SelectInput
                label="Estado"
                value={form.status}
                onChange={(value) => updateForm("status", value)}
                options={meta.taskStatuses}
                required
              />
            </div>
            <TextArea label="Descripción" value={form.description} onChange={(value) => updateForm("description", value)} />
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
