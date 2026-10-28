import { randomUUID } from "node:crypto";

export {
  formatEventDate,
  formatEventTime,
  formatPrice,
} from "./event-search.ts";

export type CampusEvent = {
  id: string;
  title: string;
  club: string;
  category: string;
  startsAt: string;
  location: string;
  priceCents: number;
  seatsRemaining: number;
  description: string;
};

type TicketBuyer = {
  name: string;
  andrewId: string;
  email: string;
};

type DemoOrder = TicketBuyer & {
  orderId: string;
  eventId: string;
  seats: number;
  createdAt: string;
};

type TicketStore = {
  reservedSeats: Map<string, number>;
  orders: DemoOrder[];
};

type TicketOrderResult =
  | {
      ok: true;
      orderId: string;
      seats: number;
      seatsRemaining: number;
      totalPriceCents: number;
      amountCents: number;
    }
  | {
      ok: false;
      status: 400 | 404 | 409;
      error: string;
    };

const globalForTicketStore = globalThis as typeof globalThis & {
  tartanTicketStore?: TicketStore;
};

const ticketStore =
  globalForTicketStore.tartanTicketStore ??
  (globalForTicketStore.tartanTicketStore = {
    reservedSeats: new Map<string, number>(),
    orders: [],
  });

export const EVENTS: CampusEvent[] = [
  {
    id: "build18-showcase",
    title: "Build18 Project Showcase",
    club: "Build18",
    category: "Showcase",
    startsAt: "2026-11-14T13:00:00-05:00",
    location: "Tepper Quad",
    priceCents: 0,
    seatsRemaining: 120,
    description: "See what CMU makers have been building all week.",
  },
  {
    id: "robotics-demo-night",
    title: "Robotics Club Demo Night",
    club: "Robotics Club",
    category: "Technology",
    startsAt: "2026-11-12T18:30:00-05:00",
    location: "Hamerschlag Hall, B-Level",
    priceCents: 500,
    seatsRemaining: 9,
    description: "Meet student teams and watch their latest robots in action.",
  },
  {
    id: "tartans-film-night",
    title: "Tartans Fall Film Night",
    club: "Scotty Cinema Society",
    category: "Arts & Culture",
    startsAt: "2026-11-03T19:00:00-05:00",
    location: "Cohon University Center, Rangos Ballroom",
    priceCents: 800,
    seatsRemaining: 42,
    description: "A cozy campus screening with snacks and student short films.",
  },
  {
    id: "pittsburgh-symphony",
    title: "An Evening with the Pittsburgh Symphony",
    club: "CMU Arts Pass",
    category: "Arts & Culture",
    startsAt: "2026-11-21T20:00:00-05:00",
    location: "Heinz Hall, Downtown Pittsburgh",
    priceCents: 1850,
    seatsRemaining: 0,
    description: "Join fellow students for a night of live orchestral music.",
  },
  {
    id: "lunar-new-year",
    title: "Lunar New Year Celebration",
    club: "Asian Students Association",
    category: "Community",
    startsAt: "2027-02-06T17:00:00-05:00",
    location: "Cohon University Center, McConomy Auditorium",
    priceCents: 1200,
    seatsRemaining: 86,
    description: "Celebrate the new year with performances, food, and friends.",
  },
];

export function getUpcomingEvents(
  events: CampusEvent[],
  now: Date = new Date(),
): CampusEvent[] {
  return events
    .filter((event) => new Date(event.startsAt) > now)
    .sort(
      (first, second) =>
        new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime(),
    )
    .map((event) => ({
      ...event,
      seatsRemaining: getAvailableSeats(event),
    }));
}

export function getAvailableSeats(event: CampusEvent): number {
  return Math.max(
    0,
    event.seatsRemaining - (ticketStore.reservedSeats.get(event.id) ?? 0),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function createTicketOrder(
  input: unknown,
  events: CampusEvent[] = EVENTS,
): TicketOrderResult {
  if (!isRecord(input)) {
    return {
      ok: false,
      status: 400,
      error: "Enter your name, Andrew ID, email, and number of tickets.",
    };
  }

  const name = typeof input.name === "string" ? input.name.trim() : "";
  const andrewId =
    typeof input.andrewId === "string" ? input.andrewId.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const eventId = typeof input.eventId === "string" ? input.eventId : "";
  const seats = input.seats;

  if (
    !name ||
    !andrewId ||
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !Number.isInteger(seats)
  ) {
    return {
      ok: false,
      status: 400,
      error: "Enter a valid name, Andrew ID, email, and number of tickets.",
    };
  }

  if (typeof seats !== "number" || seats < 1 || seats > 4) {
    return {
      ok: false,
      status: 400,
      error: "Choose between 1 and 4 tickets.",
    };
  }

  const event = events.find((candidate) => candidate.id === eventId);
  if (!event) {
    return {
      ok: false,
      status: 404,
      error: "This event is no longer available.",
    };
  }

  const seatsRemaining = getAvailableSeats(event);
  if (seatsRemaining === 0 || seats > seatsRemaining) {
    return {
      ok: false,
      status: 409,
      error:
        seatsRemaining === 0
          ? "This event is sold out."
          : `Only ${seatsRemaining} ${seatsRemaining === 1 ? "seat is" : "seats are"} left.`,
    };
  }

  const totalPriceCents = event.priceCents * seats;
  const orderId = randomUUID();
  ticketStore.reservedSeats.set(event.id, event.seatsRemaining - seatsRemaining + seats);
  ticketStore.orders.push({
    orderId,
    eventId: event.id,
    name,
    andrewId,
    email,
    seats,
    createdAt: new Date().toISOString(),
  });

  return {
    ok: true,
    orderId,
    seats,
    seatsRemaining: seatsRemaining - seats,
    totalPriceCents,
    amountCents: totalPriceCents,
  };
}

export function getAvailabilityLabel(event: CampusEvent): string {
  return event.seatsRemaining === 0
    ? "Sold out"
    : `${event.seatsRemaining} seats remaining`;
}

export function getEventActionLabel(event: CampusEvent): string | null {
  return event.seatsRemaining === 0 ? "Join waitlist" : null;
}
