import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'burnrate.db')
const db = new Database(dbPath)

db.exec(`CREATE TABLE IF NOT EXISTS burn_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER NOT NULL,
  value REAL NOT NULL
)`)

export default db
