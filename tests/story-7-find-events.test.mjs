import assert from "node:assert/strict";
import test from "node:test";
import { EVENTS, getUpcomingEvents } from "../app/events.ts";

const events = getUpcomingEvents(
  EVENTS,
  new Date("2026-10-26T12:00:00-04:00"),
);

async function loadSearchHelpers() {
  const search = await import("../app/event-search.ts");
  assert.equal(typeof search.filterEvents, "function");
  return search;
}

test("test_story_7_search_events_by_keyword", async () => {
  const { filterEvents } = await loadSearchHelpers();

  assert.deepEqual(
    filterEvents(events, { search: "robotics" }).map((event) => event.id),
    ["robotics-demo-night"],
  );
  assert.deepEqual(
    filterEvents(events, { search: "student short films" }).map((event) => event.id),
    ["tartans-film-night"],
  );
});

test("test_story_7_filter_events_by_date_range", async () => {
  const { filterEvents } = await loadSearchHelpers();

  assert.deepEqual(
    filterEvents(events, {
      dateFrom: "2026-11-03",
      dateTo: "2026-11-12",
    }).map((event) => event.id),
    ["tartans-film-night", "robotics-demo-night"],
  );
});

test("test_story_7_filter_events_by_club_and_category", async () => {
  const { filterEvents } = await loadSearchHelpers();

  assert.deepEqual(
    filterEvents(events, { club: "Robotics Club" }).map((event) => event.id),
    ["robotics-demo-night"],
  );
  assert.deepEqual(
    filterEvents(events, { category: "Arts & Culture" }).map((event) => event.id),
    ["tartans-film-night", "pittsburgh-symphony"],
  );
});

test("test_story_7_combine_search_and_filters", async () => {
  const { filterEvents } = await loadSearchHelpers();

  assert.deepEqual(
    filterEvents(events, {
      search: "screening",
      dateFrom: "2026-11-01",
      dateTo: "2026-11-15",
      club: "Scotty Cinema Society",
      category: "Arts & Culture",
    }).map((event) => event.id),
    ["tartans-film-night"],
  );
});

test("test_story_7_shows_empty_results_message", async () => {
  const { filterEvents, getEventSearchMessage } = await loadSearchHelpers();
  const results = filterEvents(events, { search: "no matching event" });

  assert.deepEqual(results, []);
  assert.equal(
    getEventSearchMessage(results.length),
    "No events match your search. Try changing or clearing your filters.",
  );
});

test("test_story_7_clear_search_and_filters", async () => {
  const { clearEventFilters, filterEvents } = await loadSearchHelpers();

  const clearedFilters = clearEventFilters();
  assert.deepEqual(clearedFilters, {
    search: "",
    dateFrom: "",
    dateTo: "",
    club: "",
    category: "",
  });
  assert.deepEqual(
    filterEvents(events, clearedFilters).map((event) => event.id),
    events.map((event) => event.id),
  );
});
