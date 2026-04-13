# Local MySQL Setup (No Docker)

This project can run fully on local MySQL and does not require Docker.

## 1) Start local MySQL

Use your local MySQL Server service (default port `3306`).

## 2) Configure backend env

Edit `backend/.env`:

- `MYSQL_HOST=localhost`
- `MYSQL_PORT=3306`
- `MYSQL_USER=<your_mysql_user>`
- `MYSQL_PASSWORD=<your_mysql_password>`
- `MYSQL_DATABASE=climate_control`

## 3) Initialize schema + seed data

From any folder:

```bash
npm --prefix backend run db:init
```

This command will:
- create database `climate_control` if missing
- apply `database/mysql/schema.sql`
- apply `database/mysql/seed.sql`

## 4) Run backend

```bash
npm --prefix backend run dev
```

## 5) Run frontend

```bash
npm --prefix frontend run dev
```

## Troubleshooting

- If you see `Host 'localhost' is not allowed to connect`, your server is not accepting that user/host combination.
- If MySQL is not running and you have MySQL80 installed on Windows, start it from an elevated PowerShell:

```powershell
Start-Service MySQL80
```

- If `Start-Service MySQL80` fails with access errors, open Services as administrator and start MySQL80 there.
- In MySQL, grant local access for your user, for example:

```sql
CREATE USER IF NOT EXISTS 'climate_user'@'localhost' IDENTIFIED BY 'climate_password';
GRANT ALL PRIVILEGES ON climate_control.* TO 'climate_user'@'localhost';
FLUSH PRIVILEGES;
```

Then set the same credentials in `backend/.env`.
