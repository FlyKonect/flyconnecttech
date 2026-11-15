# Going live: setup guide

This guide sets up automatic deploys. When it is done, every push to the `main` branch on GitHub puts the new website and backend on your hosting by itself.

You do the setup once. It has 8 steps and uses three places: **cPanel** (your hosting), **GitHub**, and a **terminal on your PC** (Git Bash).

> **Not yet tested on the real hosting.** The deploy was rehearsed on a PC with a pretend hosting folder, and each part passed. It has not run against your actual hosting, because that needs your accounts. If the first real deploy fails, copy the red error text from GitHub and send it to Claude.

## How it works

1. You push code to `main`.
2. GitHub runs the checks for both apps. If one fails, it stops and nothing changes on the live site.
3. GitHub builds both apps.
4. GitHub copies the built files to your hosting.
5. On the hosting, it installs the backend's packages, updates the database and restarts both apps.
6. It opens the live site and the backend to confirm they answer.

Pushes to other branches, and pull requests, only run the checks. They never deploy.

## Words used in this guide

| In this guide | Replace with |
|---|---|
| `yourdomain.com` | your real domain |
| `CPANELUSER` | your cPanel username |
| `HOST` | the server name for SSH (your hosting's welcome email has it; often your domain works too) |
| `PORT` | the SSH port (your hosting's welcome email or help pages have it; often `22`) |

---

## Step 1. Check before you start

- [ ] You can log in to cPanel.
- [ ] cPanel has **Setup Node.js App** (under Software) and **SSH Access** (under Security).
- [ ] In **Setup Node.js App > Create Application**, the Node.js version list offers **22 or newer** (22.12 at the least). If the newest is below 22, stop and ask your hosting's support to add it. The apps will not start on an older version.
- [ ] You have a GitHub account.
- [ ] Your domain points to this hosting.

## Step 2. Put the project on GitHub

1. On github.com, click **New repository**.
2. Name it, for example `flyconnect-tech`. Choose **Private**. Do not add a README or any other file. Click **Create repository**.
3. On your PC, open a terminal in the `flyconnecttech` folder and run these two lines, with your own GitHub name:

   ```bash
   git remote add origin https://github.com/YOUR-GITHUB-NAME/flyconnect-tech.git
   git push -u origin main
   ```

4. On GitHub, open the **Actions** tab. A run called **Deploy** starts. Its **Checks** part should finish with green ticks. The deploy part is skipped for now: that is correct, it stays off until Step 8.

## Step 3. cPanel: the `api` address and the database

**The `api` address**

1. cPanel > **Domains** > **Create A New Domain**.
2. Domain: `api.yourdomain.com`. Untick "Share document root". Click **Submit**.
3. cPanel > **SSL/TLS Status**. Wait until both `yourdomain.com` and `api.yourdomain.com` show a green padlock. Click **Run AutoSSL** if they do not. This can take up to an hour.

**The database**

1. cPanel > **MySQL Databases** (it may be called **Manage My Databases**).
2. **Create New Database**, for example `fctech`. cPanel adds your username in front, so the full name is like `CPANELUSER_fctech`. Write the full name down.
3. **Add New User**, for example `fcapp` (full name `CPANELUSER_fcapp`). Use **Password Generator**, and choose a password with **letters and numbers only**. Symbols such as `@`, `#` or `/` break the database address. Write the password down.
4. **Add User To Database**: pick the user and the database, tick **ALL PRIVILEGES**, click **Make Changes**.
5. Set the text format, so every language and symbol saves correctly:
   - cPanel > **phpMyAdmin**. Click your database in the left list.
   - Open the **Operations** tab.
   - Under **Collation**, choose `utf8mb4_unicode_ci`, then click **Go**.

## Step 4. cPanel: create the two Node.js apps

cPanel > **Setup Node.js App** > **Create Application**. Do this twice.

| Field | Backend | Website |
|---|---|---|
| Node.js version | 22 or newer | the **same** version as the backend |
| Application mode | Production | Production |
| Application root | `flyconnect-tech/backend` | `flyconnect-tech/frontend` |
| Application URL | `api.yourdomain.com` | `yourdomain.com` |
| Application startup file | `app.cjs` | `server.js` |

Click **Create** each time.

- **Do not click "Run NPM Install"** for either app. The deploy installs what is needed. For the website, clicking it can break the app.
- Until the first deploy, both addresses show an error page. That is normal.
- If `yourdomain.com` already shows another site, this app replaces it.
- If you picked a version other than 22 (for example 24), remember it for Step 7.

## Step 5. Make a login key for GitHub

GitHub logs in to your hosting with a key instead of a password. A key is two files: a **private** one (secret, goes to GitHub) and a **public** one (goes to cPanel).

1. On your PC, open **Git Bash** and run:

   ```bash
   ssh-keygen -t ed25519 -C "github-deploy" -f "$HOME/flyconnect-deploy" -N ""
   ```

   This makes two files in your user folder: `flyconnect-deploy` (private) and `flyconnect-deploy.pub` (public).

2. Show the public key and copy the whole line:

   ```bash
   cat "$HOME/flyconnect-deploy.pub"
   ```

3. cPanel > **SSH Access** > **Manage SSH Keys** > **Import Key**.
   - Name: `flyconnect-deploy`
   - Paste the line into the **public key** box. Leave the private key and passphrase boxes empty.
   - Click **Import**.
4. Go back to **Manage SSH Keys**. Next to the new key click **Manage**, then **Authorize**.
5. Test the login from Git Bash, with your own values:

   ```bash
   ssh -i "$HOME/flyconnect-deploy" -p PORT CPANELUSER@HOST
   ```

   The first time it asks "Are you sure you want to continue connecting?". Type `yes`. If you then see a command prompt from the hosting, it works. Type `exit` to leave.

6. Get the hosting's identity lines. GitHub uses them to be sure it is talking to your hosting and not to someone else:

   ```bash
   ssh-keyscan -p PORT HOST
   ```

   Copy the lines that do **not** start with `#`. You need them in Step 7.

## Step 6. The backend's settings file on the hosting

Passwords live only in this file on the hosting. They are never saved to GitHub.

1. cPanel > **File Manager**. Click **Settings** (top right), tick **Show Hidden Files**, save.
2. Open the folder `flyconnect-tech`. Create a folder there called `uploads`.
3. Open `flyconnect-tech/backend`. Click **+ File**, name it `.env` (with the dot at the start).
4. Right-click `.env` > **Edit**, and paste this with your own values:

   ```ini
   NODE_ENV=production
   FRONTEND_URL=https://yourdomain.com
   BACKEND_URL=https://api.yourdomain.com
   DATABASE_URL=mysql://CPANELUSER_fcapp:THE-PASSWORD@localhost:3306/CPANELUSER_fctech
   UPLOAD_DIR=/home/CPANELUSER/flyconnect-tech/uploads

   AUTH_SECRET=A-LONG-RANDOM-TEXT
   COOKIE_DOMAIN=yourdomain.com
   TRUST_PROXY=true

   SMTP_HOST=THE-OUTGOING-SERVER
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=hello@yourdomain.com
   SMTP_PASS=THE-MAILBOX-PASSWORD
   EMAIL_FROM="FlyConnect Tech Support <hello@yourdomain.com>"
   ```

5. Save. Then right-click `.env` > **Change Permissions** and set it to `600` (only the owner can read and write).

Notes:
- `FRONTEND_URL` must be exactly the address visitors use. If the site opens as `https://www.yourdomain.com`, write it with `www`. No slash at the end. The same goes for `BACKEND_URL`.
- `AUTH_SECRET` protects everyone's sign-in. Make a new one on your PC with
  `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`
  and paste the result. Never reuse the one from your PC's `.env`, and never share it. Changing it later signs everybody out.
- `COOKIE_DOMAIN` is your main domain without `www` or `https://`. It lets one sign-in work on both `yourdomain.com` and `api.yourdomain.com`.
- `TRUST_PROXY=true` because the hosting's web server sits in front of the app. Without it, the limits on sign-in attempts would count every visitor as one person.
- **Email** (invitations and password resets need it):
  1. cPanel > **Email Accounts** > **Create**: make the mailbox that sends the emails, for example `hello@yourdomain.com`, with a strong password.
  2. Click **Connect Devices** next to it. Under "Secure SSL/TLS Settings" it shows the **Outgoing Server** and its port (usually 465). Put them in `SMTP_HOST` and `SMTP_PORT`, the mailbox address in `SMTP_USER` and its password in `SMTP_PASS`.
  3. Port 465 needs `SMTP_SECURE=true`. If you use port 587 instead, write `SMTP_SECURE=false` (587 switches to encryption by itself).
  4. `EMAIL_FROM` is the sender people see. Use the same mailbox address.
- If a password has symbols such as `#` or spaces, put the whole value in double quotes.
- The website needs no settings file on the hosting.

## Step 7. GitHub: secrets and variables

On GitHub, open the repository > **Settings** > **Secrets and variables** > **Actions**.

**Secrets tab** > **New repository secret**. Add these four:

| Name | Value |
|---|---|
| `SSH_HOST` | `HOST` from Step 5 |
| `SSH_USER` | your cPanel username |
| `SSH_PRIVATE_KEY` | everything in the private key file. Show it with `cat "$HOME/flyconnect-deploy"` and copy it all, including the `-----BEGIN` and `-----END` lines |
| `SSH_KNOWN_HOSTS` | the lines you copied at the end of Step 5 |

**Variables tab** > **New repository variable**. Add these:

| Name | Value |
|---|---|
| `SSH_PORT` | `PORT` from Step 5, for example `22` |
| `SITE_URL` | `https://yourdomain.com` (the same as `FRONTEND_URL` in Step 6, no slash at the end) |
| `API_URL` | `https://api.yourdomain.com` (no slash at the end) |
| `FRONTEND_PATH` | `flyconnect-tech/frontend` |
| `BACKEND_PATH` | `flyconnect-tech/backend` |
| `NODE_VERSION` | only if you did not pick 22 in Step 4. Write the first number, for example `24` |

`FRONTEND_PATH` and `BACKEND_PATH` must be exactly the "Application root" values from Step 4.

## Step 8. Turn it on and deploy

1. In the **Variables** tab, add one more: `DEPLOY_ENABLED` with the value `true`.
2. Open the **Actions** tab > **Deploy** (left list) > **Run workflow** > branch `main` > **Run workflow**.
3. Wait for it to finish. A green tick means it is live.
4. Check:
   - `https://api.yourdomain.com/health` shows `{"status":"ok","database":"up"}`.
   - `https://yourdomain.com` shows the FlyConnect Tech home page.
5. The private key file on your PC (`flyconnect-deploy`) is no longer needed there. Delete it, or keep it somewhere safe. Never share it and never add it to the project.

From now on, every push to `main` deploys by itself.

## Step 9. Create the first super admin

Nobody can sign up on the website. Every account is made by someone in the team, so the very first one (yours) is made with a command on the hosting.

1. cPanel > **Setup Node.js App** > click the pencil next to the **backend** app. At the top it shows a command that starts with `source` and ends with `activate`. Copy it.
2. cPanel > **Terminal** (or log in over SSH). Paste that command and press Enter.
3. Then run these two lines, with your own name and email:

   ```bash
   cd ~/flyconnect-tech/backend
   node dist/cli/invite-user.js --role super-admin --name "Your Name" --email you@yourdomain.com
   ```

4. It sends you the invitation email and also prints the link, in case the email is slow. Open the link, choose your password, then sign in at `https://yourdomain.com/team/sign-in`. You will be asked to set up two-factor sign-in with an authenticator app (Google Authenticator, Microsoft Authenticator or similar).

Notes:
- The link works once, for 48 hours. If it runs out, run the same command with a different email, or ask for a new link once you have another admin.
- Anyone who has the link can take over the account, so do not forward it.
- After that, add everyone else from the team panel: **Users > + Add user** for team members, and **Customers > + Add customer** for customers and their projects. Both send the invitation email. Resend invitation, Disable user and Send password reset link are there too.
- The command still works if you ever need it: `--role` can be `super-admin`, `admin`, `manager`, `developer` or `customer`. A customer also needs `--company "Company name"`.

### Give a customer a project

A customer can only send a support request about one of their own projects. The normal way is the team panel: projects are added with **+ Add customer**, and later with **Add project** on the customer's page, where admins can also change a project's status. If you ever need it, there is also a command, in the same place as above (after the `source … activate` line and `cd ~/flyconnect-tech/backend`):

```bash
node dist/cli/add-project.js --email customer@theircompany.com --name "Bluewave booking website" --type travel-booking-platform --status live
```

- `--email` is the customer's email, the one their invitation went to.
- `--type` can be `website`, `web-application`, `travel-booking-platform`, `agent-portal`, `api-integration`, `custom-software`, `ui-ux-design` or `maintenance-plan`.
- `--status` can be `planning` (if you leave it out), `in-design`, `in-development`, `live` or `completed`.
- It prints the project's code, for example `P-0001`. Run it once for each project.

---

## Everyday use

- **Deploy:** push to `main`. Watch it in the **Actions** tab.
- **Deploy again without a change:** Actions > Deploy > **Run workflow**.
- **Pause deploys:** set the variable `DEPLOY_ENABLED` to `false`. Checks still run.
- **Change a backend setting:** edit `.env` on the hosting, then cPanel > Setup Node.js App > **Restart** on the backend app.
- **Change the site or API address:** change `SITE_URL` / `API_URL` on GitHub (and `FRONTEND_URL` in `.env`), then run the deploy again. The addresses are built into the website, so a restart alone is not enough.

## Going back to an earlier version

1. Actions > Deploy.
2. Open the last run that worked.
3. Click **Re-run all jobs**. It deploys that older version again.

Database changes are **not** undone by this. If a deploy changed the database (new tables or columns), ask before going back.

## If something goes wrong

| What you see | What to do |
|---|---|
| The deploy part is grey / skipped | `DEPLOY_ENABLED` is not `true`, or the run was not on `main` |
| "… is not set" | Add that secret or variable (Step 7) |
| "… must be a folder inside a folder" or "must not be inside public_html" | Fix `FRONTEND_PATH` / `BACKEND_PATH` (Step 7). This check exists so files are never copied into the wrong place |
| "Could not log in to the hosting" | Check the key is **Authorized** in cPanel (Step 5), and that `SSH_HOST`, `SSH_PORT`, `SSH_USER` are right. Run the test login from Step 5 again. If the hosting moved server, redo the `ssh-keyscan` line and update `SSH_KNOWN_HOSTS` |
| "The folder … does not exist on the hosting" | The "Application root" in cPanel and the path variable on GitHub are not the same (Steps 4 and 7) |
| "No Node.js app was found for the folder …" | Same as above, for the backend |
| "The settings file … .env is missing" | Do Step 6 |
| Error while "Updating the database", with "Access denied" | Wrong database name, user or password in `DATABASE_URL`, or the user was not added to the database with ALL PRIVILEGES (Step 3) |
| "… did not answer" at the end, or the site shows a 503 error | In File Manager open the app's folder and read `stderr.log`. The usual causes: the Node.js version is below 22, a mistake in `.env`, or a database password with symbols in it |
| No invitation or reset email arrives | Check the `SMTP_` settings in `.env` (Step 6), restart the backend app, and look in `stderr.log` for "email". The invite command prints the link anyway |
| Signing in seems to work but you land back on the sign-in page | `COOKIE_DOMAIN` is missing or wrong, or `BACKEND_URL` / `FRONTEND_URL` do not match the real addresses (Step 6) |
| The site opens but says "Backend not running" | `API_URL` is wrong, `FRONTEND_URL` in `.env` does not match the site's address exactly (check `www`), or `api.yourdomain.com` has no padlock yet |
| "rsync: command not found" | Ask your hosting's support to enable `rsync` for SSH on your account |
| The Checks part is red | A test failed. Nothing was deployed. Open the red step to see which test |

## What lives where

| Thing | Place |
|---|---|
| The workflows | `.github/workflows/ci.yml` (checks), `.github/workflows/deploy.yml` (deploy) |
| The script that runs on the hosting | `.github/scripts/remote-backend.sh` |
| The backend's start file for cPanel | `backend/app.cjs` |
| Passwords | only in `flyconnect-tech/backend/.env` on the hosting |
| The login key | only in the GitHub secret `SSH_PRIVATE_KEY` |
| Uploaded files | `flyconnect-tech/uploads` on the hosting: the files customers and the team attach to support requests. A deploy never touches it. Back it up together with the database |

A deploy replaces only these folders on the hosting: the backend's `dist` and `prisma`, and the website's `.next`, `node_modules` and `public`. It leaves `.env`, `uploads` and everything else alone.
