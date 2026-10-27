"use client";

import { useState, type FormEvent } from "react";
import styles from "./page.module.css";

type TicketPurchaseProps = {
  eventId: string;
  eventTitle: string;
  seatsRemaining: number;
};

type OrderResponse = {
  orderId?: string;
  seats?: number;
  seatsRemaining?: number;
  error?: string;
};

function isOrderResponse(value: unknown): value is OrderResponse {
  return typeof value === "object" && value !== null;
}

export default function TicketPurchase({
  eventId,
  eventTitle,
  seatsRemaining: initialSeatsRemaining,
}: TicketPurchaseProps) {
  const [seatsRemaining, setSeatsRemaining] = useState(initialSeatsRemaining);
  const [formOpen, setFormOpen] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const requestBody = {
      eventId,
      name: formData.get("name"),
      andrewId: formData.get("andrewId"),
      email: formData.get("email"),
      seats: Number(formData.get("seats")),
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const result: unknown = await response.json();

      if (!isOrderResponse(result)) {
        setMessage("We could not confirm that reservation. Please try again.");
        return;
      }

      if (!response.ok) {
        setMessage(result.error ?? "We could not complete that reservation.");
        return;
      }

      if (
        typeof result.orderId !== "string" ||
        typeof result.seatsRemaining !== "number" ||
        typeof result.seats !== "number"
      ) {
        setMessage("We could not confirm that reservation. Please try again.");
        return;
      }

      setOrderId(result.orderId);
      setSeatsRemaining(result.seatsRemaining);
      setTicketCount(1);
      setMessage(
        `Your demo reservation is confirmed for ${result.seats} ${
          result.seats === 1 ? "ticket" : "tickets"
        }. No payment was taken.`,
      );
    } catch {
      setMessage("We could not reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (orderId) {
    return (
      <div className={styles.purchaseFeedback} aria-live="polite">
        <p>{message}</p>
        <span>Confirmation: {orderId.slice(0, 8).toUpperCase()}</span>
        <span>
          Your details are held only in temporary server memory. No email was
          sent.
        </span>
        {seatsRemaining > 0 ? (
          <span>
            {seatsRemaining}{" "}
            {seatsRemaining === 1 ? "seat remains" : "seats remain"}
          </span>
        ) : (
          <span>Sold out</span>
        )}
      </div>
    );
  }

  if (seatsRemaining === 0) {
    return (
      <>
        <div className={styles.availability}>
          <span
            className={`${styles.availabilityDot} ${styles.soldOutDot}`}
            aria-hidden="true"
          />
          <span>Sold out</span>
        </div>
        <button
          className={styles.waitlistButton}
          type="button"
          aria-label={`Join waitlist for ${eventTitle}`}
          onClick={() => setMessage("Waitlist sign-up is coming soon.")}
        >
          Join waitlist <span aria-hidden="true">↗</span>
        </button>
        {message ? (
          <p className={styles.formMessage} role="status">
            {message}
          </p>
        ) : null}
      </>
    );
  }

  return (
    <>
      <div className={styles.purchaseActions}>
        <div className={styles.availability}>
          <span className={styles.availabilityDot} aria-hidden="true" />
          <span>{seatsRemaining} seats remaining</span>
        </div>
        <button
          className={styles.buyButton}
          type="button"
          aria-expanded={formOpen}
          aria-controls={`purchase-form-${eventId}`}
          onClick={() => {
            setFormOpen(!formOpen);
            setMessage("");
          }}
        >
          {formOpen ? "Close" : "Buy Tickets"}
          <span aria-hidden="true">{formOpen ? "−" : "↗"}</span>
        </button>
      </div>

      {formOpen ? (
        <form
          className={styles.purchaseForm}
          id={`purchase-form-${eventId}`}
          onSubmit={submitOrder}
        >
          <p className={styles.formHeading}>Your ticket details</p>
          <label>
            Full name
            <input
              autoComplete="name"
              maxLength={100}
              name="name"
              required
            />
          </label>
          <label>
            Andrew ID
            <input
              autoComplete="username"
              maxLength={64}
              name="andrewId"
              required
            />
          </label>
          <label>
            Email address
            <input
              autoComplete="email"
              maxLength={254}
              name="email"
              type="email"
              required
            />
          </label>
          <label>
            Number of tickets
            <select
              name="seats"
              value={ticketCount}
              onChange={(event) => setTicketCount(Number(event.target.value))}
            >
              {Array.from(
                { length: Math.min(4, seatsRemaining) },
                (_, index) => index + 1,
              ).map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </label>
          <p className={styles.demoNotice}>
            Demo only — no payment will be taken. Details stay in temporary
            server memory and clear when the server restarts.
          </p>
          {message ? (
            <p className={styles.formMessage} role="alert">
              {message}
            </p>
          ) : null}
          <button
            className={styles.submitButton}
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Reserving…" : "Confirm tickets"}
          </button>
        </form>
      ) : null}
    </>
  );
}
