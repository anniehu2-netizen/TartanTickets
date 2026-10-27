import assert from "node:assert/strict";
import test from "node:test";
import {
  EVENTS,
  createTicketOrder,
  formatPrice,
  getAvailableSeats,
  getAvailabilityLabel,
  getEventActionLabel,
  getUpcomingEvents,
} from "../app/events.ts";

test("shows upcoming events in soonest-first order", () => {
  const now = new Date("2026-10-26T12:00:00-04:00");
  const events = getUpcomingEvents(EVENTS, now);

  assert.ok(events.length > 0);
  assert.ok(events.every((event) => new Date(event.startsAt) > now));
  assert.deepEqual(
    events.map((event) => event.title),
    [...events]
      .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
      .map((event) => event.title),
  );
});

test("does not include events that have already happened", () => {
  const pastEvent = {
    ...EVENTS[0],
    id: "past-event",
    startsAt: "2026-10-25T18:00:00-04:00",
  };
  const now = new Date("2026-10-26T12:00:00-04:00");

  assert.ok(!getUpcomingEvents([pastEvent, EVENTS[0]], now).includes(pastEvent));
});

test("each listed event has the fields students need to choose an event", () => {
  for (const event of getUpcomingEvents(EVENTS, new Date("2026-10-26T12:00:00-04:00"))) {
    assert.ok(event.title);
    assert.ok(event.startsAt);
    assert.ok(event.location);
    assert.ok(Number.isInteger(event.priceCents));
    assert.ok(Number.isInteger(event.seatsRemaining));
  }
});

test("formats prices as dollars and cents", () => {
  assert.equal(formatPrice(1200), "$12.00");
});

test("shows a waitlist action and sold-out label when no seats remain", () => {
  const soldOutEvent = { ...EVENTS[0], seatsRemaining: 0 };

  assert.equal(getAvailabilityLabel(soldOutEvent), "Sold out");
  assert.equal(getEventActionLabel(soldOutEvent), "Join waitlist");
});

test("shows the number of seats remaining while an event has seats", () => {
  const availableEvent = { ...EVENTS[0], seatsRemaining: 18 };

  assert.equal(getAvailabilityLabel(availableEvent), "18 seats remaining");
  assert.equal(getEventActionLabel(availableEvent), null);
});

test("a valid ticket request makes a simulated reservation and lowers availability", () => {
  const event = { ...EVENTS[0], id: "demo-order-valid", seatsRemaining: 5 };
  const result = createTicketOrder(
    {
      eventId: event.id,
      name: "Riley Student",
      andrewId: "rstudent",
      email: "rstudent@andrew.cmu.edu",
      seats: 2,
    },
    [event],
  );

  assert.equal(result.ok, true);
  assert.equal(typeof result.orderId, "string");
  assert.equal(result.seats, 2);
  assert.equal(result.seatsRemaining, 3);
  assert.equal(getAvailableSeats(event), 3);
});

test("ticket requests require a name, Andrew ID, email, and valid email address", () => {
  const event = { ...EVENTS[0], id: "demo-order-fields", seatsRemaining: 5 };
  const valid = {
    eventId: event.id,
    name: "Riley Student",
    andrewId: "rstudent",
    email: "rstudent@andrew.cmu.edu",
    seats: 1,
  };

  for (const invalid of [
    { ...valid, name: " " },
    { ...valid, andrewId: "" },
    { ...valid, email: "" },
    { ...valid, email: "not-an-email" },
  ]) {
    assert.equal(createTicketOrder(invalid, [event]).ok, false);
  }
});

test("ticket requests are limited to one through four seats and available inventory", () => {
  const event = { ...EVENTS[0], id: "demo-order-limits", seatsRemaining: 3 };
  const request = {
    eventId: event.id,
    name: "Riley Student",
    andrewId: "rstudent",
    email: "rstudent@andrew.cmu.edu",
    seats: 1,
  };

  for (const seats of [0, 5, 4]) {
    assert.equal(createTicketOrder({ ...request, seats }, [event]).ok, false);
  }

  assert.equal(getAvailableSeats(event), 3);
});

test("sold-out events cannot be purchased", () => {
  const event = { ...EVENTS[0], id: "demo-order-sold-out", seatsRemaining: 0 };
  const result = createTicketOrder(
    {
      eventId: event.id,
      name: "Riley Student",
      andrewId: "rstudent",
      email: "rstudent@andrew.cmu.edu",
      seats: 1,
    },
    [event],
  );

  assert.equal(result.ok, false);
  assert.equal(getAvailableSeats(event), 0);
});

test("simultaneous reservations cannot sell more seats than remain", async () => {
  const event = { ...EVENTS[0], id: "demo-order-concurrency", seatsRemaining: 1 };
  const request = {
    eventId: event.id,
    name: "Riley Student",
    andrewId: "rstudent",
    email: "rstudent@andrew.cmu.edu",
    seats: 1,
  };

  const results = await Promise.all([
    Promise.resolve().then(() => createTicketOrder(request, [event])),
    Promise.resolve().then(() => createTicketOrder(request, [event])),
  ]);

  assert.equal(results.filter((result) => result.ok).length, 1);
  assert.equal(getAvailableSeats(event), 0);
});
