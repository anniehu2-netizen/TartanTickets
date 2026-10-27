"use client";

import { useState } from "react";
import TicketPurchase from "./TicketPurchase";
import {
  clearEventFilters,
  filterEvents,
  formatEventDate,
  formatEventTime,
  formatPrice,
  getEventSearchMessage,
  type EventFilters,
} from "./event-search";
import type { CampusEvent } from "./events";
import styles from "./page.module.css";

export default function EventBrowser({ events }: { events: CampusEvent[] }) {
  const [filters, setFilters] = useState<EventFilters>(clearEventFilters);
  const filteredEvents = filterEvents(events, filters);
  const emptyMessage = getEventSearchMessage(filteredEvents.length);
  const clubs = [...new Set(events.map((event) => event.club))].sort();
  const categories = [...new Set(events.map((event) => event.category))].sort();
  const hasFilters = Object.values(filters).some(Boolean);

  function updateFilter<Key extends keyof EventFilters>(
    key: Key,
    value: EventFilters[Key],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div>
      <div
        className={styles.eventFilters}
        role="group"
        aria-label="Find events"
      >
        <label className={styles.filterField}>
          <span>Search events</span>
          <input
            type="search"
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Event name or description"
          />
        </label>
        <label className={styles.filterField}>
          <span>From</span>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => updateFilter("dateFrom", event.target.value)}
          />
        </label>
        <label className={styles.filterField}>
          <span>To</span>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(event) => updateFilter("dateTo", event.target.value)}
          />
        </label>
        <label className={styles.filterField}>
          <span>Club</span>
          <select
            value={filters.club}
            onChange={(event) => updateFilter("club", event.target.value)}
          >
            <option value="">All clubs</option>
            {clubs.map((club) => (
              <option key={club} value={club}>
                {club}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.filterField}>
          <span>Category</span>
          <select
            value={filters.category}
            onChange={(event) => updateFilter("category", event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <button
          className={styles.clearFiltersButton}
          type="button"
          disabled={!hasFilters}
          onClick={() => setFilters(clearEventFilters())}
        >
          Clear filters
        </button>
      </div>

      <p className={styles.eventResultCount} aria-live="polite">
        {filteredEvents.length}{" "}
        {filteredEvents.length === 1 ? "event" : "events"}
      </p>

      {emptyMessage ? (
        <div className={styles.emptyState} role="status">
          <span aria-hidden="true">✳</span>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <ul className={styles.eventGrid}>
          {filteredEvents.map((event, index) => (
            <li className={styles.eventItem} key={event.id}>
              <article className={styles.eventCard}>
                <div className={styles.cardTopline}>
                  <span className={styles.category}>{event.category}</span>
                  <span className={styles.cardIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3>{event.title}</h3>
                <p className={styles.clubName}>{event.club}</p>
                <p className={styles.eventDescription}>{event.description}</p>

                <dl className={styles.eventDetails}>
                  <div>
                    <dt>Date &amp; time</dt>
                    <dd>
                      <time dateTime={event.startsAt}>
                        {formatEventDate(event.startsAt)}
                      </time>
                      <span>{formatEventTime(event.startsAt)}</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Location</dt>
                    <dd>{event.location}</dd>
                  </div>
                </dl>

                <div className={styles.cardFooter}>
                  <TicketPurchase
                    eventId={event.id}
                    eventTitle={event.title}
                    seatsRemaining={event.seatsRemaining}
                  />
                  <div className={styles.price}>
                    <span>Ticket</span>
                    <strong>{formatPrice(event.priceCents)}</strong>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
