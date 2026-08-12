/* ==========================================================
   SIAM IIT PEOPLE PAGE

   Board information lives in:
   _data/people.json

   This file handles presentation only.
   Future maintainers should normally NOT need to edit this file.
   ========================================================== */

document.addEventListener("DOMContentLoaded", async () => {

  const boardList = document.getElementById("board-list");
  const advisorList = document.getElementById("advisor-list");

  if (!boardList && !advisorList) return;


  /* --------------------------------------------------------
     LOAD PEOPLE DATA
     -------------------------------------------------------- */

  try {

    const response = await fetch("./_data/people.json");

    if (!response.ok) {
      throw new Error(`Could not load people: ${response.status}`);
    }

    const data = await response.json();


    /* --------------------------------------------------------
       RENDER BOARD
       -------------------------------------------------------- */

    if (boardList) {

      boardList.innerHTML = "";

      if (!data.board || data.board.length === 0) {

        boardList.innerHTML = `
          <p class="people-empty">
            BOARD INFORMATION COMING SOON.
          </p>
        `;

      } else {

        data.board.forEach((person, index) => {

          const article = document.createElement("article");
          article.className = "person-row";

          const number =
            String(index + 1).padStart(2, "0");


          /* OPTIONAL LINKS */

          const links = [];

          if (person.email) {
            links.push(`
              <a
                class="person-link"
                href="mailto:${escapeHTML(person.email)}"
              >
                EMAIL ↗
              </a>
            `);
          }

          if (person.linkedin) {
            links.push(`
              <a
                class="person-link"
                href="${escapeHTML(person.linkedin)}"
                target="_blank"
                rel="noopener"
              >
                LINKEDIN ↗
              </a>
            `);
          }


          /* OPTIONAL PHOTO */

          const photo = person.photo
            ? `
              <div class="person-photo-wrap">
                <img
                  class="person-photo"
                  src="${escapeHTML(person.photo)}"
                  alt="Portrait of ${escapeHTML(person.name)}"
                >
              </div>
            `
            : "";


          article.innerHTML = `

            <div class="person-index">
              ${number} /
            </div>


            <div class="person-main">

              <div class="person-role">
                ${escapeHTML(person.role || "")}
              </div>

              <h2>
                ${escapeHTML(person.name || "NAME TBD")}
              </h2>

              ${
                person.major
                  ? `
                    <div class="person-major">
                      ${escapeHTML(person.major)}
                    </div>
                  `
                  : ""
              }

              ${
                person.bio
                  ? `
                    <p class="person-bio">
                      ${escapeHTML(person.bio)}
                    </p>
                  `
                  : ""
              }

              ${
                links.length
                  ? `
                    <div class="person-links">
                      ${links.join("")}
                    </div>
                  `
                  : ""
              }

            </div>

            ${photo}

          `;

          boardList.appendChild(article);

        });

      }

    }


    /* --------------------------------------------------------
       RENDER FACULTY ADVISORS
       -------------------------------------------------------- */

    if (advisorList) {

      advisorList.innerHTML = "";

      if (!data.advisors || data.advisors.length === 0) {

        advisorList.innerHTML = `
          <p class="people-empty">
            FACULTY ADVISOR INFORMATION COMING SOON.
          </p>
        `;

      } else {

        data.advisors.forEach((person, index) => {

          const article = document.createElement("article");
          article.className = "advisor-row";

          const number =
            String(index + 1).padStart(2, "0");


          const links = [];

          if (person.email) {
            links.push(`
              <a
                class="person-link"
                href="mailto:${escapeHTML(person.email)}"
              >
                EMAIL ↗
              </a>
            `);
          }

          if (person.website) {
            links.push(`
              <a
                class="person-link"
                href="${escapeHTML(person.website)}"
                target="_blank"
                rel="noopener"
              >
                WEBSITE ↗
              </a>
            `);
          }


          const photo = person.photo
            ? `
              <div class="person-photo-wrap">
                <img
                  class="person-photo"
                  src="${escapeHTML(person.photo)}"
                  alt="Portrait of ${escapeHTML(person.name)}"
                >
              </div>
            `
            : "";


          article.innerHTML = `

            <div class="person-index">
              ${number} /
            </div>


            <div class="person-main">

              <div class="person-role">
                ${escapeHTML(person.role || "FACULTY ADVISOR")}
              </div>

              <h2>
                ${escapeHTML(person.name || "NAME TBD")}
              </h2>

              ${
                person.title
                  ? `
                    <div class="person-major">
                      ${escapeHTML(person.title)}
                    </div>
                  `
                  : ""
              }

              ${
                person.bio
                  ? `
                    <p class="person-bio">
                      ${escapeHTML(person.bio)}
                    </p>
                  `
                  : ""
              }

              ${
                links.length
                  ? `
                    <div class="person-links">
                      ${links.join("")}
                    </div>
                  `
                  : ""
              }

            </div>

            ${photo}

          `;

          advisorList.appendChild(article);

        });

      }

    }


  } catch (error) {

    console.error(error);

    if (boardList) {
      boardList.innerHTML = `
        <p class="people-error">
          BOARD INFORMATION CURRENTLY UNAVAILABLE.
        </p>
      `;
    }

    if (advisorList) {
      advisorList.innerHTML = "";
    }

  }

});


/* ==========================================================
   BASIC HTML ESCAPING
   ========================================================== */

function escapeHTML(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}