import assert from "node:assert/strict";
import test from "node:test";
import { EVENTS } from "../app/events.ts";
import { POST } from "../app/api/orders/route.ts";

test("ticket order API returns a simulated confirmation without payment", async () => {
  const response = await POST(
    new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: EVENTS[0].id,
        name: "Riley Student",
        andrewId: "rstudent",
        email: "rstudent@andrew.cmu.edu",
        seats: 2,
      }),
    }),
  );
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.seats, 2);
  assert.equal(body.seatsRemaining, EVENTS[0].seatsRemaining - 2);
  assert.equal(body.simulated, true);
  assert.equal(typeof body.orderId, "string");
});

test("ticket order API rejects malformed and invalid requests", async () => {
  const malformedResponse = await POST(
    new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    }),
  );
  const invalidResponse = await POST(
    new Request("http://localhost/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: EVENTS[0].id, seats: 8 }),
    }),
  );

  assert.equal(malformedResponse.status, 400);
  assert.equal(invalidResponse.status, 400);
});
