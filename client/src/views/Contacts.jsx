import React, { useEffect, useState } from "react";
import { Download, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { api, exportUrl } from "../api.js";
import { Field, SelectInput, TextArea, TextInput } from "../components/FormFields.jsx";
import { formatDate } from "../utils.js";

const emptyContact = {
  name: "",
  company: "",
  email: "",
  phone: "",
  position: "",
  contact_type: "cliente potencial",
  source: "web",
  notes: ""
};

export default function Contacts({ meta, notify }) {
  const [contacts, setContacts] = useState([]);
  const [filters, setFilters] = useState({ search: "", type: "", source: "" });
  const [form, setForm] = useState(emptyContact);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadContacts() {
    setLoading(true);
    try {
      setContacts(await api.contacts.list(filters));
    } catch (error) {
      notify("error", error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadContacts();
  }, [filters.search, filters.type, filters.source]);

  function openCreate() {
    setEditing(null);
    setForm(emptyContact);
    setModalOpen(true);
  }

  function openEdit(contact) {
    setEditing(contact.id);
    setForm(contact);
    setModalOpen(true);
  }

  async function submitForm(event) {
    event.preventDefault();
    try {
      if (editing) {
        await api.contacts.update(editing, form);
        notify("success", "Contacto actualizado.");
      } else {
        await api.contacts.create(form);
        notify("success", "Contacto creado.");
      }
      setModalOpen(false);
      loadContacts();
    } catch (error) {
      notify("error", error.message);
    }
  }

  async function removeContact(contact) {
    if (!window.confirm(`Eliminar a ${contact.name}?`)) return;
    try {
      await api.contacts.remove(contact.id);
      notify("success", "Contacto eliminado.");
      loadContacts();
    } catch (error) {
      notify("error", error.message);
    }
  }

  async function importContacts(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const result = await api.importCsv("contacts", await file.text());
      notify("success", `${result.imported} contactos importados.`);
      loadContacts();
    } catch (error) {
      notify("error", error.message);
    } finally {
      event.target.value = "";
    }
  }

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateFilters = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Contactos</h1>
          <p>Clientes, promotores, instituciones y colaboradores.</p>
        </div>
        <div className="actions">
          <a className="button secondary" href={exportUrl("contacts")} download="contactos.csv">
            <Download size={16} />
            CSV
          </a>
          <label className="button secondary file-button">
            <Upload size={16} />
            Importar
            <input type="file" accept=".csv,text/csv" onChange={importContacts} />
          </label>
          <button className="button primary" type="button" onClick={openCreate}>
            <Plus size={16} />
            Nuevo
          </button>
        </div>
      </div>

      <div className="toolbar">
        <label className="search-field">
          <Search size={16} />
          <input
            value={filters.search}
            onChange={(event) => updateFilters("search", event.target.value)}
            placeholder="Buscar contacto, empresa o email"
          />
        </label>
        <select value={filters.type} onChange={(event) => updateFilters("type", event.target.value)}>
          <option value="">Todos los tipos</option>
          {meta.contactTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select value={filters.source} onChange={(event) => updateFilters("source", event.target.value)}>
          <option value="">Todas las fuentes</option>
          {meta.contactSources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Empresa</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Tipo</th>
              <th>Fuente</th>
              <th>Actualizado</th>
              <th className="table-actions">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>
                    <strong>{contact.name}</strong>
                    <small>{contact.position || "-"}</small>
                  </td>
                  <td>{contact.company || "-"}</td>
                  <td>{contact.email || "-"}</td>
                  <td>{contact.phone || "-"}</td>
                  <td><span className="tag">{contact.contact_type}</span></td>
                  <td>{contact.source}</td>
                  <td>{formatDate(contact.updated_at?.slice(0, 10))}</td>
                  <td className="row-actions">
                    <button type="button" className="icon-button" onClick={() => openEdit(contact)} aria-label="Editar contacto">
                      <Pencil size={16} />
                    </button>
                    <button type="button" className="icon-button danger" onClick={() => removeContact(contact)} aria-label="Eliminar contacto">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {loading && <div className="loading">Cargando contactos...</div>}
        {!loading && contacts.length === 0 && <p className="empty">No hay contactos con esos filtros.</p>}
      </div>

      {modalOpen && (
        <div className="modal-backdrop" role="presentation">
          <form className="modal-panel" onSubmit={submitForm}>
            <div className="modal-header">
              <h2>{editing ? "Editar contacto" : "Nuevo contacto"}</h2>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Cerrar">
                ×
              </button>
            </div>
            <div className="form-grid">
              <TextInput label="Nombre" value={form.name} onChange={(value) => updateForm("name", value)} required />
              <TextInput label="Empresa" value={form.company} onChange={(value) => updateForm("company", value)} />
              <TextInput label="Email" type="email" value={form.email} onChange={(value) => updateForm("email", value)} />
              <TextInput label="Teléfono" value={form.phone} onChange={(value) => updateForm("phone", value)} />
              <TextInput label="Cargo" value={form.position} onChange={(value) => updateForm("position", value)} />
              <SelectInput
                label="Tipo de contacto"
                value={form.contact_type}
                onChange={(value) => updateForm("contact_type", value)}
                options={meta.contactTypes}
                required
                emptyLabel="Selecciona tipo"
              />
              <SelectInput
                label="Fuente"
                value={form.source}
                onChange={(value) => updateForm("source", value)}
                options={meta.contactSources}
                required
                emptyLabel="Selecciona fuente"
              />
              <Field label="Fechas">
                <div className="readonly-stack">
                  <span>Creado: {formatDate(form.created_at?.slice(0, 10))}</span>
                  <span>Actualizado: {formatDate(form.updated_at?.slice(0, 10))}</span>
                </div>
              </Field>
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
