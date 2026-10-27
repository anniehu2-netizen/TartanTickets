# Tartan Tickets

A Next.js demo for browsing upcoming Carnegie Mellon University events,
searching and filtering them, and making simulated ticket reservations. Events
and reservations are kept in server memory; there is no sign-in, database, real
payment, or email delivery.
Reservations and buyer details disappear when the server process restarts. The
sold-out event's “Join waitlist” button is a placeholder for a later story.

## Run locally

You need Node.js 24 or newer and npm. From this folder, install dependencies
once and start the development server:

```bash
npm install
npm run dev
```

If you installed Node.js using the user-level setup for this project and your
terminal cannot find `npm`, add its location to the current terminal first:

```bash
export PATH="$HOME/.local/node-v24.22.1/bin:$PATH"
```

Then open [http://localhost:3000](http://localhost:3000). Use Ctrl+C in the
terminal to stop the server.

## Check the project

```bash
npm test
npm run lint
npm run build
```
