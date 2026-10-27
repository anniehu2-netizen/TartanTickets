import type { CampusEvent } from "./events";

export type EventFilters = {
  search: string;
  dateFrom: string;
  dateTo: string;
  club: string;
  category: string;
};

export function clearEventFilters(): EventFilters {
  return {
    search: "",
    dateFrom: "",
    dateTo: "",
    club: "",
    category: "",
  };
}

export function filterEvents(
  events: CampusEvent[],
  filters: Partial<EventFilters> = {},
): CampusEvent[] {
  const search = filters.search?.trim().toLowerCase() ?? "";

  return events.filter((event) => {
    const eventDate = event.startsAt.slice(0, 10);
    const matchesSearch =
      !search ||
      `${event.title} ${event.description}`.toLowerCase().includes(search);
    const matchesDateFrom = !filters.dateFrom || eventDate >= filters.dateFrom;
    const matchesDateTo = !filters.dateTo || eventDate <= filters.dateTo;
    const matchesClub = !filters.club || event.club === filters.club;
    const matchesCategory =
      !filters.category || event.category === filters.category;

    return (
      matchesSearch &&
      matchesDateFrom &&
      matchesDateTo &&
      matchesClub &&
      matchesCategory
    );
  });
}

export function getEventSearchMessage(resultCount: number): string | null {
  return resultCount === 0
    ? "No events match your search. Try changing or clearing your filters."
    : null;
}

export function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}

export function formatEventDate(startsAt: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(startsAt));
}

export function formatEventTime(startsAt: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  }).format(new Date(startsAt));
}
