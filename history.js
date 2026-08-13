/* ==========================================================
   SIAM IIT CHAPTER HISTORY

   Historical records live in:
   _data/history.json

   This file:
   - loads reconstructed chapter history
   - renders a compact archival index
   - preserves source links
   - keeps detailed historical data in history.json

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

    const data =
      await response.json();

    if (
      !Array.isArray(data.records) ||
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
       BUILD HISTORY GRID
       -------------------------------------------------------- */

    historyContainer.innerHTML = "";


    data.records.forEach((record, index) => {

      const article =
        document.createElement("article");

      article.className =
        "history-record";


      /* ------------------------------------------------------
         SOURCE LINKS
         ------------------------------------------------------ */

      const sources =
        Array.isArray(record.sources)
          ? record.sources
          : record.source
            ? [record.source]
            : [];


      const sourcesHTML =
        sources
          .filter((source) => source?.url)
          .map((source) => `
            <a
              class="history-source-link"
              href="${escapeHTML(source.url)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${escapeHTML(
                source.title ||
                source.type ||
                "SOURCE"
              )} ↗
            </a>
          `)
          .join("");


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

            <span class="history-record-type">
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

          ${
            sourcesHTML
              ? `
                <div class="history-sources">
                  ${sourcesHTML}
                </div>
              `
              : ""
          }

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