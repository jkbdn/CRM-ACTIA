import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db, dbPath, initializeDatabase, withTransaction } from "./database.js";
import {
  CONTACT_SOURCES,
  CONTACT_TYPES,
  PIPELINE_STAGES,
  PROJECT_TYPES,
  TASK_PRIORITIES,
  TASK_STATUSES
} from "./constants.js";
import { parseCsv, toCsv } from "./csv.js";

initializeDatabase();

const app = express();
const port = Number(process.env.PORT || 3001);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, "../../client/dist");

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, database: dbPath });
});

app.get("/api/meta", (_req, res) => {
  res.json({
    contactTypes: CONTACT_TYPES,
    contactSources: CONTACT_SOURCES,
    projectTypes: PROJECT_TYPES,
    pipelineStages: PIPELINE_STAGES,
    taskPriorities: TASK_PRIORITIES,
    taskStatuses: TASK_STATUSES
  });
});

app.get("/api/dashboard", (_req, res) => {
  const closedStages = ["Encargo aceptado", "Encargo perdido"];
  const openStagePlaceholders = closedStages.map(() => "?").join(",");
  const contactsTotal = db.prepare("SELECT COUNT(*) AS count FROM contacts").get().count;
  const opportunitiesOpen = db
    .prepare(`SELECT COUNT(*) AS count FROM opportunities WHERE stage NOT IN (${openStagePlaceholders})`)
    .get(...closedStages).count;
  const pipelineTotals = db
    .prepare(
      `SELECT
        COALESCE(SUM(estimated_value), 0) AS estimated_value,
        COALESCE(SUM(expected_fees), 0) AS expected_fees
      FROM opportunities
      WHERE stage NOT IN (${openStagePlaceholders})`
    )
    .get(...closedStages);
  const won = db.prepare("SELECT COUNT(*) AS count FROM opportunities WHERE stage = ?").get("Encargo aceptado").count;
  const lost = db.prepare("SELECT COUNT(*) AS count FROM opportunities WHERE stage = ?").get("Encargo perdido").count;

  const stageRows = db
    .prepare(
      `SELECT stage, COUNT(*) AS count, COALESCE(SUM(estimated_value), 0) AS estimated_value
       FROM opportunities
       GROUP BY stage`
    )
    .all();
  const stageMap = new Map(stageRows.map((row) => [row.stage, row]));
  const stages = PIPELINE_STAGES.map((stage) => ({
    stage,
    count: stageMap.get(stage)?.count ?? 0,
    estimated_value: stageMap.get(stage)?.estimated_value ?? 0
  }));

  const upcomingTasks = db
    .prepare(
      `SELECT t.*, c.name AS contact_name, o.name AS opportunity_name
       FROM tasks t
       LEFT JOIN contacts c ON c.id = t.contact_id
       LEFT JOIN opportunities o ON o.id = t.opportunity_id
       WHERE t.status != 'completada' AND t.due_date IS NOT NULL AND t.due_date >= date('now')
       ORDER BY t.due_date ASC
       LIMIT 6`
    )
    .all();

  const upcomingProposals = db
    .prepare(
      `SELECT o.*, c.name AS contact_name, COALESCE(NULLIF(o.company, ''), c.company, c.name) AS client_name
       FROM opportunities o
       LEFT JOIN contacts c ON c.id = o.contact_id
       WHERE o.stage NOT IN (${openStagePlaceholders})
         AND o.proposal_deadline IS NOT NULL
         AND o.proposal_deadline >= date('now')
       ORDER BY o.proposal_deadline ASC
       LIMIT 6`
    )
    .all(...closedStages);

  res.json({
    contactsTotal,
    opportunitiesOpen,
    pipelineValue: pipelineTotals.estimated_value,
    expectedFees: pipelineTotals.expected_fees,
    opportunitiesWon: won,
    opportunitiesLost: lost,
    upcomingTasks,
    upcomingProposals,
    stages
  });
});

app.get("/api/contacts", (req, res) => {
  const { search, type, source } = req.query;
  const where = [];
  const params = {};

  if (search) {
    where.push(
      `(LOWER(name) LIKE @search OR LOWER(company) LIKE @search OR LOWER(email) LIKE @search OR LOWER(phone) LIKE @search OR LOWER(position) LIKE @search)`
    );
    params.search = `%${String(search).toLowerCase()}%`;
  }
  if (type) {
    where.push("contact_type = @type");
    params.type = type;
  }
  if (source) {
    where.push("source = @source");
    params.source = source;
  }

  const rows = db
    .prepare(`SELECT * FROM contacts ${whereSql(where)} ORDER BY updated_at DESC, id DESC`)
    .all(params);
  res.json(rows);
});

app.get("/api/contacts/:id", (req, res) => {
  const contact = getById("contacts", req.params.id);
  if (!contact) return notFound(res, "Contacto no encontrado.");
  return res.json(contact);
});

app.post("/api/contacts", (req, res) => {
  const result = validateContact(req.body);
  if (!result.ok) return badRequest(res, result.message);

  const timestamp = nowIso();
  const info = db
    .prepare(
      `INSERT INTO contacts
        (name, company, email, phone, position, contact_type, source, notes, created_at, updated_at)
       VALUES
        (@name, @company, @email, @phone, @position, @contact_type, @source, @notes, @created_at, @updated_at)`
    )
    .run({ ...result.data, created_at: timestamp, updated_at: timestamp });

  res.status(201).json(getById("contacts", info.lastInsertRowid));
});

app.put("/api/contacts/:id", (req, res) => {
  if (!getById("contacts", req.params.id)) return notFound(res, "Contacto no encontrado.");
  const result = validateContact(req.body);
  if (!result.ok) return badRequest(res, result.message);

  db.prepare(
    `UPDATE contacts SET
      name = @name,
      company = @company,
      email = @email,
      phone = @phone,
      position = @position,
      contact_type = @contact_type,
      source = @source,
      notes = @notes,
      updated_at = @updated_at
     WHERE id = @id`
  ).run({ ...result.data, updated_at: nowIso(), id: Number(req.params.id) });

  res.json(getById("contacts", req.params.id));
});

app.delete("/api/contacts/:id", (req, res) => {
  const info = db.prepare("DELETE FROM contacts WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return notFound(res, "Contacto no encontrado.");
  return res.status(204).send();
});

app.get("/api/opportunities", (req, res) => {
  const {
    search,
    stage,
    owner,
    project_type: projectType,
    close_from: closeFrom,
    close_to: closeTo,
    proposal_from: proposalFrom,
    proposal_to: proposalTo
  } = req.query;
  const where = [];
  const params = {};

  if (search) {
    where.push(
      `(LOWER(o.name) LIKE @search OR LOWER(o.company) LIKE @search OR LOWER(o.location) LIKE @search OR LOWER(c.name) LIKE @search OR LOWER(c.company) LIKE @search)`
    );
    params.search = `%${String(search).toLowerCase()}%`;
  }
  if (stage) {
    where.push("o.stage = @stage");
    params.stage = stage;
  }
  if (owner) {
    where.push("LOWER(o.internal_owner) LIKE @owner");
    params.owner = `%${String(owner).toLowerCase()}%`;
  }
  if (projectType) {
    where.push("o.project_type = @projectType");
    params.projectType = projectType;
  }
  if (closeFrom) {
    where.push("o.expected_close_date >= @closeFrom");
    params.closeFrom = closeFrom;
  }
  if (closeTo) {
    where.push("o.expected_close_date <= @closeTo");
    params.closeTo = closeTo;
  }
  if (proposalFrom) {
    where.push("o.proposal_deadline >= @proposalFrom");
    params.proposalFrom = proposalFrom;
  }
  if (proposalTo) {
    where.push("o.proposal_deadline <= @proposalTo");
    params.proposalTo = proposalTo;
  }

  const rows = db
    .prepare(
      `SELECT o.*, c.name AS contact_name, c.company AS contact_company,
        COALESCE(NULLIF(o.company, ''), c.company, c.name) AS client_name
       FROM opportunities o
       LEFT JOIN contacts c ON c.id = o.contact_id
       ${whereSql(where)}
       ORDER BY o.updated_at DESC, o.id DESC`
    )
    .all(params);
  res.json(rows);
});

app.get("/api/opportunities/:id", (req, res) => {
  const opportunity = getOpportunity(req.params.id);
  if (!opportunity) return notFound(res, "Oportunidad no encontrada.");
  return res.json(opportunity);
});

app.post("/api/opportunities", (req, res) => {
  const result = validateOpportunity(req.body);
  if (!result.ok) return badRequest(res, result.message);

  const timestamp = nowIso();
  const info = db
    .prepare(
      `INSERT INTO opportunities (
        name, contact_id, company, project_type, location, estimated_area, client_budget,
        expected_fees, estimated_value, probability, expected_close_date, proposal_deadline,
        internal_owner, stage, notes, created_at, updated_at
      ) VALUES (
        @name, @contact_id, @company, @project_type, @location, @estimated_area, @client_budget,
        @expected_fees, @estimated_value, @probability, @expected_close_date, @proposal_deadline,
        @internal_owner, @stage, @notes, @created_at, @updated_at
      )`
    )
    .run({ ...result.data, created_at: timestamp, updated_at: timestamp });

  res.status(201).json(getOpportunity(info.lastInsertRowid));
});

app.put("/api/opportunities/:id", (req, res) => {
  if (!getById("opportunities", req.params.id)) return notFound(res, "Oportunidad no encontrada.");
  const result = validateOpportunity(req.body);
  if (!result.ok) return badRequest(res, result.message);

  db.prepare(
    `UPDATE opportunities SET
      name = @name,
      contact_id = @contact_id,
      company = @company,
      project_type = @project_type,
      location = @location,
      estimated_area = @estimated_area,
      client_budget = @client_budget,
      expected_fees = @expected_fees,
      estimated_value = @estimated_value,
      probability = @probability,
      expected_close_date = @expected_close_date,
      proposal_deadline = @proposal_deadline,
      internal_owner = @internal_owner,
      stage = @stage,
      notes = @notes,
      updated_at = @updated_at
     WHERE id = @id`
  ).run({ ...result.data, updated_at: nowIso(), id: Number(req.params.id) });

  res.json(getOpportunity(req.params.id));
});

app.patch("/api/opportunities/:id/stage", (req, res) => {
  const stage = clean(req.body.stage);
  if (!PIPELINE_STAGES.includes(stage)) return badRequest(res, "Etapa de pipeline no valida.");

  const info = db
    .prepare("UPDATE opportunities SET stage = ?, updated_at = ? WHERE id = ?")
    .run(stage, nowIso(), req.params.id);
  if (info.changes === 0) return notFound(res, "Oportunidad no encontrada.");
  return res.json(getOpportunity(req.params.id));
});

app.delete("/api/opportunities/:id", (req, res) => {
  const info = db.prepare("DELETE FROM opportunities WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return notFound(res, "Oportunidad no encontrada.");
  return res.status(204).send();
});

app.get("/api/tasks", (req, res) => {
  const { search, status, priority, owner } = req.query;
  const where = [];
  const params = {};

  if (search) {
    where.push(
      `(LOWER(t.title) LIKE @search OR LOWER(t.description) LIKE @search OR LOWER(c.name) LIKE @search OR LOWER(o.name) LIKE @search)`
    );
    params.search = `%${String(search).toLowerCase()}%`;
  }
  if (status) {
    where.push("t.status = @status");
    params.status = status;
  }
  if (priority) {
    where.push("t.priority = @priority");
    params.priority = priority;
  }
  if (owner) {
    where.push("LOWER(t.owner) LIKE @owner");
    params.owner = `%${String(owner).toLowerCase()}%`;
  }

  const rows = db
    .prepare(
      `SELECT t.*, c.name AS contact_name, o.name AS opportunity_name
       FROM tasks t
       LEFT JOIN contacts c ON c.id = t.contact_id
       LEFT JOIN opportunities o ON o.id = t.opportunity_id
       ${whereSql(where)}
       ORDER BY
        CASE t.status WHEN 'pendiente' THEN 0 WHEN 'en curso' THEN 1 ELSE 2 END,
        t.due_date ASC,
        t.updated_at DESC`
    )
    .all(params);
  res.json(rows);
});

app.get("/api/tasks/:id", (req, res) => {
  const task = getTask(req.params.id);
  if (!task) return notFound(res, "Tarea no encontrada.");
  return res.json(task);
});

app.post("/api/tasks", (req, res) => {
  const result = validateTask(req.body);
  if (!result.ok) return badRequest(res, result.message);

  const timestamp = nowIso();
  const info = db
    .prepare(
      `INSERT INTO tasks (
        title, description, contact_id, opportunity_id, owner, due_date, priority, status, created_at, updated_at
      ) VALUES (
        @title, @description, @contact_id, @opportunity_id, @owner, @due_date, @priority, @status, @created_at, @updated_at
      )`
    )
    .run({ ...result.data, created_at: timestamp, updated_at: timestamp });

  res.status(201).json(getTask(info.lastInsertRowid));
});

app.put("/api/tasks/:id", (req, res) => {
  if (!getById("tasks", req.params.id)) return notFound(res, "Tarea no encontrada.");
  const result = validateTask(req.body);
  if (!result.ok) return badRequest(res, result.message);

  db.prepare(
    `UPDATE tasks SET
      title = @title,
      description = @description,
      contact_id = @contact_id,
      opportunity_id = @opportunity_id,
      owner = @owner,
      due_date = @due_date,
      priority = @priority,
      status = @status,
      updated_at = @updated_at
     WHERE id = @id`
  ).run({ ...result.data, updated_at: nowIso(), id: Number(req.params.id) });

  res.json(getTask(req.params.id));
});

app.patch("/api/tasks/:id/status", (req, res) => {
  const status = clean(req.body.status);
  if (!TASK_STATUSES.includes(status)) return badRequest(res, "Estado de tarea no valido.");

  const info = db.prepare("UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?").run(status, nowIso(), req.params.id);
  if (info.changes === 0) return notFound(res, "Tarea no encontrada.");
  return res.json(getTask(req.params.id));
});

app.delete("/api/tasks/:id", (req, res) => {
  const info = db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
  if (info.changes === 0) return notFound(res, "Tarea no encontrada.");
  return res.status(204).send();
});

app.get("/api/export/contacts", (_req, res) => {
  const rows = db.prepare("SELECT * FROM contacts ORDER BY id ASC").all();
  sendCsv(res, "contactos.csv", contactHeaders, rows);
});

app.get("/api/export/opportunities", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT o.*, c.name AS contact_name, c.company AS contact_company
       FROM opportunities o
       LEFT JOIN contacts c ON c.id = o.contact_id
       ORDER BY o.id ASC`
    )
    .all();
  sendCsv(res, "oportunidades.csv", opportunityHeaders, rows);
});

app.get("/api/export/tasks", (_req, res) => {
  const rows = db
    .prepare(
      `SELECT t.*, c.name AS contact_name, o.name AS opportunity_name
       FROM tasks t
       LEFT JOIN contacts c ON c.id = t.contact_id
       LEFT JOIN opportunities o ON o.id = t.opportunity_id
       ORDER BY t.id ASC`
    )
    .all();
  sendCsv(res, "tareas.csv", taskHeaders, rows);
});

app.post("/api/import/contacts", express.text({ type: ["text/csv", "text/plain", "application/csv"], limit: "2mb" }), (req, res) => {
  const rows = parseCsv(req.body || "");
  const insert = db.prepare(
    `INSERT INTO contacts
      (name, company, email, phone, position, contact_type, source, notes, created_at, updated_at)
     VALUES
      (@name, @company, @email, @phone, @position, @contact_type, @source, @notes, @created_at, @updated_at)`
  );
  const errors = [];
  let imported = 0;
  const timestamp = nowIso();

  withTransaction(() => {
    rows.forEach((row, index) => {
      const result = validateContact(row);
      if (!result.ok) {
        errors.push({ row: index + 2, message: result.message });
        return;
      }
      insert.run({ ...result.data, created_at: timestamp, updated_at: timestamp });
      imported += 1;
    });
  });

  res.json({ imported, errors });
});

app.post("/api/import/opportunities", express.text({ type: ["text/csv", "text/plain", "application/csv"], limit: "2mb" }), (req, res) => {
  const rows = parseCsv(req.body || "");
  const insert = db.prepare(
    `INSERT INTO opportunities (
      name, contact_id, company, project_type, location, estimated_area, client_budget,
      expected_fees, estimated_value, probability, expected_close_date, proposal_deadline,
      internal_owner, stage, notes, created_at, updated_at
    ) VALUES (
      @name, @contact_id, @company, @project_type, @location, @estimated_area, @client_budget,
      @expected_fees, @estimated_value, @probability, @expected_close_date, @proposal_deadline,
      @internal_owner, @stage, @notes, @created_at, @updated_at
    )`
  );
  const errors = [];
  let imported = 0;
  const timestamp = nowIso();

  withTransaction(() => {
    rows.forEach((row, index) => {
      const result = validateOpportunity({
        ...row,
        contact_id: row.contact_id || findContactId(row.contact_name || row.cliente || row.company)
      });
      if (!result.ok) {
        errors.push({ row: index + 2, message: result.message });
        return;
      }
      insert.run({ ...result.data, created_at: timestamp, updated_at: timestamp });
      imported += 1;
    });
  });

  res.json({ imported, errors });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Ruta API no encontrada." });
});

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    return res.sendFile(path.join(clientDist, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res.json({
      message: "API CRM activa. En desarrollo abre el frontend en http://127.0.0.1:5173."
    });
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Error interno del servidor." });
});

app.listen(port, () => {
  console.log(`CRM arquitectura API escuchando en http://localhost:${port}`);
});

const contactHeaders = [
  { key: "id", label: "id" },
  { key: "name", label: "name" },
  { key: "company", label: "company" },
  { key: "email", label: "email" },
  { key: "phone", label: "phone" },
  { key: "position", label: "position" },
  { key: "contact_type", label: "contact_type" },
  { key: "source", label: "source" },
  { key: "notes", label: "notes" },
  { key: "created_at", label: "created_at" },
  { key: "updated_at", label: "updated_at" }
];

const opportunityHeaders = [
  { key: "id", label: "id" },
  { key: "name", label: "name" },
  { key: "contact_id", label: "contact_id" },
  { key: "contact_name", label: "contact_name" },
  { key: "company", label: "company" },
  { key: "project_type", label: "project_type" },
  { key: "location", label: "location" },
  { key: "estimated_area", label: "estimated_area" },
  { key: "client_budget", label: "client_budget" },
  { key: "expected_fees", label: "expected_fees" },
  { key: "estimated_value", label: "estimated_value" },
  { key: "probability", label: "probability" },
  { key: "expected_close_date", label: "expected_close_date" },
  { key: "proposal_deadline", label: "proposal_deadline" },
  { key: "internal_owner", label: "internal_owner" },
  { key: "stage", label: "stage" },
  { key: "notes", label: "notes" },
  { key: "created_at", label: "created_at" },
  { key: "updated_at", label: "updated_at" }
];

const taskHeaders = [
  { key: "id", label: "id" },
  { key: "title", label: "title" },
  { key: "description", label: "description" },
  { key: "contact_id", label: "contact_id" },
  { key: "contact_name", label: "contact_name" },
  { key: "opportunity_id", label: "opportunity_id" },
  { key: "opportunity_name", label: "opportunity_name" },
  { key: "owner", label: "owner" },
  { key: "due_date", label: "due_date" },
  { key: "priority", label: "priority" },
  { key: "status", label: "status" },
  { key: "created_at", label: "created_at" },
  { key: "updated_at", label: "updated_at" }
];

function validateContact(input) {
  const data = {
    name: clean(input.name || input.nombre),
    company: clean(input.company || input.empresa),
    email: clean(input.email),
    phone: clean(input.phone || input.telefono),
    position: clean(input.position || input.cargo),
    contact_type: clean(input.contact_type || input.tipo_de_contacto) || "cliente potencial",
    source: clean(input.source || input.fuente) || "otro",
    notes: clean(input.notes || input.notas)
  };

  if (!data.name) return invalid("El nombre del contacto es obligatorio.");
  if (!CONTACT_TYPES.includes(data.contact_type)) return invalid("Tipo de contacto no valido.");
  if (!CONTACT_SOURCES.includes(data.source)) return invalid("Fuente de contacto no valida.");
  return valid(data);
}

function validateOpportunity(input) {
  const data = {
    name: clean(input.name || input.nombre || input.opportunity_name),
    contact_id: nullableInteger(input.contact_id),
    company: clean(input.company || input.empresa),
    project_type: clean(input.project_type || input.tipo_de_proyecto) || "otro",
    location: clean(input.location || input.ubicacion),
    estimated_area: nullableNumber(input.estimated_area || input.superficie_estimada),
    client_budget: nullableNumber(input.client_budget || input.presupuesto_estimado_del_cliente),
    expected_fees: nullableNumber(input.expected_fees || input.honorarios_previstos),
    estimated_value: nullableNumber(input.estimated_value || input.valor_estimado_de_la_oportunidad),
    probability: nullableInteger(input.probability || input.probabilidad_de_adjudicacion),
    expected_close_date: clean(input.expected_close_date || input.fecha_prevista_de_cierre),
    proposal_deadline: clean(input.proposal_deadline || input.fecha_limite_de_propuesta),
    internal_owner: clean(input.internal_owner || input.responsable_interno),
    stage: clean(input.stage || input.etapa || input.estado) || "Lead recibido",
    notes: clean(input.notes || input.notas)
  };

  if (!data.name) return invalid("El nombre de la oportunidad es obligatorio.");
  if (!PROJECT_TYPES.includes(data.project_type)) return invalid("Tipo de proyecto no valido.");
  if (!PIPELINE_STAGES.includes(data.stage)) return invalid("Etapa de pipeline no valida.");
  if (data.probability !== null && (data.probability < 0 || data.probability > 100)) {
    return invalid("La probabilidad debe estar entre 0 y 100.");
  }
  return valid(data);
}

function validateTask(input) {
  const data = {
    title: clean(input.title || input.titulo),
    description: clean(input.description || input.descripcion),
    contact_id: nullableInteger(input.contact_id),
    opportunity_id: nullableInteger(input.opportunity_id),
    owner: clean(input.owner || input.responsable),
    due_date: clean(input.due_date || input.fecha_limite),
    priority: clean(input.priority || input.prioridad) || "media",
    status: clean(input.status || input.estado) || "pendiente"
  };

  if (!data.title) return invalid("El titulo de la tarea es obligatorio.");
  if (!TASK_PRIORITIES.includes(data.priority)) return invalid("Prioridad no valida.");
  if (!TASK_STATUSES.includes(data.status)) return invalid("Estado de tarea no valido.");
  return valid(data);
}

function sendCsv(res, filename, headers, rows) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(toCsv(headers, rows));
}

function getById(table, id) {
  return db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
}

function getOpportunity(id) {
  return db
    .prepare(
      `SELECT o.*, c.name AS contact_name, c.company AS contact_company,
        COALESCE(NULLIF(o.company, ''), c.company, c.name) AS client_name
       FROM opportunities o
       LEFT JOIN contacts c ON c.id = o.contact_id
       WHERE o.id = ?`
    )
    .get(id);
}

function getTask(id) {
  return db
    .prepare(
      `SELECT t.*, c.name AS contact_name, o.name AS opportunity_name
       FROM tasks t
       LEFT JOIN contacts c ON c.id = t.contact_id
       LEFT JOIN opportunities o ON o.id = t.opportunity_id
       WHERE t.id = ?`
    )
    .get(id);
}

function findContactId(value) {
  const search = clean(value);
  if (!search) return null;
  const row = db
    .prepare("SELECT id FROM contacts WHERE LOWER(name) = LOWER(?) OR LOWER(company) = LOWER(?) ORDER BY id ASC LIMIT 1")
    .get(search, search);
  return row?.id ?? null;
}

function whereSql(where) {
  return where.length ? `WHERE ${where.join(" AND ")}` : "";
}

function clean(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function nullableNumber(value) {
  const cleaned = clean(value);
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function nullableInteger(value) {
  const cleaned = clean(value);
  if (!cleaned) return null;
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function nowIso() {
  return new Date().toISOString();
}

function valid(data) {
  return { ok: true, data };
}

function invalid(message) {
  return { ok: false, message };
}

function badRequest(res, message) {
  return res.status(400).json({ message });
}

function notFound(res, message) {
  return res.status(404).json({ message });
}
