/* ==========================================================
   SIAM IIT TIMELINE

   Combines:
   - _data/events.json
   - _data/history.json

   Renders all past chapter activity chronologically
   as image tiles with text overlays.
   ========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

  const container =
    document.getElementById("timeline-records");

  if (!container) return;


  try {

    /* --------------------------------------------------------
       LOAD DATA
       -------------------------------------------------------- */

    const [eventsResponse, historyResponse] =
      await Promise.all([
        fetch("./_data/events.json"),
        fetch("./_data/history.json")
      ]);


    if (!eventsResponse.ok) {
      throw new Error(
        `Could not load events: ${eventsResponse.status}`
      );
    }


    if (!historyResponse.ok) {
      throw new Error(
        `Could not load history: ${historyResponse.status}`
      );
    }


    const eventsData =
      await eventsResponse.json();

    const historyData =
      await historyResponse.json();


    /* --------------------------------------------------------
       TODAY
       -------------------------------------------------------- */

    const today =
      new Date();

    today.setHours(0, 0, 0, 0);


    /* --------------------------------------------------------
       NORMALIZE PAST EVENTS
       -------------------------------------------------------- */

    const events =
      (eventsData.events || [])

        .filter((event) => {

          if (!event.date) return false;

          const date =
            new Date(`${event.date}T12:00:00`);

          return date < today;

        })

        .map((event) => {

          return {

            sourceType: "event",

            sortDate:
              new Date(`${event.date}T12:00:00`),

            dateDisplay:
              formatEventDate(event.date),

            type:
              event.type || "EVENT",

            title:
              event.title,

            summary:
              event.description || "",

            image:
              event.image || "",

            links:
              event.link &&
              event.link !== "#"
                ? [{
                    title:
                      event.link_text ||
                      "DETAILS",

                    url:
                      event.link
                  }]
                : []

          };

        });


    /* --------------------------------------------------------
       NORMALIZE HISTORY RECORDS
       -------------------------------------------------------- */

    const history =
      (historyData.records || [])
        .map((record) => {

          const links = [];


          /* Multiple sources */

          if (Array.isArray(record.sources)) {

            record.sources.forEach((source) => {

              if (source?.url) {

                links.push({

                  title:
                    source.title ||
                    source.type ||
                    "SOURCE",

                  url:
                    source.url

                });

              }

            });

          }


          /* Single source */

          if (record.source?.url) {

            links.push({

              title:
                record.source.title ||
                record.source.type ||
                "SOURCE",

              url:
                record.source.url

            });

          }


          return {

            sourceType: "history",

            sortDate:
              getHistorySortDate(record),

            dateDisplay:
              record.date_display ||
              record.academic_year ||
              "DATE UNKNOWN",

            type:
              record.type ||
              "HISTORY",

            title:
              record.title,

            summary:
              record.summary || "",

            image:
              record.image || "",

            links

          };

        });


    /* --------------------------------------------------------
       MERGE + SORT

       Newest records appear first.
       -------------------------------------------------------- */

    const records =
      [...events, ...history]
        .sort((a, b) => {

          return (
            b.sortDate -
            a.sortDate
          );

        });


    /* --------------------------------------------------------
       RENDER
       -------------------------------------------------------- */

    container.innerHTML = "";


    records.forEach((record) => {

      const article =
        document.createElement("article");

      article.className =
        "timeline-record";


      /* SOURCE / DETAIL LINKS */

      const linksHTML =
        record.links
          .map((link) => `
            <a
              class="timeline-source-link"
              href="${escapeHTML(link.url)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${escapeHTML(link.title)} ↗
            </a>
          `)
          .join("");


      /* IMAGE */

      const imageHTML =
        record.image
          ? `
            <img
              class="timeline-image"
              src="${escapeHTML(record.image)}"
              alt=""
              loading="lazy"
            >
          `
          : `
            <div
              class="timeline-image timeline-image-placeholder"
              aria-hidden="true"
            ></div>
          `;


      /* TILE CONTENT */

      article.innerHTML = `

        ${imageHTML}

        <div class="timeline-overlay">

          <div class="timeline-meta">

            <span>
              ${escapeHTML(record.dateDisplay)}
            </span>

            <span class="timeline-type">
              ${escapeHTML(record.type)}
            </span>

          </div>


          <h3 class="timeline-title">
            ${escapeHTML(record.title)}
          </h3>


          ${
            record.summary
              ? `
                <p class="timeline-summary">
                  ${escapeHTML(record.summary)}
                </p>
              `
              : ""
          }


          ${
            linksHTML
              ? `
                <div class="timeline-links">
                  ${linksHTML}
                </div>
              `
              : ""
          }

        </div>

      `;


      /* Important: actually add the tile to the page. */

      container.appendChild(article);

    });


  } catch (error) {

    console.error(
      "Timeline failed to load:",
      error
    );

    container.innerHTML = `
      <p class="archive-error">
        CHAPTER TIMELINE CURRENTLY UNAVAILABLE.
      </p>
    `;

  }

});


/* ==========================================================
   DATE HELPERS
   ========================================================== */


/* Convert an exact event date to the display format used
   by archive tiles.

   Example:
   2026-07-10 → JUL 10, 2026
*/

function formatEventDate(dateString) {

  const date =
    new Date(`${dateString}T12:00:00`);

  return date
    .toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric"
      }
    )
    .toUpperCase();

}


/* Historical records sometimes document only an academic year
   rather than an exact date.

   Exact dates are preferred. When none exists, use August 1
   of the first year in the academic-year label as a stable
   approximate sort position.

   Example:
   2023–24 → August 1, 2023

   The approximate date is used ONLY for sorting. The visitor
   still sees the historically accurate date_display value.
*/

function getHistorySortDate(record) {

  if (record.date) {

    return new Date(
      `${record.date}T12:00:00`
    );

  }


  if (record.academic_year) {

    const match =
      String(record.academic_year)
        .match(/^(\d{4})/);


    if (match) {

      return new Date(
        Number(match[1]),
        7,
        1
      );

    }

  }


  /* Records without usable dates sort last. */

  return new Date(0);

}


/* ==========================================================
   BASIC HTML ESCAPING

   Values from JSON are inserted into generated HTML.
   Escape reserved characters before interpolation so data
   cannot accidentally alter the page markup.
   ========================================================== */

function escapeHTML(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }


  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}