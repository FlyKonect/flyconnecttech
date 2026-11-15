// Reads .env into process.env before anything else is loaded. Import it
// first in every entry point (main.ts and the commands in cli/).
//
// React picks its development or production build from NODE_ENV the first
// time it is loaded, and the email renderer loads react-dom later. If .env
// were read after React (as ConfigModule does), the two builds would differ
// and every email would fail with "dispatcher.getOwner is not a function".
// Values already set (for example by cPanel) are kept.
import { config } from 'dotenv';

config({ quiet: true });
