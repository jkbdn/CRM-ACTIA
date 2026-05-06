import { dbPath, initializeDatabase } from "../src/database.js";

initializeDatabase({ reset: true, seed: true });
console.log(`Base de datos reiniciada con datos de ejemplo en ${dbPath}`);
