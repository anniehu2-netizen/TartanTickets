import { Suspense } from "react";
import { connection } from "next/server";
import EventBrowser from "./EventBrowser";
import { EVENTS, getUpcomingEvents } from "./events";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="Tartan Tickets home">
          <span className={styles.brandMark} aria-hidden="true">
            T
          </span>
          <span>
            <strong>Tartan Tickets</strong>
            <small>Carnegie Mellon University</small>
          </span>
        </a>
        <a className={styles.headerLink} href="#events">
          Browse events <span aria-hidden="true">↓</span>
        </a>
      </header>

      <main id="top">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              THE CAMPUS, OFF THE CLOCK
            </p>
            <h1 id="hero-title">
              Make room for
              <br />
              <span>something great.</span>
            </h1>
            <p className={styles.heroDescription}>
              Find your people, try something new, and make your time at CMU
              count. Your next favorite memory starts here.
            </p>
            <a className={styles.heroLink} href="#events">
              Find your next event <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className={styles.heroAside} aria-hidden="true">
            <div className={styles.heroSeal}>
              <span>CMU</span>
              <strong>
                MAKE
                <br />
                IT
                <br />
                COUNT
              </strong>
              <span className={styles.sealStar}>✳</span>
            </div>
            <span className={styles.heroNote}>Your campus. Your calendar.</span>
          </div>
          <span className={styles.heroNumber} aria-hidden="true">
            01
          </span>
        </section>

        <section
          className={styles.eventsSection}
          id="events"
          aria-labelledby="events-title"
        >
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.sectionEyebrow}>WHAT’S HAPPENING</p>
              <h2 id="events-title">Coming up on campus</h2>
            </div>
            <p className={styles.sectionNote}>
              Good things happen when you show up.
            </p>
          </div>

          <Suspense
            fallback={<p className={styles.loadingState}>Loading events…</p>}
          >
            <UpcomingEventCards />
          </Suspense>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Tartan Tickets</span>
        <span>
          Made for the CMU community <span aria-hidden="true">✳</span>
        </span>
      </footer>
    </div>
  );
}

async function UpcomingEventCards() {
  await connection();
  const events = getUpcomingEvents(EVENTS);

  if (events.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span aria-hidden="true">✳</span>
        <p>No upcoming events yet.</p>
        <p>Check back soon for what’s happening around campus.</p>
      </div>
    );
  }

  return <EventBrowser events={events} />;
}
