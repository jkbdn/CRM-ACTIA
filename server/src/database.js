import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { contactsSeed, opportunitiesSeed, tasksSeed } from "./seedData.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, "..");
const dataDir = process.env.CRM_DATA_DIR || path.join(serverRoot, "data");

fs.mkdirSync(dataDir, { recursive: true });

export const dbPath = process.env.CRM_DB_PATH || path.join(dataDir, "crm.sqlite");
export const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON");

const schema = `
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  position TEXT,
  contact_type TEXT NOT NULL,
  source TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS opportunities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  contact_id INTEGER,
  company TEXT,
  project_type TEXT NOT NULL,
  location TEXT,
  estimated_area REAL,
  client_budget REAL,
  expected_fees REAL,
  estimated_value REAL,
  probability INTEGER,
  expected_close_date TEXT,
  proposal_deadline TEXT,
  internal_owner TEXT,
  stage TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  contact_id INTEGER,
  opportunity_id INTEGER,
  owner TEXT,
  due_date TEXT,
  priority TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL,
  FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_contacts_search ON contacts(name, company, email);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_owner ON opportunities(internal_owner);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(owner);
`;

const nowIso = () => new Date().toISOString();

export function initializeDatabase({ reset = false, seed = true } = {}) {
  if (reset) {
    db.exec(`
      DROP TABLE IF EXISTS tasks;
      DROP TABLE IF EXISTS opportunities;
      DROP TABLE IF EXISTS contacts;
    `);
  }

  db.exec(schema);

  const contactCount = db.prepare("SELECT COUNT(*) AS count FROM contacts").get().count;
  if (seed && contactCount === 0) {
    seedDatabase();
  }
}

function seedDatabase() {
  const timestamp = nowIso();

  const insertContact = db.prepare(`
    INSERT INTO contacts (
      name, company, email, phone, position, contact_type, source, notes, created_at, updated_at
    ) VALUES (
      @name, @company, @email, @phone, @position, @contact_type, @source, @notes, @created_at, @updated_at
    )
  `);

  const insertOpportunity = db.prepare(`
    INSERT INTO opportunities (
      name, contact_id, company, project_type, location, estimated_area, client_budget,
      expected_fees, estimated_value, probability, expected_close_date, proposal_deadline,
      internal_owner, stage, notes, created_at, updated_at
    ) VALUES (
      @name, @contact_id, @company, @project_type, @location, @estimated_area, @client_budget,
      @expected_fees, @estimated_value, @probability, @expected_close_date, @proposal_deadline,
      @internal_owner, @stage, @notes, @created_at, @updated_at
    )
  `);

  const insertTask = db.prepare(`
    INSERT INTO tasks (
      title, description, contact_id, opportunity_id, owner, due_date, priority, status,
      created_at, updated_at
    ) VALUES (
      @title, @description, @contact_id, @opportunity_id, @owner, @due_date, @priority, @status,
      @created_at, @updated_at
    )
  `);

  withTransaction(() => {
    contactsSeed.forEach((contact) => insertContact.run({ ...contact, created_at: timestamp, updated_at: timestamp }));
    opportunitiesSeed.forEach((opportunity) =>
      insertOpportunity.run({ ...opportunity, created_at: timestamp, updated_at: timestamp })
    );
    tasksSeed.forEach((task) => insertTask.run({ ...task, created_at: timestamp, updated_at: timestamp }));
  });
}

export function withTransaction(work) {
  db.exec("BEGIN");
  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
