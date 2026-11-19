# Going live: setup guide

This guide puts FlyConnect Tech on your **Krystal business hosting** (cPanel), in this order:

1. **Part A, once:** GitHub and the login key.
2. **Part B, the website:** `https://flyconnecttech.co.uk` goes live first.
3. **Part C, the backend:** `https://api.flyconnecttech.co.uk` (database, sign-in, emails, the client portal and team panel).

When it is all done, every push to the `main` branch on GitHub puts the new version live by itself.

**Deploying by hand instead** (no GitHub, no SSH: both apps from cPanel File Manager): the short checklist is [deploy-by-hand.md](deploy-by-hand.md).

> **Not yet tested on the real hosting.** The deploy was rehearsed on a PC, and each part passed. It has not run against your Krystal account, because that needs your logins. If a step fails, copy the red error text (from GitHub or cPanel) and send it to Claude.

**Until Part C is done**, the website's pages all work, but the forms (Book a demo, Get a quote, Send a message) and Client login answer "Backend not running", because the backend is not there yet.

## How it works

1. You push code to `main` on GitHub.
2. GitHub runs the checks for both apps. If one fails, it stops and nothing changes on the live site.
3. GitHub builds the apps and copies them to Krystal over SSH (a secure login).
4. On Krystal it restarts the apps. For the backend it also installs its packages and updates the database.
5. It opens the live site (and the backend) to confirm they answer.

Pushes to other branches, and pull requests, only run the checks. They never deploy.

## Your values

Keep this table open: the steps tell you when to use each value.

| Name in this guide | Your value | Where to find it |
|---|---|---|
| Website address | `https://flyconnecttech.co.uk` | your domain |
| Backend address | `https://api.flyconnecttech.co.uk` | made in Step 8 |
| `CPANELUSER` | the hosting account's username (for this account: `flyconne`) | cPanel home page, right-hand column **General Information**: the last part of **Home Directory** (`/home/flyconne`). If you log in to cPanel as a team member, **Current User** is your own name, not the account's: use the **Team Owner** name instead |
| `HOST` | the server's name | cPanel right-hand column > **Server Information** > **Hostname** (it looks like `something.krystal.uk`). Once your domain points to Krystal, `flyconnecttech.co.uk` works too |
| `PORT` | `722` | Krystal uses port **722** for SSH, not the usual 22. If 722 does not connect in Step 3, search Krystal's help pages for "SSH" |
| Database name, user and password | you make them | Step 9 |
| Mailbox and its password | you make them | Step 10 |

Write the values somewhere safe (a password manager). Never put passwords in GitHub, in this project, or in a chat.

---

# Part A. Once, before anything else

## Step 1. Check before you start

- [ ] You can log in to cPanel (Krystal client area > **Services** > your hosting > **Login to cPanel**).
- [ ] cPanel has **Setup Node.js App** (under Software) and **SSH Access** (under Security).
- [ ] **SSH shell access is switched on.** Krystal switches it off by default. Open a ticket (Krystal client area > **Support** > **Open Ticket**) asking them to "enable SSH shell access (a jailed shell is fine) for my cPanel account, to deploy a Node.js app with rsync over SSH", and to confirm `rsync` is available. Until then the test in Step 3 says "Shell access is not enabled on your account".
- [ ] In **Setup Node.js App** > **Create Application**, the **Node.js version** list offers **22 or newer** (22.12 at the least). If the newest is below 22, stop and ask Krystal support to add it. The apps do not start on an older version.
- [ ] `flyconnecttech.co.uk` points to your Krystal hosting: it is listed in cPanel > **Domains**.
- [ ] You have a GitHub account.

## Step 2. Put the project on GitHub

1. On github.com, click **New repository**.
2. Name it, for example `flyconnect-tech`. Choose **Private**. Do not add a README or any other file. Click **Create repository**.
3. On your PC, open **Git Bash** in the `flyconnecttech` folder and run these two lines, with your own GitHub name:

   ```bash
   git remote add origin https://github.com/YOUR-GITHUB-NAME/flyconnect-tech.git
   git push -u origin main
   ```

4. On GitHub, open the **Actions** tab. A run called **Deploy** starts. Its **Checks** part should finish with green ticks. The deploy part is skipped: that is correct, it stays off until Step 7.

## Step 3. Make a login key so GitHub can reach Krystal

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
5. Test the login from Git Bash, with your `CPANELUSER` and `HOST` from "Your values":

   ```bash
   ssh -i "$HOME/flyconnect-deploy" -p 722 CPANELUSER@HOST
   ```

   The first time it asks "Are you sure you want to continue connecting?". Type `yes`. If you then see a command prompt from the hosting, it works. Type `exit` to leave.

6. Get the hosting's identity lines. GitHub uses them to be sure it is talking to Krystal and not to someone else:

   ```bash
   ssh-keyscan -p 722 HOST
   ```

   Copy the lines that do **not** start with `#`. You need them in the next step.

## Step 4. GitHub: the login secrets

On GitHub, open the repository > **Settings** > **Secrets and variables** > **Actions** > **Secrets** tab > **New repository secret**. Add these four:

| Name | Value | Where it comes from |
|---|---|---|
| `SSH_HOST` | `HOST` | "Your values" |
| `SSH_USER` | `CPANELUSER` | "Your values" |
| `SSH_PRIVATE_KEY` | everything in the private key file, including the `-----BEGIN` and `-----END` lines | run `cat "$HOME/flyconnect-deploy"` in Git Bash and copy it all |
| `SSH_KNOWN_HOSTS` | the lines you copied | Step 3, part 6 |

---

# Part B. The website: flyconnecttech.co.uk

## Step 5. cPanel: create the website's Node.js app

1. cPanel > **Setup Node.js App** > **Create Application**.
2. Fill in:

   | Field | Value |
   |---|---|
   | Node.js version | 22 or newer (the newest offered is fine). Write the first number down, for example `22` |
   | Application mode | Production |
   | Application root | `flyconnect-tech/frontend` |
   | Application URL | `flyconnecttech.co.uk` (leave the box after it empty) |
   | Application startup file | `server.js` |

3. Click **Create**.

- **Do not click "Run NPM Install".** The deploy puts everything in place. Clicking it can break the website.
- Until the first deploy, the address shows an error page. That is normal.
- If `flyconnecttech.co.uk` already shows another site, this app replaces it. Your main site on `flyconnect.co.uk` (in `public_html`) is not touched: the new apps live in their own `flyconnect-tech` folder.
- cPanel > **SSL/TLS Status**: `flyconnecttech.co.uk` should have a green padlock. If not, click **Run AutoSSL** and wait (up to an hour).

## Step 6. GitHub: the website's variables

GitHub > repository > **Settings** > **Secrets and variables** > **Actions** > **Variables** tab > **New repository variable**. Add these:

| Name | Value | Notes |
|---|---|---|
| `SSH_PORT` | `722` | Krystal's SSH port |
| `SITE_URL` | `https://flyconnecttech.co.uk` | no slash at the end |
| `API_URL` | `https://api.flyconnecttech.co.uk` | no slash at the end. The website needs it now, even though the backend comes in Part C |
| `FRONTEND_PATH` | `flyconnect-tech/frontend` | exactly the "Application root" from Step 5 |
| `DEPLOY_BACKEND` | `false` | only the website is deployed for now. Step 13 changes it to `true` |
| `NODE_VERSION` | only if you did not pick 22 in Step 5: the first number, for example `24` | leave it out for 22 |

## Step 7. Deploy the website

1. In the **Variables** tab, add one more: `DEPLOY_ENABLED` with the value `true`.
2. Open the **Actions** tab > **Deploy** (left list) > **Run workflow** > branch `main` > **Run workflow**.
3. Wait for it to finish (about 10 minutes). A green tick means the website is live.
4. Open `https://flyconnecttech.co.uk`. You should see the FlyConnect Tech home page. Click through a few pages.
5. If it fails, see "If something goes wrong" at the end.

## Without SSH: put the website live from File Manager

Use this while Krystal has not switched on SSH yet (Step 1). It replaces Steps 6 and 7 for the website; Step 5 (the Node.js app) is still needed. Once SSH works, GitHub takes over and this is no longer needed. The backend can go live by hand too: [deploy-by-hand.md](deploy-by-hand.md), B4.

**1. Build the zip on your PC.** Ask Claude for "the website zip for File Manager". It is made like this, in the `frontend` folder (Git Bash):

```bash
NEXT_PUBLIC_SITE_URL=https://flyconnecttech.co.uk NEXT_PUBLIC_API_URL=https://api.flyconnecttech.co.uk npm run build
cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/
cd .next/standalone && /c/Windows/System32/tar.exe -a -c -f ../../../../flyconnecttech-website.zip .next node_modules public server.js package.json
```

The zip (about 12 MB) is `flyconnecttech-website.zip`, in the folder above the project. It has the live addresses built in. Use Windows' own `tar.exe` as above: zips made by PowerShell's Compress-Archive have the wrong kind of slashes for the hosting.

**2. Upload it.**
1. cPanel > **File Manager**. Click **Settings** (top right), tick **Show Hidden Files (dotfiles)**, click **Save**. The zip has a hidden folder called `.next`.
2. Open the folder `flyconnect-tech/frontend` (cPanel made it in Step 5). If there is a `server.js` there already, it is cPanel's sample: delete it.
3. Click **Upload**, choose `flyconnecttech-website.zip`, wait for 100%, then click **Go Back to …**.
4. Right-click the zip > **Extract**. Check the folder shown is `/home/flyconne/flyconnect-tech/frontend` and click **Extract File(s)**.
5. You should now see `.next`, `node_modules`, `public`, `server.js` and `package.json`. Delete the zip.

**3. Restart.** cPanel > **Setup Node.js App** > the `flyconnecttech.co.uk` app > **Restart**. Do not click "Run NPM Install".

**4. Check.** Open `https://flyconnecttech.co.uk`. The pages work; the forms and Client login say "Backend not running" until Part C.

**For an update:** build a new zip, then in File Manager delete `.next`, `node_modules`, `public`, `server.js` and `package.json` from `flyconnect-tech/frontend`, upload and extract the new zip, and restart.

---

# Part C. The backend: api.flyconnecttech.co.uk

## Step 8. cPanel: the api address

1. cPanel > **Domains** > **Create A New Domain**.
2. Domain: `api.flyconnecttech.co.uk`. Untick **Share document root**. Click **Submit**.
3. cPanel > **SSL/TLS Status**. Wait until `api.flyconnecttech.co.uk` shows a green padlock. Click **Run AutoSSL** if it does not. This can take up to an hour.

## Step 9. cPanel: the database

1. cPanel > **Manage My Databases** (it may be called **MySQL Databases**).
2. **Create New Database**: type `fctech`. cPanel puts your username in front, so the full name is `CPANELUSER_fctech`. Write the full name down.
3. **Add New User**: type `fcapp` (full name `CPANELUSER_fcapp`). Click **Password Generator** and make a password with **letters and numbers only**: symbols such as `@`, `#` or `/` break the database address. Write the password down.
4. **Add User To Database**: pick that user and that database, click **Add**, tick **ALL PRIVILEGES**, click **Make Changes**.
5. Set the text format, so every language and symbol saves correctly:
   - cPanel > **phpMyAdmin**. Click your database in the left list.
   - Open the **Operations** tab.
   - Under **Collation**, choose `utf8mb4_unicode_ci`, then click **Go**.

## Step 10. cPanel: the mailbox that sends the emails

Invitations, password resets, support request updates and the website's form emails are all sent from one mailbox.

1. cPanel > **Email Accounts** > **+ Create**.
2. Domain `flyconnecttech.co.uk`, username for example `info` (the address is `info@flyconnecttech.co.uk`). Choose a strong password and write it down. Click **Create**.
3. Next to the new mailbox, click **Connect Devices**. Under **Secure SSL/TLS Settings (Recommended)** write down:
   - **Outgoing Server**: usually the server name, like `something.krystal.uk`;
   - **SMTP Port**: usually `465`.
4. People who reply to the emails reach this mailbox, so someone should read it (cPanel > Email Accounts > **Check Email**, or add it to your phone).

## Step 11. cPanel: create the backend's Node.js app

1. cPanel > **Setup Node.js App** > **Create Application**.
2. Fill in:

   | Field | Value |
   |---|---|
   | Node.js version | the **same** version as the website (Step 5) |
   | Application mode | Production |
   | Application root | `flyconnect-tech/backend` |
   | Application URL | `api.flyconnecttech.co.uk` |
   | Application startup file | `app.cjs` |

3. Click **Create**. **Do not click "Run NPM Install"**: the deploy installs what is needed. (By hand without SSH you do click it, after uploading the files: [deploy-by-hand.md](deploy-by-hand.md), B4.)
4. At the top of the app's page there is a command that starts with `source` and ends with `activate`. Copy it and keep it: Steps 14 and 15 use it.

## Step 12. The backend's settings file (.env)

Passwords live only in this file on Krystal. They are never saved to GitHub.

1. cPanel > **File Manager**. Click **Settings** (top right), tick **Show Hidden Files (dotfiles)**, click **Save**.
2. Open the folder `flyconnect-tech`. Click **+ Folder** and make a folder called `uploads` (the files people attach to support requests go there).
3. Open `flyconnect-tech/backend`. Click **+ File**, name it `.env` (with the dot at the start), click **Create New File**.
4. Right-click `.env` > **Edit** > **Edit**, paste this, and change the values in CAPITALS:

   ```ini
   NODE_ENV=production
   FRONTEND_URL=https://flyconnecttech.co.uk
   BACKEND_URL=https://api.flyconnecttech.co.uk
   DATABASE_URL=mysql://CPANELUSER_fcapp:DATABASE-PASSWORD@localhost:3306/CPANELUSER_fctech
   UPLOAD_DIR=/home/CPANELUSER/flyconnect-tech/uploads

   AUTH_SECRET=A-LONG-RANDOM-TEXT
   COOKIE_DOMAIN=flyconnecttech.co.uk
   TRUST_PROXY=true

   SMTP_HOST=OUTGOING-SERVER
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=info@flyconnecttech.co.uk
   SMTP_PASS=MAILBOX-PASSWORD
   EMAIL_FROM="FlyConnect Tech Support <info@flyconnecttech.co.uk>"
   ```

5. Click **Save Changes**. Then right-click `.env` > **Change Permissions**, set it to `600` (only the owner can read and write) and click **Change Permissions**.

Where each value comes from:

| Setting | What to write | Where it comes from |
|---|---|---|
| `NODE_ENV` | `production` | always this |
| `FRONTEND_URL` | `https://flyconnecttech.co.uk` | the website address, exactly as visitors use it, no slash at the end |
| `BACKEND_URL` | `https://api.flyconnecttech.co.uk` | Step 8 |
| `DATABASE_URL` | replace `CPANELUSER_fcapp`, `DATABASE-PASSWORD` and `CPANELUSER_fctech` | the full user name, its password and the full database name from Step 9. Keep `localhost:3306` |
| `UPLOAD_DIR` | replace `CPANELUSER` | "Your values": the **Home Directory** in cPanel's right-hand column (`/home/flyconne`) followed by `/flyconnect-tech/uploads` |
| `AUTH_SECRET` | a new random text | run `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` in Git Bash on your PC and paste the result. Never reuse the one from your PC's `.env`. Changing it later signs everybody out |
| `COOKIE_DOMAIN` | `flyconnecttech.co.uk` | your domain without `www` or `https://`. It lets one sign-in work on both addresses |
| `TRUST_PROXY` | `true` | always this on Krystal: its web server sits in front of the app, and without it the limits on sign-in attempts would count every visitor as one person |
| `SMTP_HOST` | the Outgoing Server | Step 10, part 3 |
| `SMTP_PORT` | `465` | Step 10, part 3 |
| `SMTP_SECURE` | `true` | `true` for port 465. Only if you use port 587 instead, write `false` |
| `SMTP_USER` | `info@flyconnecttech.co.uk` | the mailbox from Step 10 |
| `SMTP_PASS` | the mailbox password | Step 10, part 2. If it has symbols such as `#` or spaces, put it in double quotes |
| `EMAIL_FROM` | `"FlyConnect Tech Support <info@flyconnecttech.co.uk>"` | the name people see, and the same mailbox. Keep the double quotes |

## Step 13. Switch the backend on and deploy

1. GitHub > **Settings** > **Secrets and variables** > **Actions** > **Variables** tab:
   - add `BACKEND_PATH` with the value `flyconnect-tech/backend` (exactly the "Application root" from Step 11);
   - click the pencil next to `DEPLOY_BACKEND` and change it to `true`.
2. **Actions** > **Deploy** > **Run workflow** > branch `main` > **Run workflow**. This time it also sets up the backend: it installs its packages, creates the database tables and starts it.
3. When the tick is green, check:
   - `https://api.flyconnecttech.co.uk/health` shows `{"status":"ok","database":"up"}`;
   - `https://flyconnecttech.co.uk` still shows the home page.
4. The private key file on your PC (`flyconnect-deploy`) is no longer needed there. Delete it, or keep it somewhere safe. Never share it and never add it to the project.

From now on, every push to `main` deploys both apps by itself.

## Step 14. Create the first super admin (you)

Nobody can sign up on the website. Every account is made by someone in the team, so the very first one is made with a command on Krystal.

1. cPanel > **Terminal** (under Advanced). If you don't see Terminal, log in from Git Bash as in Step 3, part 5.
2. Paste the `source … activate` command you copied in Step 11 and press Enter.
3. Then run these two lines, with your own name and email:

   ```bash
   cd ~/flyconnect-tech/backend
   node dist/cli/invite-user.js --role super-admin --name "Your Name" --email you@flyconnecttech.co.uk
   ```

4. It emails you the invitation and also prints the link, in case the email is slow. Open the link, choose your password, then sign in at `https://flyconnecttech.co.uk/team/sign-in`. You are asked to set up two-factor sign-in with an authenticator app (Google Authenticator, Microsoft Authenticator or similar).

Notes:
- The link works once, for 48 hours. If it runs out, run the same command again.
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

## Step 15. Scheduled jobs (cPanel Cron)

Three small jobs run on a timetable. The hosting has no programs running in the background, so cPanel's **Cron Jobs** starts each one at its time:

| Job | What it does | When |
|---|---|---|
| `daily-digest` | Emails the super admins, admins and managers the support requests still waiting for review. Nothing is sent when none are waiting. Settings switch: "Daily digest of requests waiting for review". | Every day, 08:00 |
| `auto-close` | Closes support requests that have been Resolved for 7 days, and tells the customer. Settings switch: "Auto-close resolved requests after 7 days" (off at the start). | Every day, 02:00 |
| `weekly-summary` | Emails customers who ticked "Weekly summary of my requests" in their profile a summary of their requests. | Mondays, 08:00 |

1. Have the `source … activate` command from Step 11 ready.
2. cPanel > **Cron Jobs**. Under "Add New Cron Job", fill in the times (minute, hour, day, month, weekday) and the command, then click **Add New Cron Job**. Do this three times:

   | Minute | Hour | Day | Month | Weekday | Command |
   |---|---|---|---|---|---|
   | `0` | `8` | `*` | `*` | `*` | `<source … activate> && cd ~/flyconnect-tech/backend && node dist/cli/run-job.js daily-digest >> ~/flyconnect-tech/backend/jobs.log 2>&1` |
   | `0` | `2` | `*` | `*` | `*` | `<source … activate> && cd ~/flyconnect-tech/backend && node dist/cli/run-job.js auto-close >> ~/flyconnect-tech/backend/jobs.log 2>&1` |
   | `0` | `8` | `*` | `*` | `1` | `<source … activate> && cd ~/flyconnect-tech/backend && node dist/cli/run-job.js weekly-summary >> ~/flyconnect-tech/backend/jobs.log 2>&1` |

   Replace `<source … activate>` with your own command.

Notes:
- **The times are the server's clock.** cPanel shows the server's time at the top of the Cron Jobs page. If it is an hour off from UK time, move the hour by one.
- **Each run adds one line to `jobs.log`** in the backend folder, with the time and what it did, for example `daily-digest: sent to 3 of 3 people, 2 waiting`. A deploy never touches this file.
- **To try a job now**, run the same command in the Terminal (after the `source … activate` line), without the `>> …` part.
- Turning a switch off in Settings is enough to stop a job doing anything; the cron line can stay.

## Step 16. Keep the emails out of spam

Three settings on your domain tell other mail servers that Krystal may send email for `flyconnecttech.co.uk`.

1. cPanel > **Email Deliverability** (under Email).
2. Next to `flyconnecttech.co.uk`, look at **DKIM** and **SPF**. If either says there is a problem, click **Repair**, then **Repair** again to confirm. If your domain's DNS is managed somewhere other than Krystal (for example Cloudflare, or the company you bought the domain from), the page shows the exact records to add there instead.
3. Add a DMARC record, which tells other servers what to do with email that fails these checks. cPanel > **Zone Editor** > **Manage** next to `flyconnecttech.co.uk` > **+ Add Record**:
   - Type: `TXT`
   - Name: `_dmarc.flyconnecttech.co.uk.`
   - Record: `v=DMARC1; p=none; rua=mailto:info@flyconnecttech.co.uk`

   `p=none` only reports problems and blocks nothing, which is the safe start. After a few weeks with no problems you can change it to `p=quarantine`.
4. Changes can take a few hours to spread. Then check: at `https://flyconnecttech.co.uk/team/sign-in` click **Forgot password**, send yourself a link, and see that it lands in your inbox, not spam. In Gmail, **⋮** > **Show original** on that email should say `PASS` for SPF, DKIM and DMARC.

---

## Before you launch

- [ ] `https://api.flyconnecttech.co.uk/health` shows `{"status":"ok","database":"up"}`.
- [ ] You can sign in to the team panel with two-factor (Step 14).
- [ ] A password reset email reaches your inbox, not spam (Step 16).
- [ ] Book a demo, Get a quote and Send a message on the website each reach the team: an email to every super admin, admin and manager, and a line in the team panel.
- [ ] Add one test customer (Customers > + Add customer), open their invitation, send a support request from the portal, and reply from the team panel. Then disable that test customer on the customer's page.
- [ ] The scheduled jobs are in cPanel Cron, and `jobs.log` gets new lines each day (Step 15).
- [ ] Settings (team panel) has the response times and notifications you want.
- [ ] The mailbox `info@flyconnecttech.co.uk` exists (cPanel > Email Accounts): the website shows it to visitors.
- [ ] Team panel > **Website content**: the live-project link is right, and you have added any client testimonials you have permission to show (Home and Case Studies hide that part until you do).
- [ ] Someone has checked the texts of the Privacy, Terms and Cookies pages (`/privacy`, `/terms`, `/cookies`).
- [ ] Still hidden until you have them (ask Claude to add them): team members and photos (About), product screenshots, further case studies.

## Everyday use

- **Deploy:** push to `main`. Watch it in the **Actions** tab.
- **Deploy again without a change:** Actions > Deploy > **Run workflow**.
- **Pause deploys:** set the variable `DEPLOY_ENABLED` to `false`. Checks still run.
- **Change a backend setting:** edit `.env` in File Manager, then cPanel > Setup Node.js App > **Restart** on the backend app.
- **Change response times or team notifications:** sign in as a super admin, team panel > **Settings**. These live in the database, not in `.env`: a deploy never changes them, and a new site starts with the defaults (Urgent 1 hour, High 4 hours, Medium 1 business day, Low 2 business days; auto-close off).
- **Change the site or API address:** change `SITE_URL` / `API_URL` on GitHub (and `FRONTEND_URL` / `BACKEND_URL` in `.env`), then run the deploy again. The addresses are built into the website, so a restart alone is not enough.
- **Backups:** the important things are the database and the folder `flyconnect-tech/uploads`. cPanel's backup tools (on Krystal, **JetBackup**) cover both.

## Going back to an earlier version

1. Actions > Deploy.
2. Open the last run that worked.
3. Click **Re-run all jobs**. It deploys that older version again.

Database changes are **not** undone by this. If a deploy changed the database (new tables or columns), ask before going back.

## Security

- **Security headers come from the apps themselves**, on every page and every backend answer: which scripts may run, no showing the site inside other sites, https only. Nothing needs setting in cPanel.
- **Limits on sign-in attempts and the website's forms** are counted inside the backend app. If cPanel runs more than one copy of the backend when the site is busy, each copy counts on its own, so a visitor gets a few more tries than the limit. That is still a limit, and normal for this kind of hosting.
- After the first sign-in, look in the backend's `stderr.log` (File Manager > `flyconnect-tech/backend`) for the words **"Rate limiting could not determine a client IP"**. If they appear, tell Claude: the hosting is not passing on visitors' addresses.
- Passwords are only in `.env` on Krystal (permission `600`). GitHub holds only the login key.

## If something goes wrong

| What you see | What to do |
|---|---|
| The deploy part is grey / skipped | `DEPLOY_ENABLED` is not `true`, or the run was not on `main` |
| "… is not set" | Add that secret (Step 4) or variable (Steps 6 and 13) |
| "DEPLOY_BACKEND must be true or false" | Fix the variable's value (Steps 6 and 13): exactly `true` or `false` |
| "… must be a folder inside a folder" or "must not be inside public_html" | Fix `FRONTEND_PATH` / `BACKEND_PATH`. This check exists so files are never copied into the wrong place |
| "Could not log in to the hosting" | Check the key is **Authorized** in cPanel (Step 3), that `SSH_PORT` is `722`, and that `SSH_HOST` and `SSH_USER` are right. Run the test login from Step 3 again. If Krystal moved your account to another server, redo the `ssh-keyscan` line and update `SSH_KNOWN_HOSTS` |
| "The folder … does not exist on the hosting" | The "Application root" in cPanel and the path variable on GitHub are not the same (Steps 5, 6, 11 and 13) |
| "No Node.js app was found for the folder …" | Same as above, for the backend |
| "The settings file … .env is missing" | Do Step 12 |
| Error while "Updating the database", with "Access denied" | Wrong database name, user or password in `DATABASE_URL`, or the user was not added to the database with ALL PRIVILEGES (Step 9) |
| "… did not answer" at the end, or the site shows a 503 error | In File Manager open the app's folder and read `stderr.log`. The usual causes: the Node.js version is below 22, a mistake in `.env`, or a database password with symbols in it |
| `stderr.log` says "URIError: URI malformed" | The database password has a symbol in it (`%`, `@`, `#`, `/` …). In cPanel > Manage My Databases > **Current Users**, click **Change Password** next to the user and choose one with letters and numbers only. Put it in `DATABASE_URL` in `.env`, then **Restart** the backend app |
| The website's forms or Client login say "Backend not running" | Before Part C, that is expected. After it: `API_URL` is wrong, `FRONTEND_URL` in `.env` does not match the site's address exactly, or `api.flyconnecttech.co.uk` has no padlock yet |
| A scheduled job seems not to run | Look at `jobs.log` in the backend folder (Step 15). No new lines means the cron line is wrong: run its command in the Terminal to see the error |
| No invitation or reset email arrives | Check the `SMTP_` settings in `.env` (Step 12), restart the backend app, and look in `stderr.log` for "email". The invite command prints the link anyway |
| Emails arrive, but in spam | Do Step 16, and check `EMAIL_FROM` uses the same mailbox as `SMTP_USER` |
| Signing in seems to work but you land back on the sign-in page | `COOKIE_DOMAIN` is missing or wrong, or `BACKEND_URL` / `FRONTEND_URL` do not match the real addresses (Step 12). Open the site as `https://flyconnecttech.co.uk`, without `www` |
| Git Bash says `$'\302\226ssh': command not found` (or similar strange characters before a command) | An invisible character came along when the line was copied. Type the command by hand instead of pasting it |
| The test login in Step 3 asks for a password | The key was not accepted, so do not type a password: press Ctrl+C. In cPanel > SSH Access > Manage SSH Keys, the key must be listed and **authorized**; the username must be the account's (the **Team Owner**, or the last part of **Home Directory**, not a team member's **Current User**); and `ls ~/flyconnect-deploy*` in Git Bash must show the two key files. Run the login again with `-v` after `ssh` to see why the key was refused |
| "Shell access is not enabled on your account! If you need shell access please contact support." | The key worked, but Krystal has SSH shell access switched off. Ask Krystal support to enable it (Step 1). Meanwhile the website can go live from File Manager ("Without SSH", after Step 7) |
| A warning about "post-quantum key exchange" | Harmless: the server uses an older SSH version. The login still works |
| PowerShell says "Corrupted MAC on input" when you test the login | A known fault in the SSH program that comes with Windows. Use **Git Bash** instead (Step 3), or add `-m hmac-sha2-512` after `ssh`. It does not affect GitHub's deploys |
| "rsync: command not found" | Ask Krystal support to enable `rsync` for SSH on your account |
| The Checks part is red | A test failed. Nothing was deployed. Open the red step to see which test |

## What lives where

| Thing | Place |
|---|---|
| The workflows | `.github/workflows/ci.yml` (checks), `.github/workflows/deploy.yml` (deploy) |
| The script that runs on the hosting | `.github/scripts/remote-backend.sh` |
| The website on Krystal | `flyconnect-tech/frontend` (started by `server.js`) |
| The backend on Krystal | `flyconnect-tech/backend` (started by `app.cjs`) |
| Passwords | only in `flyconnect-tech/backend/.env` on Krystal |
| The login key | only in the GitHub secret `SSH_PRIVATE_KEY` |
| Uploaded files | `flyconnect-tech/uploads` on Krystal: the files customers and the team attach to support requests. A deploy never touches it. Back it up together with the database |

A deploy replaces only these folders on the hosting: the backend's `dist` and `prisma`, and the website's `.next`, `node_modules` and `public`. It leaves `.env`, `uploads`, `jobs.log` and everything else alone.
