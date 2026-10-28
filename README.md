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

## Security spec audit

This table describes the current demo build, not planned behavior.

| Requirement | Status | Why |
|---|---|---|
| SEC-1 | Not at all | There is no CMU sign-in; the demo collects typed buyer details and has no authentication system. |
| SEC-2 | Not at all | The app has no sign-in sessions or inactivity timeout. |
| SEC-3 | Not at all | The project does not configure HTTPS-only access or an HSTS security header. |
| SEC-4 | Not at all | Requests are not checked against user roles or club membership. |
| SEC-5 | Not at all | There are no protected club resources, access-denial logs, or officer authorization checks. |
| SEC-6 | Not at all | The app has no ticket lookup or ownership checks. |
| SEC-7 | Partly | No card details are collected, but the demo does not use Stripe Checkout. |
| SEC-8 | Partly | The server now computes the total from the stored event price times the seat count and ignores any amount sent by the browser, but this demo still does not use Stripe Checkout or actually charge a card. |
| SEC-9 | Not at all | There is no Stripe webhook endpoint or signature verification. |
| SEC-10 | Not at all | The app does not process Stripe events or issue tickets/refunds from webhooks. |
| SEC-11 | Partly | No Stripe key is used by this demo, but it has no secrets-manager or test/live key controls. |
| SEC-12 | Not at all | The app has no connected Stripe accounts or approval process. |
| SEC-13 | Not at all | The app does not create QR codes or ticket tokens. |
| SEC-14 | Not at all | There is no ticket scanning or check-in feature. |
| SEC-15 | Not at all | The app has no scanner, invalid-scan tracking, or officer notifications. |
| SEC-16 | Not at all | The app has no checkout tracking or account-based checkout limits. |
| SEC-17 | Not at all | Reservation records include buyer and order details beyond the allowed fields, and do not have ticket status or Stripe payment ID. |
| SEC-18 | Not at all | Buyer details remain in server memory until restart; there is no 90-day anonymization process. |
| SEC-19 | Not at all | The app has no attendee export, officer access control, or export log. |
| SEC-20 | Partly | Event text is rendered as ordinary React text, but there is no officer event-entry feature to verify this for officer-entered content. |
| SEC-21 | Not at all | The app has no role changes, refunds, cancellations, exports, or audit logging. |
| SEC-22 | Not at all | The app has no audit logs, append-only storage, admin-only access, or one-year retention. |
