import fs from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";
import { env } from "../config/env";

async function readSql(relativePath: string) {
  const filePath = path.resolve(__dirname, `../../../${relativePath}`);
  return fs.readFile(filePath, "utf8");
}

async function main() {
  const adminConn = await mysql.createConnection({
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    multipleStatements: true
  });

  try {
    await adminConn.query(`CREATE DATABASE IF NOT EXISTS \`${env.MYSQL_DATABASE}\``);
  } finally {
    await adminConn.end();
  }

  const schemaSql = await readSql("database/mysql/schema.sql");
  const seedSql = await readSql("database/mysql/seed.sql");

  const appConn = await mysql.createConnection({
    host: env.MYSQL_HOST,
    port: env.MYSQL_PORT,
    user: env.MYSQL_USER,
    password: env.MYSQL_PASSWORD,
    database: env.MYSQL_DATABASE,
    multipleStatements: true
  });

  try {
    await appConn.query(schemaSql);
    await appConn.query(seedSql);
    console.log(`Local MySQL database '${env.MYSQL_DATABASE}' initialized.`);
  } finally {
    await appConn.end();
  }
}

main().catch((error) => {
  if (error instanceof Error) {
    const mysqlLike = error as Error & {
      code?: string;
      errno?: number;
      sqlState?: string;
      sqlMessage?: string;
    };

    console.error("Local MySQL initialization failed", {
      message: mysqlLike.message,
      code: mysqlLike.code,
      errno: mysqlLike.errno,
      sqlState: mysqlLike.sqlState,
      sqlMessage: mysqlLike.sqlMessage
    });
  } else {
    console.error("Local MySQL initialization failed", error);
  }
  process.exit(1);
});
