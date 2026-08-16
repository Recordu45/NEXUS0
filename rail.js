/* =========================================================
   NEXUS RAIL MODE
   COMPLETE RAIL ENGINE
   PNR • TRAIN SEARCH • LIVE STATUS • ROUTE
   SEAT • BETWEEN STATIONS • ARRIVAL/DEPARTURE • DELAYS
========================================================= */

(() => {
  "use strict";

  /* =======================================================
     CONFIG
  ======================================================= */

  const STORAGE = {
    history: "nexus_rail_history",
    favorites: "nexus_rail_favorites"
  };

  const TOOLS = {
    "PNR Status": {
      id: "pnr",
      title: "PNR Status",
      subtitle: "Check your railway booking status",
      icon: "◎"
    },

    "Train Search": {
      id: "search",
      title: "Train Search",
      subtitle: "Find trains for your journey",
      icon: "▰"
    },

    "Live Train Status": {
      id: "live",
      title: "Live Train Status",
      subtitle: "Track a train by number",
      icon: "◉"
    },

    "Train Route": {
      id: "route",
      title: "Train Route",
      subtitle: "Explore a train's complete route",
      icon: "⌁"
    },

    "Seat Availability": {
      id: "seat",
      title: "Seat Availability",
      subtitle: "Check seats for your journey",
      icon: "▥"
    },

    "Between Stations": {
      id: "between",
      title: "Between Stations",
      subtitle: "Find trains between stations",
      icon: "⇄"
    },

    "Arrival / Departure": {
      id: "arrival",
      title: "Arrival / Departure",
      subtitle: "Check station train timings",
      icon: "◴"
    },

    "Delay Alerts": {
      id: "delay",
      title: "Delay Alerts",
      subtitle: "Monitor train delays",
      icon: "⚠"
    }
  };


  /* =======================================================
     HELPERS
  ======================================================= */

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];


  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }


  function wait(ms) {
    return new Promise(resolve =>
      setTimeout(resolve, ms)
    );
  }


  function toast(message) {

    if (
      typeof window.toast === "function"
    ) {
      window.toast(message);
      return;
    }

    let element =
      document.getElementById(
        "nexusRailToast"
      );

    if (!element) {

      element =
        document.createElement("div");

      element.id =
        "nexusRailToast";

      element.className =
        "nexus-rail-toast";

      document.body.appendChild(element);

    }

    element.textContent =
      message;

    element.classList.add("show");

    clearTimeout(
      window.nexusRailToastTimer
    );

    window.nexusRailToastTimer =
      setTimeout(() => {

        element.classList.remove("show");

      }, 2400);

  }


  /* =======================================================
     LOCAL STORAGE
  ======================================================= */

  function getHistory() {

    try {

      return JSON.parse(
        localStorage.getItem(
          STORAGE.history
        ) || "[]"
      );

    } catch {

      return [];

    }

  }


  function saveHistory(type, data) {

    try {

      const history =
        getHistory();

      history.unshift({

        type,
        data,

        timestamp:
          new Date().toISOString()

      });

      localStorage.setItem(
        STORAGE.history,
        JSON.stringify(
          history.slice(0, 20)
        )
      );

    } catch {}

  }


  function getFavorites() {

    try {

      return JSON.parse(
        localStorage.getItem(
          STORAGE.favorites
        ) || "[]"
      );

    } catch {

      return [];

    }

  }


  function saveFavorite(item) {

    try {

      const favorites =
        getFavorites();

      const exists =
        favorites.some(
          x =>
            x.type === item.type &&
            x.value === item.value
        );

      if (!exists) {

        favorites.unshift(item);

        localStorage.setItem(
          STORAGE.favorites,
          JSON.stringify(
            favorites.slice(0, 20)
          )
        );

        toast(
          "Added to Rail favorites"
        );

      } else {

        toast(
          "Already in favorites"
        );

      }

    } catch {}

  }


  /* =======================================================
     VALIDATION
  ======================================================= */

  function validPNR(value) {

    return /^\d{10}$/.test(
      value.trim()
    );

  }


  function validTrain(value) {

    return /^\d{4,6}$/.test(
      value.trim()
    );

  }


  function validStation(value) {

    return value.trim().length >= 2;

  }


  function validDate(value) {

    if (!value) return false;

    const selected =
      new Date(value);

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    return selected >= today;

  }


  /* =======================================================
     CLOSE CURRENT TOOL
  ======================================================= */

  function closeTool() {

    const screen =
      $("#nexusRailToolScreen");

    if (screen) {

      screen.remove();

    }

  }


  /* =======================================================
     RESULT
  ======================================================= */

  function showResult(
    title,
    message,
    type = "info"
  ) {

    const result =
      $("#nexusRailResult");

    if (!result) return;

    result.className =
      `nexus-rail-result ${type}`;

    let icon = "✓";

    if (type === "error") {
      icon = "!";
    }

    if (type === "loading") {
      icon = "◌";
    }

    result.innerHTML = `

      <div class="nexus-result-icon">
        ${icon}
      </div>

      <div class="nexus-result-content">

        <strong>
          ${escapeHTML(title)}
        </strong>

        <p>
          ${escapeHTML(message)}
        </p>

      </div>

    `;

  }


  function setButtonLoading(
    button,
    loading,
    loadingText
  ) {

    if (!button) return;

    if (loading) {

      button.dataset.oldText =
        button.textContent;

      button.disabled =
        true;

      button.textContent =
        loadingText ||
        "Processing...";

      button.classList.add(
        "rail-loading"
      );

    } else {

      button.disabled =
        false;

      button.textContent =
        button.dataset.oldText ||
        "Continue";

      button.classList.remove(
        "rail-loading"
      );

    }

  }


  /* =======================================================
     COMMON SCREEN
  ======================================================= */

  function createToolScreen(
    toolName
  ) {

    const config =
      TOOLS[toolName];

    if (!config) return null;

    closeTool();

    const panel =
      $("#railPanel");

    if (!panel) {

      toast(
        "Rail Panel not found"
      );

      return null;

    }


    const screen =
      document.createElement(
        "section"
      );

    screen.id =
      "nexusRailToolScreen";

    screen.className =
      "nexus-rail-tool-screen";


    screen.innerHTML = `

      <div class="nexus-rail-screen-header">

        <button
          type="button"
          class="nexus-rail-back"
          id="nexusRailBack"
        >
          ‹
        </button>


        <div class="nexus-rail-screen-title">

          <span class="panel-label cyan">
            RAIL MODE
          </span>

          <h3>
            ${escapeHTML(
              config.title
            )}
          </h3>

          <p>
            ${escapeHTML(
              config.subtitle
            )}
          </p>

        </div>

      </div>


      <div
        id="nexusRailToolBody"
        class="nexus-rail-tool-body"
      ></div>

    `;


    const hero =
      $(".train-hero", panel);

    const toolGrid =
      $(".tool-grid", panel);


    if (hero) {

      hero.after(screen);

    } else if (toolGrid) {

      toolGrid.after(screen);

    } else {

      panel.appendChild(
        screen
      );

    }


    const back =
      $("#nexusRailBack");

    if (back) {

      back.addEventListener(
        "click",
        closeTool
      );

    }


    return screen;

  }


  /* =======================================================
     FORM BUILDERS
  ======================================================= */

  function field(
    label,
    id,
    placeholder,
    type = "text"
  ) {

    return `

      <label class="nexus-field-label">
        ${label}
      </label>

      <input
        id="${id}"
        class="nexus-rail-input"
        type="${type}"
        placeholder="${placeholder}"
        autocomplete="off"
      >

    `;

  }


  function primaryButton(
    id,
    text
  ) {

    return `

      <button
        type="button"
        id="${id}"
        class="nexus-rail-primary"
      >
        ${text}
      </button>

    `;

  }


  function formCard(content) {

    return `

      <div class="nexus-rail-form-card">

        ${content}

      </div>

    `;

  }


  function resultBox() {

    return `

      <div
        id="nexusRailResult"
        class="nexus-rail-result"
      >

        <div class="nexus-result-icon">
          ◇
        </div>

        <div class="nexus-result-content">

          <strong>
            Ready
          </strong>

          <p>
            Enter the required information
            to continue.
          </p>

        </div>

      </div>

    `;

  }


  /* =======================================================
     PNR
  ======================================================= */

  function renderPNR() {

    const screen =
      createToolScreen(
        "PNR Status"
      );

    if (!screen) return;


    const body =
      $("#nexusRailToolBody");


    body.innerHTML = `

      ${formCard(`

        ${field(
          "PNR NUMBER",
          "nexusPNR",
          "Enter 10 digit PNR"
        )}

        ${primaryButton(
          "nexusPNRButton",
          "Check PNR"
        )}

      `)}

      ${resultBox()}


      <div class="nexus-rail-info-card">

        <span>
          PNR
        </span>

        <p>
          Your PNR is validated inside NEXUS.
          Live railway data can be connected
          through the API layer.
        </p>

      </div>

    `;


    const input =
      $("#nexusPNR");

    const button =
      $("#nexusPNRButton");


    input.addEventListener(
      "input",
      () => {

        input.value =
          input.value
            .replace(
              /\D/g,
              ""
            )
            .slice(
              0,
              10
            );

      }
    );


    button.addEventListener(
      "click",
      async () => {

        const pnr =
          input.value.trim();


        if (
          !validPNR(pnr)
        ) {

          showResult(
            "Invalid PNR",
            "Please enter exactly 10 digits.",
            "error"
          );

          input.focus();

          return;

        }


        setButtonLoading(
          button,
          true,
          "Checking..."
        );


        showResult(
          "Checking PNR",
          "Validating your PNR request...",
          "loading"
        );


        await wait(800);


        saveHistory(
          "PNR Status",
          { pnr }
        );


        showResult(
          "PNR Accepted",
          `PNR ${pnr} is ready for live railway data integration.`,
          "success"
        );


        setButtonLoading(
          button,
          false
        );

      }
    );

  }


  /* =======================================================
     TRAIN SEARCH
  ======================================================= */

  function renderTrainSearch() {

    const screen =
      createToolScreen(
        "Train Search"
      );

    if (!screen) return;


    const body =
      $("#nexusRailToolBody");


    body.innerHTML = `

      ${formCard(`

        ${field(
          "FROM STATION",
          "nexusTrainFrom",
          "e.g. Ara"
        )}

        ${field(
          "TO STATION",
          "nexusTrainTo",
          "e.g. New Delhi"
        )}

        ${field(
          "JOURNEY DATE",
          "nexusTrainDate",
          "",
          "date"
        )}

        ${primaryButton(
          "nexusTrainSearchButton",
          "Search Trains"
        )}

      `)}

      ${resultBox()}

    `;


    const from =
      $("#nexusTrainFrom");

    const to =
      $("#nexusTrainTo");

    const date =
      $("#nexusTrainDate");

    const button =
      $("#nexusTrainSearchButton");


    button.addEventListener(
      "click",
      async () => {

        if (
          !validStation(
            from.value
          )
        ) {

          showResult(
            "From station required",
            "Enter a valid departure station.",
            "error"
          );

          from.focus();

          return;

        }


        if (
          !validStation(
            to.value
          )
        ) {

          showResult(
            "To station required",
            "Enter a valid destination station.",
            "error"
          );

          to.focus();

          return;

        }


        if (
          from.value
            .trim()
            .toLowerCase() ===
          to.value
            .trim()
            .toLowerCase()
        ) {

          showResult(
            "Invalid journey",
            "From and To stations cannot be the same.",
            "error"
          );

          return;

        }


        if (
          !validDate(
            date.value
          )
        ) {

          showResult(
            "Invalid date",
            "Select today or a future journey date.",
            "error"
          );

          date.focus();

          return;

        }


        setButtonLoading(
          button,
          true,
          "Searching..."
        );


        showResult(
          "Searching",
          "Preparing your train search...",
          "loading"
        );


        await wait(900);


        saveHistory(
          "Train Search",
          {
            from: from.value.trim(),
            to: to.value.trim(),
            date: date.value
          }
        );


        showResult(
          "Journey Ready",
          `${from.value.trim()} → ${to.value.trim()} is ready for live train data.`,
          "success"
        );


        setButtonLoading(
          button,
          false
        );

      }
    );

  }


  /* =======================================================
     LIVE TRAIN STATUS
  ======================================================= */

  function renderLiveStatus() {

    const screen =
      createToolScreen(
        "Live Train Status"
      );

    if (!screen) return;


    const body =
      $("#nexusRailToolBody");


    body.innerHTML = `

      ${formCard(`

        ${field(
          "TRAIN NUMBER",
          "nexusLiveTrain",
          "Enter train number"
        )}

        ${primaryButton(
          "nexusLiveButton",
          "Check Live Status"
        )}

      `)}

      ${resultBox()}


      <div class="nexus-rail-mini-note">

        Live position, current station,
        next station and delay will appear
        here after live API integration.

      </div>

    `;


    const input =
      $("#nexusLiveTrain");

    const button =
      $("#nexusLiveButton");


    input.addEventListener(
      "input",
      () => {

        input.value =
          input.value
            .replace(
              /\D/g,
              ""
            )
            .slice(
              0,
              6
            );

      }
    );


    button.addEventListener(
      "click",
      async () => {

        const train =
          input.value.trim();


        if (
          !validTrain(train)
        ) {

          showResult(
            "Invalid train number",
            "Enter a valid 4 to 6 digit train number.",
            "error"
          );

          input.focus();

          return;

        }


        setButtonLoading(
          button,
          true,
          "Checking..."
        );


        showResult(
          "Connecting",
          `Preparing live status for train ${train}...`,
          "loading"
        );


        await wait(800);


        saveHistory(
          "Live Train Status",
          { train }
        );


        showResult(
          "Train Accepted",
          `Train ${train} is ready for live running-status integration.`,
          "success"
        );


        setButtonLoading(
          button,
          false
        );

      }
    );

  }


  /* =======================================================
     TRAIN ROUTE
  ======================================================= */

  function renderRoute() {

    const screen =
      createToolScreen(
        "Train Route"
      );

    if (!screen) return;


    const body =
      $("#nexusRailToolBody");


    body.innerHTML = `

      ${formCard(`

        ${field(
          "TRAIN NUMBER / NAME",
          "nexusRouteTrain",
          "e.g. 12345"
        )}

        ${primaryButton(
          "nexusRouteButton",
          "Show Route"
        )}

      `)}

      ${resultBox()}


      <div class="nexus-route-preview">

        <div class="route-line">

          <span class="route-dot"></span>

          <span class="route-line-fill"></span>

          <span class="route-dot"></span>

        </div>

        <div>

          <strong>
            Route Preview
          </strong>

          <p>
            Complete station-by-station route
            will appear here after API integration.
          </p>

        </div>

      </div>

    `;


    const input =
      $("#nexusRouteTrain");

    const button =
      $("#nexusRouteButton");


    button.addEventListener(
      "click",
      async () => {

        const value =
          input.value.trim();


        if (!value) {

          showResult(
            "Train required",
            "Enter a train number or train name.",
            "error"
          );

          input.focus();

          return;

        }


        setButtonLoading(
          button,
          true,
          "Loading..."
        );


        await wait(700);


        saveHistory(
          "Train Route",
          {
            train: value
          }
        );


        showResult(
          "Route Request Ready",
          `${value} is ready for live route data.`,
          "success"
        );


        setButtonLoading(
          button,
          false
        );

      }
    );

  }


  /* =======================================================
     SEAT AVAILABILITY
  ======================================================= */

  function renderSeatAvailability() {

    const screen =
      createToolScreen(
        "Seat Availability"
      );

    if (!screen) return;


    const body =
      $("#nexusRailToolBody");


    body.innerHTML = `

      ${formCard(`

        ${field(
          "FROM STATION",
          "nexusSeatFrom",
          "From"
        )}

        ${field(
          "TO STATION",
          "nexusSeatTo",
          "To"
        )}

        ${field(
          "JOURNEY DATE",
          "nexusSeatDate",
          "",
          "date"
        )}

        <label class="nexus-field-label">
          CLASS
        </label>

        <select
          id="nexusSeatClass"
          class="nexus-rail-input"
        >

          <option value="">
            Select Class
          </option>

          <option value="SL">
            Sleeper (SL)
             </option>

          <option value="3A">
            AC 3 Tier (3A)
          </option>

          <option value="2A">
            AC 2 Tier (2A)
          </option>

          <option value="1A">
            First AC (1A)
          </option>

          <option value="CC">
            Chair Car (CC)
          </option>

          <option value="EC">
            Executive Chair Car (EC)
          </option>

        </select>


        <label class="nexus-field-label">
          QUOTA
        </label>

        <select
          id="nexusSeatQuota"
          class="nexus-rail-input"
        >

          <option value="GN">
            General
          </option>

          <option value="TQ">
            Tatkal
          </option>

          <option value="LD">
            Ladies
          </option>

          <option value="SS">
            Senior Citizen
          </option>

        </select>


        ${primaryButton(
          "nexusSeatButton",
          "Check Availability"
        )}

      `)}

      ${resultBox()}

    `;


    const from =
      $("#nexusSeatFrom");

    const to =
      $("#nexusSeatTo");

    const date =
      $("#nexusSeatDate");

    const cls =
      $("#nexusSeatClass");

    const quota =
      $("#nexusSeatQuota");

    const button =
      $("#nexusSeatButton");


    button.addEventListener(
      "click",
      async () => {

        if (
          !validStation(
            from.value
          ) ||
          !validStation(
            to.value
          )
        ) {

          showResult(
            "Journey required",
            "Enter valid From and To stations.",
            "error"
          );

          return;

        }


        if (
          !validDate(
            date.value
          )
        ) {

          showResult(
            "Date required",
            "Select today or a future journey date.",
            "error"
          );

          return;

        }


        if (!cls.value) {

          showResult(
            "Class required",
            "Select a travel class.",
            "error"
          );

          return;

        }


        setButtonLoading(
          button,
          true,
          "Checking..."
        );


        showResult(
          "Checking",
          "Preparing seat availability request...",
          "loading"
        );


        await wait(850);


        saveHistory(
          "Seat Availability",
          {
            from: from.value.trim(),
            to: to.value.trim(),
            date: date.value,
            class: cls.value,
            quota: quota.value
          }
        );


        showResult(
          "Request Ready",
          `${from.value.trim()} → ${to.value.trim()} • ${cls.value} • ${quota.value}`,
          "success"
        );


        setButtonLoading(
          button,
          false
        );

      }
    );

  }


  /* =======================================================
     BETWEEN STATIONS
  ======================================================= */

  function renderBetweenStations() {

    const screen =
      createToolScreen(
        "Between Stations"
      );

    if (!screen) return;


    const body =
      $("#nexusRailToolBody");


    body.innerHTML = `

      ${formCard(`

        ${field(
          "FROM STATION",
          "nexusBetweenFrom",
          "From station"
        )}

        ${field(
          "TO STATION",
          "nexusBetweenTo",
          "To station"
        )}

        ${primaryButton(
          "nexusBetweenButton",
          "Find Trains"
        )}

      `)}

      ${resultBox()}

    `;


    const from =
      $("#nexusBetweenFrom");

    const to =
      $("#nexusBetweenTo");

    const button =
      $("#nexusBetweenButton");


    button.addEventListener(
      "click",
      async () => {

        if (
          !validStation(
            from.value
          ) ||
          !validStation(
            to.value
          )
        ) {

          showResult(
            "Stations required",
            "Enter both From and To stations.",
            "error"
          );

          return;

        }


        setButtonLoading(
          button,
          true,
          "Finding..."
        );


        await wait(750);


        saveHistory(
          "Between Stations",
          {
            from: from.value.trim(),
            to: to.value.trim()
          }
        );


        showResult(
          "Search Ready",
          `Trains between ${from.value.trim()} and ${to.value.trim()} are ready for live data.`,
          "success"
        );


        setButtonLoading(
          button,
          false
        );

      }
    );

  }


  /* =======================================================
     ARRIVAL / DEPARTURE
  ======================================================= */

  function renderArrivalDeparture() {

    const screen =
      createToolScreen(
        "Arrival / Departure"
      );

    if (!screen) return;


    const body =
      $("#nexusRailToolBody");


    body.innerHTML = `

      ${formCard(`

        ${field(
          "RAILWAY STATION",
          "nexusArrivalStation",
          "Enter station name"
        )}

        ${primaryButton(
          "nexusArrivalButton",
          "Check Timings"
        )}

      `)}

      ${resultBox()}

    `;


    const input =
      $("#nexusArrivalStation");

    const button =
      $("#nexusArrivalButton");


    button.addEventListener(
      "click",
      async () => {

        const station =
          input.value.trim();


        if (
          !validStation(
            station
          )
        ) {

          showResult(
            "Station required",
            "Enter a valid railway station name.",
            "error"
          );

          input.focus();

          return;

        }


        setButtonLoading(
          button,
          true,
          "Checking..."
        );


        await wait(750);


        saveHistory(
          "Arrival / Departure",
          {
            station
          }
        );


        showResult(
          "Station Ready",
          `${station} is ready for live arrival and departure data.`,
          "success"
        );


        setButtonLoading(
          button,
          false
        );

      }
    );

  }


  /* =======================================================
     DELAY ALERTS
  ======================================================= */

  function renderDelayAlerts() {

    const screen =
      createToolScreen(
        "Delay Alerts"
      );

    if (!screen) return;


    const body =
      $("#nexusRailToolBody");


    body.innerHTML = `

      ${formCard(`

        ${field(
          "TRAIN NUMBER",
          "nexusDelayTrain",
          "Enter train number"
        )}

        ${primaryButton(
          "nexusDelayButton",
          "Check Delay"
        )}

      `)}

      ${resultBox()}


      <div class="nexus-rail-info-card">

        <span>
          DELAY MONITOR
        </span>

        <p>
          Live delay information will be shown
          here once the railway data API is connected.
        </p>

      </div>

    `;


    const input =
      $("#nexusDelayTrain");

    const button =
      $("#nexusDelayButton");


    input.addEventListener(
      "input",
      () => {

        input.value =
          input.value
            .replace(
              /\D/g,
              ""
            )
            .slice(
              0,
              6
            );

      }
    );


    button.addEventListener(
      "click",
      async () => {

        const train =
          input.value.trim();


        if (
          !validTrain(
            train
          )
        ) {

          showResult(
            "Invalid train number",
            "Enter a valid 4 to 6 digit train number.",
            "error"
          );

          input.focus();

          return;

        }


        setButtonLoading(
          button,
          true,
          "Checking..."
        );


        await wait(700);


        saveHistory(
          "Delay Alerts",
          {
            train
          }
        );


        showResult(
          "Delay Monitor Ready",
          `Train ${train} is ready for live delay data.`,
          "success"
        );


        setButtonLoading(
          button,
          false
        );

      }
    );

  }


  /* =======================================================
     TOOL ROUTER
  ======================================================= */

  function openTool(
    toolName
  ) {

    switch (toolName) {

      case "PNR Status":
        renderPNR();
        break;

      case "Train Search":
        renderTrainSearch();
        break;

      case "Live Train Status":
        renderLiveStatus();
        break;

      case "Train Route":
        renderRoute();
        break;

      case "Seat Availability":
        renderSeatAvailability();
        break;

      case "Between Stations":
        renderBetweenStations();
        break;

      case "Arrival / Departure":
        renderArrivalDeparture();
        break;

      case "Delay Alerts":
        renderDelayAlerts();
        break;

      default:

        toast(
          "Rail tool unavailable"
        );

    }

  }


  /*
  =======================================================
     INTERCEPT RAIL BUTTONS
  ======================================================= */

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "#railPanel [data-tool]"
        );


      if (!button) return;


      const tool =
        button.dataset.tool;


      if (!TOOLS[tool]) return;


      event.preventDefault();

      event.stopImmediatePropagation();


      saveHistory(
        tool,
        {
          opened: true
        }
      );


      openTool(
        tool
      );

    },
    true
  );


  /* =======================================================
     RAIL QUICK ACTIONS
  ======================================================= */

  document.addEventListener(
    "click",
    event => {

      const action =
        event.target.closest(
          "[data-rail-action]"
        );


      if (!action) return;


      const value =
        action.dataset.railAction;


      if (
        value === "history"
      ) {

        renderHistory();

      }


      if (
        value === "favorites"
      ) {

        renderFavorites();

      }

    }
  );


  /* =======================================================
     HISTORY SCREEN
  ======================================================= */

  function renderHistory() {

    closeTool();


    const panel =
      $("#railPanel");

    if (!panel) return;


    const screen =
      createToolScreen(
        "Rail History"
      );

    if (!screen) return;


    const body =
      $("#nexusRailToolBody");


    const history =
      getHistory();


    if (!history.length) {

      body.innerHTML = `

        <div class="nexus-empty-state">

          <div>
            ◌
          </div>

          <strong>
            No Rail History
          </strong>

          <p>
            Your recent Rail searches will appear here.
          </p>

        </div>

      `;

      return;

    }


    body.innerHTML = `

      <div class="nexus-history-list">

        ${history.map(item => {

          const data =
            item.data || {};

          const details =
            Object.values(data)
              .filter(Boolean)
              .join(" • ");


          return `

            <div class="nexus-history-item">

              <div class="history-icon">
                🚆
              </div>

              <div>

                <strong>
                  ${escapeHTML(
                    item.type
                  )}
                </strong>

                <p>
                  ${escapeHTML(
                    details ||
                    "Rail Mode"
                  )}
                </p>

              </div>

            </div>

          `;

        }).join("")}

      </div>

      <button
        type="button"
        id="nexusClearRailHistory"
        class="nexus-rail-secondary"
      >
        Clear History
      </button>

    `;


    $("#nexusClearRailHistory")
      ?.addEventListener(
        "click",
        () => {

          localStorage.removeItem(
            STORAGE.history
          );

          toast(
            "Rail history cleared"
          );

          renderHistory();

        }
      );

  }


  /* =======================================================
     FAVORITES SCREEN
  ======================================================= */

  function renderFavorites() {

    closeTool();


    const screen =
      createToolScreen(
        "Rail Favorites"
      );

    if (!screen) return;


    const body =
      $("#nexusRailToolBody");


    const favorites =
      getFavorites();


    if (!favorites.length) {

      body.innerHTML = `

        <div class="nexus-empty-state">

          <div>
            ☆
          </div>

          <strong>
            No Favorites Yet
          </strong>

          <p>
            Favourite trains and stations
            will appear here.
          </p>

        </div>

      `;

      return;

    }


    body.innerHTML = `

      <div class="nexus-history-list">

        ${favorites.map(item => `

          <div class="nexus-history-item">

            <div class="history-icon">
              ★
            </div>

            <div>

              <strong>
                ${escapeHTML(
                  item.value
                )}
              </strong>

              <p>
                ${escapeHTML(
                  item.type
                )}
              </p>

            </div>

          </div>

        `).join("")}

      </div>

    `;

  }


  /* =======================================================
     GLOBAL API FOR FUTURE BACKEND
  ======================================================= */

  window.NEXUS_RAIL = {

    version:
      "2.0.0",

    openTool,

    getHistory,

    getFavorites,

    saveFavorite,

    saveHistory,

    closeTool,

    state:
      railState

  };


  /* =======================================================
     STYLES
  ======================================================= */

  function injectStyles() {

    if (
      $("#nexusRailCompleteStyles")
    ) return;


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "nexusRailCompleteStyles";


    style.textContent = `

      #nexusRailToolScreen {

        margin-top:
          14px;

        padding:
          15px;

        border:
          1px solid
          rgba(255,255,255,.08);

        border-radius:
          18px;

        background:
          linear-gradient(
            145deg,
            rgba(0,210,240,.045),
            rgba(90,80,255,.035)
          );

        animation:
          nexusRailAppear .25s ease;

      }


      @keyframes nexusRailAppear {

        from {

          opacity:
            0;

          transform:
            translateY(8px);

        }

        to {

          opacity:
            1;

          transform:
            translateY(0);

        }

      }


      .nexus-rail-screen-header {

        display:
          flex;

        align-items:
          flex-start;

        gap:
          12px;

        margin-bottom:
          15px;

      }


      .nexus-rail-back {

        width:
          40px;

        height:
          40px;

        flex-shrink:
          0;

        border:
          1px solid
          rgba(255,255,255,.09);

        border-radius:
          12px;

        background:
          rgba(255,255,255,.035);

        color:
          #fff;

        font-size:
          26px;

        line-height:
          1;

      }


      .nexus-rail-back:active {

        transform:
          scale(.94);

      }


      .nexus-rail-screen-title h3 {

        margin:
          5px 0 3px;

        color:
          #eaf8ff;

        font-size:
          17px;

      }


      .nexus-rail-screen-title p {

        margin:
          0;

        color:
          #72839a;

        font-size:
          9px;

        line-height:
          1.5;

      }


      .nexus-rail-form-card {

        display:
          flex;

        flex-direction:
          column;

        gap:
          8px;

        padding:
          14px;

        border:
          1px solid
          rgba(255,255,255,.07);

        border-radius:
          15px;

        background:
          rgba(0,0,0,.14);

      }


      .nexus-field-label {

        margin-top:
          4px;

        color:
          #8497ae;

        font-size:
          8px;

        font-weight:
          800;

        letter-spacing:
          .8px;

      }


      .nexus-rail-input {

        width:
          100%;

        height:
          44px;

        box-sizing:
          border-box;

        padding:
          0 12px;

        border:
          1px solid
          rgba(255,255,255,.09);

        border-radius:
          11px;

        outline:
          none;

        background:
          #071120;

        color:
          #fff;

        font-size:
          10px;

      }


      .nexus-rail-input::placeholder {

        color:
          #52657b;

      }


      .nexus-rail-input:focus {

        border-color:
          rgba(0,210,240,.55);

        box-shadow:
          0 0 0 3px
          rgba(0,210,240,.07);

      }


      .nexus-rail-primary {

        width:
          100%;

        min-height:
          44px;

        margin-top:
          7px;

        border:
          0;

        border-radius:
          11px;

        background:
          linear-gradient(
            135deg,
            #08bddd,
            #477cff
          );

        color:
          #fff;

        font-size:
          10px;

        font-weight:
          900;

        transition:
          transform .15s ease,
          opacity .15s ease;

      }


      .nexus-rail-primary:active {

        transform:
          scale(.98);

      }


      .nexus-rail-primary:disabled {

        opacity:
          .65;

      }


      .nexus-rail-primary.rail-loading {

        position:
          relative;

      }


      .nexus-rail-result {

        display:
          flex;

        align-items:
          flex-start;

        gap:
          10px;

        margin-top:
          10px;

        padding:
          13px;

        border:
          1px solid
          rgba(255,255,255,.07);

        border-radius:
          14px;

        background:
          rgba(255,255,255,.025);

        color:
          #a2b3c7;

      }


      .nexus-result-icon {

        width:
          28px;

        height:
          28px;

        flex-shrink:
          0;

        display:
          flex;

        align-items:
          center;

        justify-content:
          center;

        border-radius:
          9px;

        background:
          rgba(0,210,240,.08);

        color:
          #42dfff;

        font-weight:
          900;

      }


      .nexus-result-content {

        min-width:
          0;

      }


      .nexus-result-content strong {

        display:
          block;

        color:
          #e8f8ff;

        font-size:
          10px;

      }


      .nexus-result-content p {

        margin:
          4px 0 0;

        color:
          #7f91a7;

        font-size:
          8px;

        line-height:
          1.5;

      }


      .nexus-rail-result.error {

        border-color:
          rgba(255,75,105,.25);

      }


      .nexus-rail-result.error
      .nexus-result-icon {

        background:
          rgba(255,75,105,.1);

        color:
          #ff6680;

      }


      .nexus-rail-result.success {

        border-color:
          rgba(0,220,170,.2);

      }


      .nexus-rail-result.success
      .nexus-result-icon {

        background:
          rgba(0,220,170,.1);

        color:
          #48e8c0;

      }


      .nexus-rail-result.loading
      .nexus-result-icon {

        animation:
          nexusRailSpin 1s linear infinite;

      }


      @keyframes nexusRailSpin {

        to {

          transform:
            rotate(360deg);

        }

      }


      .nexus-rail-info-card {

        margin-top:
          10px;

        padding:
          13px;

        border:
          1px solid
          rgba(255,255,255,.06);

        border-radius:
          14px;

        background:
          rgba(0,210,240,.025);

      }


      .nexus-rail-info-card span {

        color:
          #42dfff;

        font-size:
          8px;

        font-weight:
          900;

        letter-spacing:
          .8px;

      }


      .nexus-rail-info-card p {

        margin:
          6px 0 0;

        color:
          #718399;

        font-size:
          8px;

        line-height:
          1.55;

      }


      .nexus-rail-mini-note {

        margin-top:
          10px;

        padding:
          11px;

        border-radius:
          11px;

        background:
          rgba(255,255,255,.025);

        color:
          #65788f;

        font-size:
          8px;

        line-height:
          1.5;

      }


      .nexus-route-preview {

        display:
          flex;

        gap:
          12px;

        margin-top:
          10px;

        padding:
          14px;

        border:
          1px solid
          rgba(255,255,255,.06);

        border-radius:
          14px;

        background:
          rgba(255,255,255,.02);

      }


      .route-line {

        width:
          12px;

        display:
          flex;

        flex-direction:
          column;

        align-items:
          center;

      }


      .route-dot {

        width:
          8px;

        height:
          8px;

        border-radius:
          50%;

        background:
          #32dfff;

      }


      .route-line-fill {

        width:
          1px;

        height:
          35px;

        background:
          rgba(50,223,255,.35);

      }


      .nexus-route-preview strong {

        color:
          #dff8ff;

        font-size:
          10px;

      }


      .nexus-route-preview p {

        margin:
          5px 0 0;

        color:
          #6e8096;

        font-size:
          8px;

        line-height:
          1.5;

      }


      .nexus-empty-state {

        padding:
          30px 15px;

        text-align:
          center;

      }


      .nexus-empty-state > div {

        font-size:
          30px;

        color:
          #36dfff;

        margin-bottom:
          8px;

      }


      .nexus-empty-state strong {

        color:
          #e8f8ff;

        font-size:
          12px;

      }


      .nexus-empty-state p {

        color:
          #718399;

        font-size:
          9px;

        line-height:
          1.5;

      }


      .nexus-history-list {

        display:
          flex;

        flex-direction:
          column;

        gap:
          8px;

      }


      .nexus-history-item {

        display:
          flex;

        align-items:
          center;

        gap:
          10px;

        padding:
          12px;

        border:
          1px solid
          rgba(255,255,255,.06);

        border-radius:
          13px;

        background:
          rgba(255,255,255,.025);

      }


      .history-icon {

        width:
          34px;

        height:
          34px;

        display:
          flex;

        align-items:
          center;

        justify-content:
          center;

        border-radius:
          10px;

        background:
          rgba(0,210,240,.08);

        color:
          #40ddff;

      }


      .nexus-history-item strong {

        color:
          #e5f7ff;

        font-size:
          9px;

      }


      .nexus-history-item p {

        margin:
          3px 0 0;

        color:
          #708197;

        font-size:
          8px;

      }


      .nexus-rail-secondary {

        width:
          100%;

        min-height:
          40px;

        margin-top:
          10px;

        border:
          1px solid
          rgba(255,255,255,.08);

        border-radius:
          10px;

        background:
          rgba(255,255,255,.025);

        color:
          #9eb0c4;

        font-size:
          9px;

      }


      .nexus-rail-toast {

        position:
          fixed;

        left:
          50%;

        bottom:
          85px;

        z-index:
          999999;

        max-width:
          calc(100% - 30px);

        padding:
          12px 16px;

        border:
          1px solid
          rgba(0,210,240,.3);

        border-radius:
          13px;

        background:
          rgba(5,10,22,.96);

        color:
          #e8f8ff;

        font-size:
          9px;

        transform:
          translate(-50%, 15px);

        opacity:
          0;

        transition:
          .2s ease;

        pointer-events:
          none;

      }


      .nexus-rail-toast.show {

        opacity:
          1;

        transform:
          translate(-50%, 0);

      }


      @media (max-width:520px) {

        #nexusRailToolScreen {

          padding:
            13px;

        }

        .nexus-rail-screen-title h3 {

          font-size:
            16px;

        }

      }

    `;


    document.head.appendChild(
      style
    );

  }


  /*
  =======================================================
     INITIALIZE
  ======================================================= */

  function init() {

    injectStyles();

    console.log(
      "%cNEXUS RAIL ENGINE READY",
      "color:#35ddff;font-weight:900"
    );

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      init
    );

  } else {

    init();

  }

})();
          
