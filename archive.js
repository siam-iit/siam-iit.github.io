/* ==========================================================
   SIAM IIT ARCHIVE

   Past event information lives in:
   _data/events.json

   This file automatically:
   - loads all events
   - keeps only past events
   - sorts newest to oldest
   - groups by year and month
   - renders them into archive.html

   Future maintainers should normally NOT need to edit this file.
   ========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

  const archive = document.getElementById("archive-events");

  if (!archive) return;


  /* --------------------------------------------------------
     LOAD EVENT DATA
     -------------------------------------------------------- */

  try {

    const response = await fetch("./_data/events.json");

    if (!response.ok) {
      throw new Error(`Could not load events: ${response.status}`);
    }

    const data = await response.json();

    if (!data.events || data.events.length === 0) {
      archive.innerHTML = `
        <p class="archive-empty">
          NO PAST EVENTS YET.
        </p>
      `;
      return;
    }


    /* --------------------------------------------------------
       FIND PAST EVENTS
       -------------------------------------------------------- */

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pastEvents = [...data.events]
      .filter((event) => {

        const eventDate =
          new Date(`${event.date}T12:00:00`);

        return eventDate < today;

      })
      .sort((a, b) => {

        return (
          new Date(`${b.date}T12:00:00`) -
          new Date(`${a.date}T12:00:00`)
        );

      });


    if (pastEvents.length === 0) {
      archive.innerHTML = `
        <p class="archive-empty">
          NO PAST EVENTS YET.
        </p>
      `;
      return;
    }


    /* --------------------------------------------------------
       GROUP BY YEAR + MONTH
       -------------------------------------------------------- */

    const years = {};

    pastEvents.forEach((event) => {

      const date =
        new Date(`${event.date}T12:00:00`);

      const year =
        String(date.getFullYear());

      const monthNumber =
        String(date.getMonth() + 1).padStart(2, "0");

      const monthName =
        date
          .toLocaleString(
            "en-US",
            { month: "long" }
          )
          .toUpperCase();

      if (!years[year]) {
        years[year] = {};
      }

      if (!years[year][monthNumber]) {
        years[year][monthNumber] = {
          monthName,
          events: []
        };
      }

      years[year][monthNumber].events.push(event);

    });


    /* --------------------------------------------------------
       BUILD ARCHIVE
       -------------------------------------------------------- */

    archive.innerHTML = "";

    Object.entries(years).forEach(
      ([year, months]) => {

        /* YEAR */

        const yearSection =
          document.createElement("section");

        yearSection.className =
          "archive-year";

        yearSection.innerHTML = `
          <div class="archive-year-marker">
            ${escapeHTML(year)}
          </div>
        `;


        /* MONTHS */

        Object.entries(months).forEach(
          ([monthNumber, monthData]) => {

            const month =
              document.createElement("section");

            month.className =
              "archive-month";

            month.innerHTML = `
              <div class="archive-month-marker">

                <span class="archive-month-number">
                  ${escapeHTML(monthNumber)} /
                </span>

                <span class="archive-month-name">
                  ${escapeHTML(monthData.monthName)}
                </span>

              </div>
            `;


            /* EVENTS */

            monthData.events.forEach((event) => {

              const date =
                new Date(`${event.date}T12:00:00`);

              const dayNumber =
                String(date.getDate()).padStart(2, "0");

              const article =
                document.createElement("article");

              article.className =
                "archive-event-row";


              /* OPTIONAL LINK */

              let eventLink = "";

              if (
                event.link &&
                event.link !== "#"
              ) {

                eventLink = `
                  <a
                    class="archive-event-link"
                    href="${escapeHTML(event.link)}"
                  >
                    ${escapeHTML(
                      event.link_text || "DETAILS ↗"
                    )}
                  </a>
                `;
              }


              article.innerHTML = `

                <div class="archive-event-main">

                  <div class="archive-event-heading">

                    <span class="archive-event-day">
                      ${dayNumber}
                    </span>

                    <span class="archive-event-dash">
                      —
                    </span>

                    <h3>
                      ${escapeHTML(event.title)}
                    </h3>

                  </div>

                  ${
                    event.description
                      ? `
                        <p>
                          ${escapeHTML(event.description)}
                        </p>
                      `
                      : ""
                  }

                  <div class="archive-event-meta">

                    ${
                      event.time
                        ? `
                          <span>
                            ${escapeHTML(event.time)}
                          </span>
                        `
                        : ""
                    }

                    ${
                      event.location
                        ? `
                          <span>
                            ${escapeHTML(event.location)}
                          </span>
                        `
                        : ""
                    }

                    ${eventLink}

                  </div>

                </div>
              `;

              month.appendChild(article);

            });

            yearSection.appendChild(month);

          }
        );

        archive.appendChild(yearSection);

      }
    );


  } catch (error) {

    console.error(error);

    archive.innerHTML = `
      <p class="archive-error">
        EVENT ARCHIVE CURRENTLY UNAVAILABLE.
      </p>
    `;
  }

});


/* ==========================================================
   BASIC HTML ESCAPING
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