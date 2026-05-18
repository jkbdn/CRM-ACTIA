import { FALLBACK_META } from "./constants.js";

const STORAGE_KEY = "arquitectura-crm-static-v1";

const toDate = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
};

const nowIso = () => new Date().toISOString();

const seed = () => {
  const timestamp = nowIso();
  return {
    contacts: [
      {
        id: 1,
        name: "Laura Benitez",
        company: "Habitat Norte",
        email: "laura.benitez@habitatnorte.example",
        phone: "+34 600 100 201",
        position: "Directora de expansion",
        contact_type: "promotor",
        source: "referido",
        notes: "Interesada en promociones residenciales de escala media.",
        created_at: timestamp,
        updated_at: timestamp
      },
      {
        id: 2,
        name: "Miguel Arroyo",
        company: "Arroyo Hoteles",
        email: "miguel.arroyo@arroyohoteles.example",
        phone: "+34 600 100 202",
        position: "CEO",
        contact_type: "cliente potencial",
        source: "evento",
        notes: "Quiere renovar dos establecimientos urbanos.",
        created_at: timestamp,
        updated_at: timestamp
      },
      {
        id: 3,
        name: "Clara Vidal",
        company: "Vidal Patrimonio",
        email: "clara.vidal@vidalpatrimonio.example",
        phone: "+34 600 100 203",
        position: "Responsable de activos",
        contact_type: "cliente actual",
        source: "cliente recurrente",
        notes: "Cliente con proyectos de rehabilitacion en curso.",
        created_at: timestamp,
        updated_at: timestamp
      },
      {
        id: 4,
        name: "Javier Soler",
        company: "Soler Inversiones",
        email: "javier.soler@solerinversiones.example",
        phone: "+34 600 100 204",
        position: "Socio",
        contact_type: "cliente recurrente",
        source: "LinkedIn",
        notes: "Busca oportunidades de oficinas flexibles.",
        created_at: timestamp,
        updated_at: timestamp
      },
      {
        id: 5,
        name: "Aina Torres",
        company: "Ayuntamiento de Liria",
        email: "aina.torres@liria.example",
        phone: "+34 600 100 205",
        position: "Tecnica de urbanismo",
        contact_type: "institución",
        source: "contacto institucional",
        notes: "Contacto clave para concursos publicos.",
        created_at: timestamp,
        updated_at: timestamp
      },
      {
        id: 6,
        name: "Pablo Martin",
        company: "Martin Retail Group",
        email: "pablo.martin@martinretail.example",
        phone: "+34 600 100 206",
        position: "Director inmobiliario",
        contact_type: "cliente potencial",
        source: "web",
        notes: "Interes en locales comerciales de alto transito.",
        created_at: timestamp,
        updated_at: timestamp
      },
      {
        id: 7,
        name: "Ines Romero",
        company: "Romero Interiorismo",
        email: "ines.romero@romerointeriorismo.example",
        phone: "+34 600 100 207",
        position: "Fundadora",
        contact_type: "colaborador",
        source: "referido",
        notes: "Colaboradora para proyectos de interiorismo hotelero.",
        created_at: timestamp,
        updated_at: timestamp
      },
      {
        id: 8,
        name: "Diego Paredes",
        company: "Paredes Living",
        email: "diego.paredes@paredesliving.example",
        phone: "+34 600 100 208",
        position: "Promotor",
        contact_type: "promotor",
        source: "concurso",
        notes: "Perfil muy orientado a vivienda colectiva.",
        created_at: timestamp,
        updated_at: timestamp
      }
    ],
    opportunities: [
      makeOpportunity(1, "Residencial Jardin Norte", 1, "Habitat Norte", "residencial", "Valencia", 4200, 6800000, 245000, 65, 35, 9, "Marta", "Propuesta económica enviada"),
      makeOpportunity(2, "Rehabilitacion Casa Vidal", 3, "Vidal Patrimonio", "rehabilitación", "Madrid", 1200, 1900000, 98000, 80, 18, 6, "Sergio", "Negociación"),
      makeOpportunity(3, "Hotel Boutique Centro", 2, "Arroyo Hoteles", "hotelero", "Sevilla", 3100, 5200000, 210000, 45, 52, 13, "Lucia", "Reunión con cliente"),
      makeOpportunity(4, "Oficinas Flex Soler", 4, "Soler Inversiones", "oficinas", "Barcelona", 2600, 3600000, 165000, 55, 42, 17, "Marta", "Solicitud de documentación"),
      makeOpportunity(5, "Concurso Centro Civico Liria", 5, "Ayuntamiento de Liria", "concurso", "Liria", 1800, 2800000, 125000, 30, 70, 21, "Sergio", "Lead recibido"),
      makeOpportunity(6, "Retail Gran Via", 6, "Martin Retail Group", "terciario", "Madrid", 900, 1100000, 72000, 60, 24, 8, "Lucia", "Primer contacto"),
      makeOpportunity(7, "Plan Parcial Sector Este", 8, "Paredes Living", "urbanismo", "Castellon", 52000, 9500000, 310000, 40, 90, 28, "Diego", "Solicitud de documentación"),
      makeOpportunity(8, "Interiorismo Suites Arroyo", 7, "Arroyo Hoteles", "interiorismo", "Malaga", 650, 850000, 64000, 50, 31, 10, "Lucia", "Propuesta económica enviada"),
      makeOpportunity(9, "Viviendas Paredes Living", 8, "Paredes Living", "residencial", "Alicante", 7800, 12200000, 420000, 95, -5, -35, "Marta", "Encargo aceptado"),
      makeOpportunity(10, "Hotel Costa Reforma", 2, "Arroyo Hoteles", "hotelero", "Cadiz", 4100, 6100000, 230000, 15, -12, -45, "Sergio", "Encargo perdido")
    ].map((item) => ({ ...item, created_at: timestamp, updated_at: timestamp })),
    tasks: [
      makeTask(1, "Llamar a Laura para resolver dudas de honorarios", "Revisar alcance de fases y confirmar calendario.", 1, 1, "Marta", 2, "alta", "pendiente"),
      makeTask(2, "Enviar comparativa de opciones de fachada", "Preparar PDF con tres alternativas sinteticas.", 3, 2, "Sergio", 4, "media", "en curso"),
      makeTask(3, "Solicitar programa funcional hotelero", "Pedir numero de habitaciones y servicios previstos.", 2, 3, "Lucia", 5, "alta", "pendiente"),
      makeTask(4, "Revisar mediciones de oficinas", "Contrastar planos recibidos con superficie util.", 4, 4, "Marta", 7, "media", "pendiente"),
      makeTask(5, "Comprobar publicacion de bases del concurso", "Verificar plataforma municipal y descargar anexos.", 5, 5, "Sergio", 9, "media", "pendiente"),
      makeTask(6, "Preparar propuesta express retail", "Definir honorarios y fases minimas.", 6, 6, "Lucia", 3, "alta", "en curso"),
      makeTask(7, "Agendar visita al sector este", "Coordinar disponibilidad con Paredes Living.", 8, 7, "Diego", 12, "baja", "pendiente"),
      makeTask(8, "Reunion de coordinacion interiorismo", "Alinear entregables con Romero Interiorismo.", 7, 8, "Lucia", 6, "media", "pendiente"),
      makeTask(9, "Actualizar contrato viviendas Paredes", "Incluir hitos de pago y calendario de proyecto.", 8, 9, "Marta", 1, "alta", "en curso"),
      makeTask(10, "Archivar propuesta Hotel Costa", "Dejar notas de aprendizaje comercial.", 2, 10, "Sergio", -2, "baja", "completada"),
      makeTask(11, "Actualizar datos de contacto institucional", "Confirmar telefono directo y cargo actual.", 5, null, "Sergio", 14, "baja", "pendiente"),
      makeTask(12, "Enviar email de seguimiento a Javier", "Preguntar por documentos tecnicos pendientes.", 4, 4, "Marta", 2, "media", "pendiente")
    ].map((item) => ({ ...item, created_at: timestamp, updated_at: timestamp }))
  };
};

function makeOpportunity(
  id,
  name,
  contact_id,
  company,
  project_type,
  location,
  estimated_area,
  client_budget,
  expected_fees,
  probability,
  closeOffset,
  proposalOffset,
  internal_owner,
  stage
) {
  return {
    id,
    name,
    contact_id,
    company,
    project_type,
    location,
    estimated_area,
    client_budget,
    expected_fees,
    estimated_value: expected_fees,
    probability,
    expected_close_date: toDate(closeOffset),
    proposal_deadline: toDate(proposalOffset),
    internal_owner,
    stage,
    notes: ""
  };
}

function makeTask(id, title, description, contact_id, opportunity_id, owner, dueOffset, priority, status) {
  return {
    id,
    title,
    description,
    contact_id,
    opportunity_id,
    owner,
    due_date: toDate(dueOffset),
    priority,
    status
  };
}

export const localApi = {
  meta: async () => FALLBACK_META,
  dashboard: async () => dashboard(),
  contacts: {
    list: async (filters) => listContacts(filters),
    create: async (data) => createRecord("contacts", normalizeContact(data)),
    update: async (id, data) => updateRecord("contacts", id, normalizeContact(data)),
    remove: async (id) => deleteContact(id)
  },
  opportunities: {
    list: async (filters) => listOpportunities(filters),
    create: async (data) => createRecord("opportunities", normalizeOpportunity(data)),
    update: async (id, data) => updateRecord("opportunities", id, normalizeOpportunity(data)),
    updateStage: async (id, stage) => updateOpportunityStage(id, stage),
    remove: async (id) => deleteOpportunity(id)
  },
  tasks: {
    list: async (filters) => listTasks(filters),
    create: async (data) => createRecord("tasks", normalizeTask(data)),
    update: async (id, data) => updateRecord("tasks", id, normalizeTask(data)),
    updateStatus: async (id, status) => updateTaskStatus(id, status),
    remove: async (id) => deleteRecord("tasks", id)
  },
  importCsv: async (type, text) => importCsv(type, text)
};

export function localExportUrl(type) {
  const state = getState();
  const rows = {
    contacts: state.contacts,
    opportunities: listOpportunities({}),
    tasks: listTasks({})
  }[type];
  const headers = {
    contacts: contactHeaders,
    opportunities: opportunityHeaders,
    tasks: taskHeaders
  }[type];

  return `data:text/csv;charset=utf-8,${encodeURIComponent(toCsv(headers, rows || []))}`;
}

function getState() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = seed();
    setState(initial);
    return initial;
  }
  try {
    return JSON.parse(raw);
  } catch {
    const initial = seed();
    setState(initial);
    return initial;
  }
}

function setState(state) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function listContacts(filters = {}) {
  const state = getState();
  return state.contacts
    .filter((contact) => matchText(filters.search, contact.name, contact.company, contact.email, contact.phone, contact.position))
    .filter((contact) => !filters.type || contact.contact_type === filters.type)
    .filter((contact) => !filters.source || contact.source === filters.source)
    .sort(sortUpdated);
}

function listOpportunities(filters = {}) {
  const state = getState();
  return state.opportunities
    .map((opportunity) => enrichOpportunity(opportunity, state.contacts))
    .filter((opportunity) =>
      matchText(filters.search, opportunity.name, opportunity.company, opportunity.location, opportunity.contact_name, opportunity.contact_company)
    )
    .filter((opportunity) => !filters.stage || opportunity.stage === filters.stage)
    .filter((opportunity) => !filters.owner || includesText(opportunity.internal_owner, filters.owner))
    .filter((opportunity) => !filters.project_type || opportunity.project_type === filters.project_type)
    .filter((opportunity) => !filters.close_from || opportunity.expected_close_date >= filters.close_from)
    .filter((opportunity) => !filters.close_to || opportunity.expected_close_date <= filters.close_to)
    .filter((opportunity) => !filters.proposal_from || opportunity.proposal_deadline >= filters.proposal_from)
    .filter((opportunity) => !filters.proposal_to || opportunity.proposal_deadline <= filters.proposal_to)
    .sort(sortUpdated);
}

function listTasks(filters = {}) {
  const state = getState();
  const statusRank = { pendiente: 0, "en curso": 1, completada: 2 };
  return state.tasks
    .map((task) => enrichTask(task, state.contacts, state.opportunities))
    .filter((task) => matchText(filters.search, task.title, task.description, task.contact_name, task.opportunity_name))
    .filter((task) => !filters.status || task.status === filters.status)
    .filter((task) => !filters.priority || task.priority === filters.priority)
    .filter((task) => !filters.owner || includesText(task.owner, filters.owner))
    .sort((a, b) => {
      const statusDiff = (statusRank[a.status] ?? 3) - (statusRank[b.status] ?? 3);
      if (statusDiff) return statusDiff;
      return String(a.due_date || "").localeCompare(String(b.due_date || ""));
    });
}

function dashboard() {
  const state = getState();
  const closed = new Set(["Encargo aceptado", "Encargo perdido"]);
  const open = state.opportunities.filter((opportunity) => !closed.has(opportunity.stage));
  const today = new Date().toISOString().slice(0, 10);
  const stages = FALLBACK_META.pipelineStages.map((stage) => {
    const items = state.opportunities.filter((opportunity) => opportunity.stage === stage);
    return {
      stage,
      count: items.length,
      estimated_value: sum(items, "estimated_value")
    };
  });

  return {
    contactsTotal: state.contacts.length,
    opportunitiesOpen: open.length,
    pipelineValue: sum(open, "estimated_value"),
    expectedFees: sum(open, "expected_fees"),
    opportunitiesWon: state.opportunities.filter((item) => item.stage === "Encargo aceptado").length,
    opportunitiesLost: state.opportunities.filter((item) => item.stage === "Encargo perdido").length,
    upcomingTasks: listTasks({}).filter((task) => task.status !== "completada" && task.due_date >= today).slice(0, 6),
    upcomingProposals: listOpportunities({})
      .filter((opportunity) => !closed.has(opportunity.stage) && opportunity.proposal_deadline >= today)
      .sort((a, b) => a.proposal_deadline.localeCompare(b.proposal_deadline))
      .slice(0, 6),
    stages
  };
}

function createRecord(collection, data) {
  const state = getState();
  const timestamp = nowIso();
  const item = { ...data, id: nextId(state[collection]), created_at: timestamp, updated_at: timestamp };
  state[collection].push(item);
  setState(state);
  return collection === "opportunities" ? enrichOpportunity(item, state.contacts) : collection === "tasks" ? enrichTask(item, state.contacts, state.opportunities) : item;
}

function updateRecord(collection, id, data) {
  const state = getState();
  const index = state[collection].findIndex((item) => Number(item.id) === Number(id));
  if (index < 0) throw new Error("Registro no encontrado.");
  const item = { ...state[collection][index], ...data, id: Number(id), updated_at: nowIso() };
  state[collection][index] = item;
  setState(state);
  return collection === "opportunities" ? enrichOpportunity(item, state.contacts) : collection === "tasks" ? enrichTask(item, state.contacts, state.opportunities) : item;
}

function deleteRecord(collection, id) {
  const state = getState();
  state[collection] = state[collection].filter((item) => Number(item.id) !== Number(id));
  setState(state);
  return null;
}

function deleteContact(id) {
  const state = getState();
  state.contacts = state.contacts.filter((contact) => Number(contact.id) !== Number(id));
  state.opportunities = state.opportunities.map((opportunity) =>
    Number(opportunity.contact_id) === Number(id) ? { ...opportunity, contact_id: null, updated_at: nowIso() } : opportunity
  );
  state.tasks = state.tasks.map((task) =>
    Number(task.contact_id) === Number(id) ? { ...task, contact_id: null, updated_at: nowIso() } : task
  );
  setState(state);
  return null;
}

function deleteOpportunity(id) {
  const state = getState();
  state.opportunities = state.opportunities.filter((opportunity) => Number(opportunity.id) !== Number(id));
  state.tasks = state.tasks.map((task) =>
    Number(task.opportunity_id) === Number(id) ? { ...task, opportunity_id: null, updated_at: nowIso() } : task
  );
  setState(state);
  return null;
}

function updateOpportunityStage(id, stage) {
  return updateRecord("opportunities", id, { stage });
}

function updateTaskStatus(id, status) {
  return updateRecord("tasks", id, { status });
}

function importCsv(type, text) {
  const rows = parseCsv(text);
  let imported = 0;
  const errors = [];
  rows.forEach((row, index) => {
    try {
      if (type === "contacts") {
        createRecord("contacts", normalizeContact(row));
      } else if (type === "opportunities") {
        createRecord("opportunities", normalizeOpportunity({ ...row, contact_id: row.contact_id || findContactId(row.contact_name || row.company) }));
      }
      imported += 1;
    } catch (error) {
      errors.push({ row: index + 2, message: error.message });
    }
  });
  return { imported, errors };
}

function findContactId(value) {
  const search = clean(value).toLowerCase();
  if (!search) return null;
  return getState().contacts.find((contact) => contact.name.toLowerCase() === search || clean(contact.company).toLowerCase() === search)?.id ?? null;
}

function normalizeContact(input) {
  const contact = {
    name: clean(input.name || input.nombre),
    company: clean(input.company || input.empresa),
    email: clean(input.email),
    phone: clean(input.phone || input.telefono),
    position: clean(input.position || input.cargo),
    contact_type: clean(input.contact_type || input.tipo_de_contacto) || "cliente potencial",
    source: clean(input.source || input.fuente) || "otro",
    notes: clean(input.notes || input.notas)
  };
  if (!contact.name) throw new Error("El nombre del contacto es obligatorio.");
  return contact;
}

function normalizeOpportunity(input) {
  const opportunity = {
    name: clean(input.name || input.nombre || input.opportunity_name),
    contact_id: nullableInteger(input.contact_id),
    company: clean(input.company || input.empresa),
    project_type: clean(input.project_type || input.tipo_de_proyecto) || "otro",
    location: clean(input.location || input.ubicacion),
    estimated_area: nullableNumber(input.estimated_area || input.superficie_estimada),
    client_budget: nullableNumber(input.client_budget || input.presupuesto_estimado_del_cliente),
    expected_fees: nullableNumber(input.expected_fees || input.honorarios_previstos),
    estimated_value: nullableNumber(input.estimated_value || input.valor_estimado_de_la_oportunidad || input.expected_fees),
    probability: nullableInteger(input.probability || input.probabilidad_de_adjudicacion),
    expected_close_date: clean(input.expected_close_date || input.fecha_prevista_de_cierre),
    proposal_deadline: clean(input.proposal_deadline || input.fecha_limite_de_propuesta),
    internal_owner: clean(input.internal_owner || input.responsable_interno),
    stage: clean(input.stage || input.etapa || input.estado) || "Lead recibido",
    notes: clean(input.notes || input.notas)
  };
  if (!opportunity.name) throw new Error("El nombre de la oportunidad es obligatorio.");
  return opportunity;
}

function normalizeTask(input) {
  const task = {
    title: clean(input.title || input.titulo),
    description: clean(input.description || input.descripcion),
    contact_id: nullableInteger(input.contact_id),
    opportunity_id: nullableInteger(input.opportunity_id),
    owner: clean(input.owner || input.responsable),
    due_date: clean(input.due_date || input.fecha_limite),
    priority: clean(input.priority || input.prioridad) || "media",
    status: clean(input.status || input.estado) || "pendiente"
  };
  if (!task.title) throw new Error("El titulo de la tarea es obligatorio.");
  return task;
}

function enrichOpportunity(opportunity, contacts) {
  const contact = contacts.find((item) => Number(item.id) === Number(opportunity.contact_id));
  return {
    ...opportunity,
    contact_name: contact?.name || null,
    contact_company: contact?.company || null,
    client_name: opportunity.company || contact?.company || contact?.name || ""
  };
}

function enrichTask(task, contacts, opportunities) {
  const contact = contacts.find((item) => Number(item.id) === Number(task.contact_id));
  const opportunity = opportunities.find((item) => Number(item.id) === Number(task.opportunity_id));
  return {
    ...task,
    contact_name: contact?.name || null,
    opportunity_name: opportunity?.name || null
  };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === "\"" && next === "\"") {
        cell += "\"";
        i += 1;
      } else if (char === "\"") {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === "\"") {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const headers = rows[0]?.map(normalizeHeader) || [];
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

function toCsv(headers, rows) {
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(","))].join("\n");
}

function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, "\"\"")}"` : text;
}

function normalizeHeader(value) {
  return clean(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
}

function nextId(items) {
  return Math.max(0, ...items.map((item) => Number(item.id) || 0)) + 1;
}

function clean(value) {
  return value === null || value === undefined ? "" : String(value).trim();
}

function nullableNumber(value) {
  const cleaned = clean(value);
  if (!cleaned) return null;
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : null;
}

function nullableInteger(value) {
  const cleaned = clean(value);
  if (!cleaned) return null;
  const number = Number.parseInt(cleaned, 10);
  return Number.isFinite(number) ? number : null;
}

function includesText(value, search) {
  return clean(value).toLowerCase().includes(clean(search).toLowerCase());
}

function matchText(search, ...values) {
  if (!search) return true;
  return values.some((value) => includesText(value, search));
}

function sortUpdated(a, b) {
  return String(b.updated_at || "").localeCompare(String(a.updated_at || "")) || Number(b.id) - Number(a.id);
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

const contactHeaders = ["id", "name", "company", "email", "phone", "position", "contact_type", "source", "notes", "created_at", "updated_at"];
const opportunityHeaders = [
  "id",
  "name",
  "contact_id",
  "contact_name",
  "company",
  "project_type",
  "location",
  "estimated_area",
  "client_budget",
  "expected_fees",
  "estimated_value",
  "probability",
  "expected_close_date",
  "proposal_deadline",
  "internal_owner",
  "stage",
  "notes",
  "created_at",
  "updated_at"
];
const taskHeaders = [
  "id",
  "title",
  "description",
  "contact_id",
  "contact_name",
  "opportunity_id",
  "opportunity_name",
  "owner",
  "due_date",
  "priority",
  "status",
  "created_at",
  "updated_at"
];
