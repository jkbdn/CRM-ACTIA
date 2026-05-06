import { dbPath, initializeDatabase } from "../src/database.js";

initializeDatabase({ seed: true });
console.log(`Base de datos inicializada en ${dbPath}`);
