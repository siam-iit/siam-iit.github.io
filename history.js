/* ==========================================================
   SIAM IIT CHAPTER HISTORY

   Historical records live in:
   _data/history.json

   This file:
   - loads reconstructed chapter history
   - displays one archival record per entry
   - preserves source links
   - keeps detailed data in history.json rather than HTML

   Future maintainers should normally NOT need to edit this file.
   ========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

  const historyContainer =
    document.getElementById("history-records");

  if (!historyContainer) return;


  /* --------------------------------------------------------
     LOAD HISTORY DATA
     -------------------------------------------------------- */

  try {

    const response =
      await fetch("./_data/history.json");

    if (!response.ok) {
      throw new Error(
        `Could not load chapter history: ${response.status}`
      );
    }

    const data = await response.json();

    if (
      !data.records ||
      data.records.length === 0
    ) {

      historyContainer.innerHTML = `
        <p class="archive-empty">
          NO HISTORICAL RECORDS YET.
        </p>
      `;

      return;
    }


    /* --------------------------------------------------------
       BUILD HISTORY
       -------------------------------------------------------- */

    historyContainer.innerHTML = "";


    data.records.forEach((record, index) => {

      const article =
        document.createElement("article");

      article.className = "history-record";


      /* ------------------------------------------------------
         SOURCE LINKS
         ------------------------------------------------------ */

      let sourcesHTML = "";

      const sources =
        record.sources ||
        (record.source ? [record.source] : []);


      if (sources.length > 0) {

        const links = sources
          .filter((source) => source.url)
          .map((source) => {

            return `
              <a
                class="history-source-link"
                href="${escapeHTML(source.url)}"
                target="_blank"
                rel="noopener"
              >
                ${escapeHTML(
                  source.title ||
                  source.type ||
                  "SOURCE"
                )} ↗
              </a>
            `;

          })
          .join("");


        if (links) {

          sourcesHTML = `
            <div class="history-sources">
              <span class="history-meta-label">
                SOURCE${sources.length > 1 ? "S" : ""}
              </span>

              <div class="history-source-links">
                ${links}
              </div>
            </div>
          `;

        }

      }


      /* ------------------------------------------------------
         OPTIONAL SUBRECORDS / DAYS
         ------------------------------------------------------ */

      let daysHTML = "";

      if (
        Array.isArray(record.days) &&
        record.days.length > 0
      ) {

        daysHTML = `
          <div class="history-days">

            ${record.days.map((day) => `
              <div class="history-day">

                <span class="history-day-label">
                  ${escapeHTML(day.label || "")}
                </span>

                <span class="history-day-title">
                  ${escapeHTML(day.title || "")}
                </span>

              </div>
            `).join("")}

          </div>
        `;

      }


      /* ------------------------------------------------------
         OPTIONAL MENTORS
         ------------------------------------------------------ */

      let mentorsHTML = "";

      if (
        Array.isArray(record.documented_mentors) &&
        record.documented_mentors.length > 0
      ) {

        mentorsHTML = `
          <div class="history-people">

            <span class="history-meta-label">
              DOCUMENTED MENTORS
            </span>

            ${record.documented_mentors.map((mentor) => `
              <div class="history-person">

                <span class="history-person-name">
                  ${escapeHTML(mentor.name)}
                </span>

                ${
                  mentor.area
                    ? `
                      <span class="history-person-detail">
                        ${escapeHTML(mentor.area)}
                      </span>
                    `
                    : ""
                }

              </div>
            `).join("")}

          </div>
        `;

      }


      /* ------------------------------------------------------
         RECORD
         ------------------------------------------------------ */

      article.innerHTML = `

        <div class="history-record-index">
          ${String(index + 1).padStart(2, "0")}
        </div>


        <div class="history-record-main">

          <div class="history-record-meta">

            <span>
              ${escapeHTML(
                record.date_display ||
                record.academic_year ||
                "DATE UNKNOWN"
              )}
            </span>

            <span>
              ${escapeHTML(
                record.type || "RECORD"
              )}
            </span>

          </div>


          <h3>
            ${escapeHTML(record.title)}
          </h3>


          ${
            record.summary
              ? `
                <p class="history-summary">
                  ${escapeHTML(record.summary)}
                </p>
              `
              : ""
          }


          ${daysHTML}

          ${mentorsHTML}

          ${sourcesHTML}

        </div>

      `;


      historyContainer.appendChild(article);

    });


  } catch (error) {

    console.error(
      "Chapter history failed to load:",
      error
    );

    historyContainer.innerHTML = `
      <p class="archive-error">
        CHAPTER HISTORY CURRENTLY UNAVAILABLE.
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