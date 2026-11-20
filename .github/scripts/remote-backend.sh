#!/usr/bin/env bash
# Runs ON THE HOSTING, sent there by .github/workflows/deploy.yml.
# It installs the backend's packages, updates the database and restarts the app.
#
# APP_PATH is the backend's folder, written from the home folder
# (for example flyconnect-tech/backend).

set -euo pipefail

: "${APP_PATH:?APP_PATH is not set}"
cd "$HOME/$APP_PATH"

# cPanel keeps each Node.js app's own copy of Node.js in ~/nodevenv/<app folder>/<version>.
# "activate" switches this session to it.
activate=""
for candidate in "$HOME/nodevenv/$APP_PATH"/*/bin/activate; do
  if [ -f "$candidate" ]; then
    activate="$candidate"
  fi
done

if [ -z "$activate" ]; then
  echo "::error::No Node.js app was found for the folder $APP_PATH. In cPanel > Setup Node.js App, create the backend app with this folder as its Application root (docs/deploy.md, step 11)."
  exit 1
fi

set +u
# shellcheck disable=SC1090
source "$activate"
set -u

echo "Using Node.js $(node --version) and npm $(npm --version)"

if [ ! -f .env ]; then
  echo "::error::The settings file $APP_PATH/.env is missing on the hosting. Create it first (docs/deploy.md, step 12)."
  exit 1
fi

# "npm install", not "npm ci": on cPanel the node_modules folder is a link that
# belongs to the Node.js app, and "npm ci" would delete it.
# cPanel runs the install inside the app's own Node.js folder (~/nodevenv/.../lib),
# where prisma/schema.prisma is not, so the postinstall skips "prisma generate":
# dist already holds the database client built on GitHub.
#
# Installing is the slowest part on shared hosting, so it runs only when the
# packages changed: when package-lock.json differs from the last install, or
# when there is no record of one, or the packages are missing.
lock_hash="$(sha256sum package-lock.json | cut -d' ' -f1)"
if [ -f .installed-lock ] && [ "$(cat .installed-lock)" = "$lock_hash" ] \
  && [ -e node_modules/@prisma/client ] && [ -e node_modules/@nestjs/core ]; then
  echo "Packages are the same as the last install: skipping npm install."
else
  echo "Installing packages..."
  npm install --omit=dev --no-audit --no-fund
  echo "$lock_hash" > .installed-lock
fi

echo "Updating the database..."
npx --no prisma migrate deploy

echo "Restarting the backend..."
mkdir -p tmp
touch tmp/restart.txt

echo "Backend done."
