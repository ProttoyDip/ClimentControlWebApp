import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import mysql from "mysql2/promise";
import { env } from "../config/env";

type Direction = "up" | "down";

interface MigrationFile {
  version: number;
  name: string;
  direction: Direction;
  filename: string;
  filepath: string;
}

function parseDirectionArg(): Direction {
  const directionArg = process.argv.find((arg) => arg.startsWith("--direction="));
  const value = directionArg?.split("=")[1];
  if (value === "down") return "down";
  return "up";
}

function parseTargetVersion(): number | null {
  const toArg = process.argv.find((arg) => arg.startsWith("--to="));
  if (!toArg) return null;
  const parsed = Number(toArg.split("=")[1]);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error("Invalid --to value. Use numeric version e.g. --to=2");
  }
  return parsed;
}

async function ensureMigrationsTable(connection: mysql.Connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function parseMigrationFilename(filename: string): MigrationFile | null {
  const match = filename.match(/^(\d+)_([\w-]+)\.(up|down)\.sql$/);
  if (!match) return null;

  const version = Number(match[1]);
  const name = match[2];
  const direction = match[3] as Direction;

  return {
    version,
    name,
    direction,
    filename,
    filepath: ""
  };
}

async function loadMigrations(directory: string): Promise<MigrationFile[]> {
  const entries = await fs.readdir(directory);

  return entries
    .map((filename) => parseMigrationFilename(filename))
    .filter((item): item is MigrationFile => Boolean(item))
    .map((item) => ({
      ...item,
      filepath: path.join(directory, item.filename)
    }))
    .sort((a, b) => {
      if (a.version === b.version) return a.direction.localeCompare(b.direction);
      return a.version - b.version;
    });
}

async function getAppliedVersions(connection: mysql.Connection): Promise<Set<number>> {
  const [rows] = await connection.query<mysql.RowDataPacket[]>(
    "SELECT version FROM schema_migrations ORDER BY version ASC"
  );

  return new Set(rows.map((row) => Number(row.version)));
}

async function runMigration(connection: mysql.Connection, migration: MigrationFile, direction: Direction) {
  const sql = await fs.readFile(migration.filepath, "utf8");

  await connection.beginTransaction();
  try {
    await connection.query(sql);

    if (direction === "up") {
      await connection.query("INSERT INTO schema_migrations (version, name) VALUES (?, ?)", [
        migration.version,
        migration.name
      ]);
    } else {
      await connection.query("DELETE FROM schema_migrations WHERE version = ?", [migration.version]);
    }

    await connection.commit();
    console.log(`Applied ${direction}: ${migration.filename}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}

async function main() {
  const direction = parseDirectionArg();
  const targetVersion = parseTargetVersion();

  const migrationsDir = path.resolve(__dirname, "../../../database/mysql/migrations");
  const migrations = await loadMigrations(migrationsDir);

  const connection = await mysql.createConnection({
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    multipleStatements: true
  });

  try {
    await ensureMigrationsTable(connection);

    const appliedVersions = await getAppliedVersions(connection);

    if (direction === "up") {
      const upMigrations = migrations.filter((migration) => {
        if (migration.direction !== "up") return false;
        if (appliedVersions.has(migration.version)) return false;
        if (targetVersion !== null && migration.version > targetVersion) return false;
        return true;
      });

      for (const migration of upMigrations) {
        await runMigration(connection, migration, "up");
      }

      if (upMigrations.length === 0) {
        console.log("No up migrations to apply.");
      }
    } else {
      const downCandidates = migrations
        .filter((migration) => migration.direction === "down" && appliedVersions.has(migration.version))
        .sort((a, b) => b.version - a.version)
        .filter((migration) => {
          if (targetVersion === null) return true;
          return migration.version > targetVersion;
        });

      for (const migration of downCandidates) {
        await runMigration(connection, migration, "down");
      }

      if (downCandidates.length === 0) {
        console.log("No down migrations to apply.");
      }
    }
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error("Migration run failed", error instanceof Error ? error.message : error);
  process.exit(1);
});
