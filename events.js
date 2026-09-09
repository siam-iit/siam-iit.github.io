/* ==========================================================
   SIAM IIT EVENT CALENDAR

   Event information lives in:
   _data/events.json

   This file handles presentation only.
   Future maintainers should normally NOT need to edit this file.
   ========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

  const calendar =
    document.getElementById("events-calendar");

  if (!calendar) return;


  /* --------------------------------------------------------
     LOAD EVENT DATA
     -------------------------------------------------------- */

  try {

    const response =
      await fetch("./_data/events.json");

    if (!response.ok) {
      throw new Error(
        `Could not load events: ${response.status}`
      );
    }

    const data =
      await response.json();


    if (
      !data.events ||
      data.events.length === 0
    ) {

      calendar.innerHTML = `
        <p class="calendar-empty">
          NO EVENTS CURRENTLY SCHEDULED.
        </p>
      `;

      return;

    }


    /* --------------------------------------------------------
       SORT EVENTS
       -------------------------------------------------------- */

    const events =
      [...data.events].sort(
        (a, b) =>
          new Date(`${a.date}T12:00:00`) -
          new Date(`${b.date}T12:00:00`)
      );


    /* --------------------------------------------------------
       SEPARATE UPCOMING + PAST EVENTS
       -------------------------------------------------------- */

    const today =
      new Date();

    today.setHours(0, 0, 0, 0);

    // Include tea parties through the same date next month (inclusive).
    // Clamp to the month's last day when that date does not exist.
    const teaPartyThrough = new Date(
      today.getFullYear(), today.getMonth() + 1, 1
    );
    const lastDayNextMonth = new Date(
      today.getFullYear(), today.getMonth() + 2, 0
    ).getDate();
    teaPartyThrough.setDate(Math.min(today.getDate(), lastDayNextMonth));
    teaPartyThrough.setHours(23, 59, 59, 999);


    const upcomingEvents =
      events.filter((event) => {

        const eventDate =
          new Date(`${event.date}T12:00:00`);

        return eventDate >= today &&
          (!isTeaPartyEvent(event) || eventDate <= teaPartyThrough);

      });


    /*
      Past events remain in _data/events.json.

      They are intentionally not rendered here so they can
      be used automatically by the archive / timeline page.
    */


    /* --------------------------------------------------------
       NO UPCOMING EVENTS
       -------------------------------------------------------- */

    if (upcomingEvents.length === 0) {

      calendar.innerHTML = `
        <p class="calendar-empty">
          NO UPCOMING EVENTS CURRENTLY SCHEDULED.
        </p>
      `;

      return;

    }


    /* --------------------------------------------------------
       GROUP UPCOMING EVENTS BY MONTH
       -------------------------------------------------------- */

    const groups = {};


    upcomingEvents.forEach((event) => {

      const date =
        new Date(`${event.date}T12:00:00`);


      const key =
        `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;


      if (!groups[key]) {

        groups[key] = {
          date,
          events: []
        };

      }


      groups[key].events.push(event);

    });


    /* --------------------------------------------------------
       BUILD CALENDAR
       -------------------------------------------------------- */

    calendar.innerHTML = "";


    Object.values(groups).forEach((group) => {

      const monthNumber =
        String(
          group.date.getMonth() + 1
        ).padStart(2, "0");


      const monthName =
        group.date
          .toLocaleString(
            "en-US",
            { month: "long" }
          )
          .toUpperCase();


      /* ------------------------------------------------------
         MONTH
         ------------------------------------------------------ */

      const month =
        document.createElement("section");

      month.className =
        "event-month";


      month.innerHTML = `
        <div class="month-marker">

          <span class="month-number">
            ${monthNumber} /
          </span>

          <span class="month-name">
            ${monthName}
          </span>

        </div>
      `;


      /* ------------------------------------------------------
         EVENTS WITHIN MONTH
         ------------------------------------------------------ */

      group.events.forEach((event) => {

        const date =
          new Date(`${event.date}T12:00:00`);


        const dayNumber =
          String(
            date.getDate()
          ).padStart(2, "0");


        const dayName =
          event.day ||
          date
            .toLocaleString(
              "en-US",
              { weekday: "short" }
            )
            .toUpperCase();


        const article =
          document.createElement("article");

        article.className =
          "event-row";


        /* ----------------------------------------------------
           OPTIONAL IMAGE
           ---------------------------------------------------- */

        let eventImage = "";


        // Tea-party flyers remain available to the archive timeline.
        if (event.image && !isTeaPartyEvent(event)) {

          eventImage = `
            <figure class="event-image">

              <img
                src="${escapeHTML(event.image)}"
                alt="${escapeHTML(
                  event.image_alt ||
                  event.title ||
                  "Event image"
                )}"
                loading="lazy"
              >

            </figure>
          `;

        }


        /* ----------------------------------------------------
           OPTIONAL LINK
           ---------------------------------------------------- */

        let eventLink = "";


        if (
          event.link &&
          event.link !== "#"
        ) {

          eventLink = `
            <a
              class="event-link"
              href="${escapeHTML(event.link)}"
            >
              ${escapeHTML(
                event.link_text ||
                "DETAILS ↗"
              )}
            </a>
          `;

        }


        /* ----------------------------------------------------
           EVENT MARKUP
           ---------------------------------------------------- */

        article.innerHTML = `

          <div class="event-date">

            <span class="event-day">
              ${dayNumber}
            </span>

            <span class="event-dow">
              ${escapeHTML(dayName)}
            </span>

          </div>


          <div class="event-main">

            <div class="event-type">
              ${escapeHTML(
                event.type ||
                "EVENT"
              )}
            </div>

            <h2>
              ${escapeHTML(event.title)}
            </h2>

            ${
              event.description
                ? `
                  <p>
                    ${escapeHTML(
                      event.description
                    )}
                  </p>
                `
                : ""
            }

          </div>


          ${eventImage}


          <div class="event-meta">

            ${
              event.time
                ? `
                  <span>
                    ${escapeHTML(
                      event.time
                    )}
                  </span>
                `
                : ""
            }

            ${
              event.location
                ? `
                  <span>
                    ${escapeHTML(
                      event.location
                    )}
                  </span>
                `
                : ""
            }

            ${eventLink}

          </div>

        `;


        month.appendChild(article);

      });


      calendar.appendChild(month);

    });


  } catch (error) {

    console.error(
      "SIAM IIT calendar error:",
      error
    );


    calendar.innerHTML = `
      <p class="calendar-error">
        CALENDAR CURRENTLY UNAVAILABLE.
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

// Shared by the calendar date filter and flyer display.
function isTeaPartyEvent(event) {
  return String(event.title || "")
    .trim()
    .replaceAll("’", "'")
    .toUpperCase() === "DODGSON'S TEA PARTY";
}
