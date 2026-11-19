# Deploy by hand: checklist

Short points for putting FlyConnect Tech live yourself from cPanel. The full guide, with where every value comes from and the table of errors, is [deploy.md](deploy.md); each point below names its step there.

## First: which way?

| Way | What you do | What it needs |
|---|---|---|
| **A. GitHub deploys** | Press **Run workflow** on GitHub (or push to `main`). GitHub tests, builds, uploads and restarts both apps. | Krystal must switch on **SSH shell access** and `rsync` (a support ticket, deploy.md Step 1) |
| **B. By hand** | Build two zip files on your PC, upload them in cPanel **File Manager**, press buttons in **Setup Node.js App**. | Nothing extra. Works today |

While cPanel says "Shell access is not enabled on your account", only **B** works. The GitHub workflow was checked on 19 November 2026: it is correct, but it cannot log in to Krystal without SSH.

---

# B. By hand

## B1. Once, in cPanel

Skip any point you have already done. None of them needs SSH.

**Website**

1. **Node.js app** (Step 5): Setup Node.js App > **Create Application**
   - Node.js version: 22 or newer
   - Application mode: Production
   - Application root: `flyconnect-tech/frontend`
   - Application URL: `flyconnecttech.co.uk`
   - Application startup file: `server.js`
2. **Padlock**: cPanel > SSL/TLS Status shows a green padlock for `flyconnecttech.co.uk` (click Run AutoSSL if not).

**Backend**

3. **The api address** (Step 8): Domains > Create A New Domain > `api.flyconnecttech.co.uk`, untick **Share document root**. Wait for its padlock.
4. **The database** (Step 9): database `fctech`, user `fcapp`, a password with **letters and numbers only**, ALL PRIVILEGES, collation `utf8mb4_unicode_ci`.
5. **The mailbox** (Step 10): `info@flyconnecttech.co.uk`. Write down its **Outgoing Server** and **SMTP Port** (usually 465).
6. **Node.js app** (Step 11): Setup Node.js App > **Create Application**
   - Node.js version: the **same** as the website
   - Application mode: Production
   - Application root: `flyconnect-tech/backend`
   - Application URL: `api.flyconnecttech.co.uk`
   - Application startup file: `app.cjs`

   At the top of the app's page is a command that starts with `source` and ends with `activate`. Copy it and keep it: B6 needs it.
7. **The uploads folder and the settings file** (Step 12):
   - File Manager > **Settings** > tick **Show Hidden Files (dotfiles)** > Save.
   - Make the folder `flyconnect-tech/uploads`.
   - Make the file `flyconnect-tech/backend/.env` from the example in Step 12, then set its permission to `600`.

## B2. The two zip files

Ask Claude for **"the website zip"** and **"the backend zip"**. Both are built on your PC and saved in the `northstack-starter-kit` folder (the folder above the project).

| Zip | What is inside |
|---|---|
| `flyconnecttech-website.zip` (about 12 MB) | `.next`, `node_modules`, `public`, `server.js`, `package.json`. The live addresses are built in |
| `flyconnecttech-backend.zip` (under 1 MB) | `dist`, `prisma`, `app.cjs`, `package.json`, `package-lock.json`, `prisma7.config.ts`. **No** `node_modules`: Krystal installs those itself (B4, point 3), because one of them must be made for Krystal's own system |

To build them yourself, open Git Bash:

- **Website**, in the `frontend` folder: the three lines in deploy.md, "Without SSH", part 1.
- **Backend**, in the `backend` folder:

  ```bash
  rm -rf ../../backend-live
  npx tsc -p tsconfig.build.json --outDir ../../backend-live/dist
  cp -r prisma app.cjs package.json package-lock.json prisma7.config.ts ../../backend-live/
  cd ../../backend-live && /c/Windows/System32/tar.exe -a -c -f ../flyconnecttech-backend.zip dist prisma app.cjs package.json package-lock.json prisma7.config.ts
  ```

  This builds into its own folder, so the backend running on your PC (`npm run dev`) keeps working.

Use Windows' own `tar.exe` as above. Zips made with PowerShell's Compress-Archive have the wrong kind of slashes for the hosting.

## B3. Website: first time and every update

1. File Manager > **Settings** > tick **Show Hidden Files (dotfiles)** > Save. The zip has a hidden folder, `.next`.
2. Open `flyconnect-tech/frontend` and delete what the last zip put there: `.next`, `node_modules`, `public`, `server.js`, `package.json`. The first time, delete cPanel's sample `server.js` if there is one.
3. **Upload** `flyconnecttech-website.zip` and wait for 100%.
4. Right-click the zip > **Extract** into `/home/flyconne/flyconnect-tech/frontend`. Delete the zip.
5. Setup Node.js App > the `flyconnecttech.co.uk` app > **Restart**.
   - **Never click "Run NPM Install" for the website.** The zip already holds its packages.
6. Open `https://flyconnecttech.co.uk` and click through a few pages.

## B4. Backend: the first time

1. File Manager > `flyconnect-tech/backend`. Leave `.env` where it is. **Upload** `flyconnecttech-backend.zip`, **Extract** it here, delete the zip.
2. Check the folder now has: `dist`, `prisma`, `app.cjs`, `package.json`, `package-lock.json`, `prisma7.config.ts` and `.env`.
3. Setup Node.js App > the `api.flyconnecttech.co.uk` app > **Run NPM Install**. For the backend you **do** click it. Wait for the message that it finished; it can take a few minutes.
   - If it fails with a memory or time-limit error, run `npm install --omit=dev --no-audit --no-fund` with B6 instead.
4. **Create the database tables.** On the same page: **Run JS script** > choose `db:deploy` > run it. The output ends with "All migrations have been successfully applied".
   - If there is no **Run JS script** button, or it shows no output, run `npx --no prisma migrate deploy` with B6.
5. **Restart** the app.
6. Open `https://api.flyconnecttech.co.uk/health`. It must show `{"status":"ok","database":"up"}`.
7. **Make yourself the first super admin** (Step 14) with B6, using this command with your own name and email:

   ```bash
   node dist/cli/invite-user.js --role super-admin --name "Your Name" --email you@flyconnecttech.co.uk
   ```

   - The invitation arrives by email. The link is also in `once.log`.
   - Open the link, choose a password and set up two-factor sign-in, then sign in at `https://flyconnecttech.co.uk/team/sign-in`.
   - Delete `once.log` afterwards: anyone with the link can take the account.
   - Everyone else is added from the team panel (Users, Customers), not with this command.
8. **Scheduled jobs**: add the three lines in cPanel > Cron Jobs (Step 15).
9. **Emails out of spam** (Step 16), then the list in deploy.md, "Before you launch".

## B5. Backend: every update

1. File Manager > `flyconnect-tech/backend`. Delete `dist`, `prisma`, `app.cjs`, `package.json`, `package-lock.json` and `prisma7.config.ts`.
   - **Never delete** `.env`, `node_modules`, `jobs.log`, `tmp`, or the `uploads` folder beside `backend`.
2. **Upload** the new `flyconnecttech-backend.zip`, **Extract** it, delete the zip.
3. **Run NPM Install**. It matters only when the packages changed, and clicking it every time is safe.
4. **Run JS script** > `db:deploy`. Also safe every time: with nothing new it says "No pending migrations to apply".
5. **Restart**, then check `https://api.flyconnecttech.co.uk/health`.

**When both apps change, do the backend first, then the website.**

## B6. Run a command once, without SSH

Without SSH, cPanel's **Cron Jobs** page is the only place to run a command. To run one once:

1. cPanel > **Cron Jobs**. Note the **server's time** shown on the page.
2. Under **Add New Cron Job**, fill in:

   | Field | Value |
   |---|---|
   | Minute | 3 minutes after the server's time |
   | Hour | the server's hour |
   | Day | today's date |
   | Month | this month |
   | Weekday | `*` |
   | Command | `SOURCE-COMMAND && cd ~/flyconnect-tech/backend && THE-COMMAND >> ~/flyconnect-tech/backend/once.log 2>&1` |

   - `SOURCE-COMMAND` is the `source … activate` command you copied in B1, point 6.
   - `THE-COMMAND` is the command you want to run.
   - Example: Minute `35`, Hour `14`, Day `19`, Month `11` runs once, at 14:35 on 19 November.
3. Click **Add New Cron Job** and wait 5 minutes.
4. File Manager > `flyconnect-tech/backend` > `once.log` > **View**: this is what the command printed.
5. Under **Current Cron Jobs**, **Delete** that line, so it does not run again next year. Delete `once.log` when you have read it.

## What a by-hand deploy never touches

- `flyconnect-tech/backend/.env`: the settings and passwords.
- `flyconnect-tech/uploads`: the files customers and the team attach.
- `jobs.log`: the scheduled jobs' history.
- The data in the database: `db:deploy` only adds new tables and columns.

## If something goes wrong

| What you see | What to do |
|---|---|
| The website shows an error or 503 | Read `stderr.log` in `flyconnect-tech/frontend`. Check that the five items from the zip are there, including the hidden `.next` |
| Run NPM Install says "CloudLinux NodeJS Selector demands to store node modules … in separate folder" | There is a real `node_modules` folder in `flyconnect-tech/backend`. Delete it and click again. For the website, never click it |
| `/health` does not answer, or shows 503 | Read `stderr.log` in `flyconnect-tech/backend`. Usual causes: a mistake in `.env`, Node.js below 22, or the tables were not made (B4, point 4) |
| `stderr.log` says "URIError: URI malformed" | The database password has a symbol in it. Give the user a new password with letters and numbers only (Manage My Databases > Current Users > Change Password), put it in `DATABASE_URL` in `.env`, then **Restart** |
| `db:deploy` says "Access denied" | `DATABASE_URL` in `.env` is wrong, or the user lacks ALL PRIVILEGES (Step 9) |
| `once.log` is missing after 5 minutes | The time had already passed on the server's clock, or `SOURCE-COMMAND` is not exactly what cPanel shows. Fix it and try again |
| The forms say "Backend not running" | The backend is not live yet, or `/health` fails: see the rows above |
| Anything else | deploy.md, "If something goes wrong". Copy the exact error text and send it to Claude |

---

# A. GitHub deploys (once SSH is on)

**Once** (deploy.md Steps 2 to 7 and 13):

- Do B1 in cPanel: this way needs the same Node.js apps, api address, database, mailbox and `.env`.
- Put the project on GitHub as a **private** repository (Step 2).
- Make the login key, import it in cPanel > SSH Access and **Authorize** it, then test the login (Step 3).
- GitHub > Settings > Secrets and variables > Actions > **Secrets**: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `SSH_KNOWN_HOSTS` (Step 4).
- Same page > **Variables**:

  | Name | Value |
  |---|---|
  | `SSH_PORT` | `722` |
  | `SITE_URL` | `https://flyconnecttech.co.uk` |
  | `API_URL` | `https://api.flyconnecttech.co.uk` |
  | `FRONTEND_PATH` | `flyconnect-tech/frontend` |
  | `BACKEND_PATH` | `flyconnect-tech/backend` |
  | `DEPLOY_BACKEND` | `true` (or `false` for the website only) |
  | `DEPLOY_ENABLED` | `true` |
  | `NODE_VERSION` | only if the apps use a Node.js version other than 22 |

**Each time**:

1. GitHub > **Actions** > **Deploy** > **Run workflow** > branch `main` > **Run workflow**. A push to `main` does the same.
2. Wait for the green tick (about 10 minutes). On the way it:
   - runs every test; if one fails, nothing changes on the live site;
   - builds both apps on GitHub;
   - uploads only the backend's `dist` and `prisma` and the website's `.next`, `node_modules` and `public`;
   - installs the backend's packages, updates the database tables and restarts both apps;
   - opens `/health` and the home page to check they answer.
3. The first time only: make the first super admin (Step 14) and add the scheduled jobs (Step 15).
