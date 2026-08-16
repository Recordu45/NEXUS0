/* =========================================================
   NEXUS RAIL MODE
   Rail Engine V2
   ========================================================= */

(() => {
  "use strict";

  const STORAGE_KEY = "nexus_rail_history";

  const railState = {
    currentMode: null,
    loading: false
  };

  /* =========================================================
     HELPERS
     ========================================================= */

  function $(selector, parent = document) {
    return parent.querySelector(selector);
  }

  function $$(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showToast(message) {
    const toast = $("#toast");

    if (!toast) {
      alert(message);
      return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.nexusRailToastTimer);

    window.nexusRailToastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2500);
  }

  function setLoading(button, loading, text = "Processing...") {
    if (!button) return;

    if (loading) {
      button.dataset.originalText = button.textContent;
      button.disabled = true;
      button.textContent = text;
      button.classList.add("is-loading");
    } else {
      button.disabled = false;
      button.textContent =
        button.dataset.originalText || "Continue";
      button.classList.remove("is-loading");
    }
  }

  /* =========================================================
     HISTORY
     ========================================================= */

  function getHistory() {
    try {
      return JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );
    } catch {
      return [];
    }
  }

  function saveHistory(type, data) {
    const history = getHistory();

    history.unshift({
      type,
      data,
      time: new Date().toISOString()
    });

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(history.slice(0, 20))
    );
  }

  /* =========================================================
     RESULT AREA
     ========================================================= */

  function createResultBox(panel) {
    if (!panel) return null;

    let result = $(".rail-result", panel);

    if (!result) {
      result = document.createElement("div");
      result.className = "rail-result";

      panel.appendChild(result);
    }

    return result;
  }

  function showResult(panel, title, message, type = "info") {
    const result = createResultBox(panel);

    if (!result) return;

    result.className = `rail-result ${type}`;

    result.innerHTML = `
      <div class="rail-result-icon">
        ${type === "error" ? "!" : "✓"}
      </div>

      <div class="rail-result-content">
        <strong>${escapeHTML(title)}</strong>
        <p>${escapeHTML(message)}</p>
      </div>
    `;

    result.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  }

  /* =========================================================
     VALIDATION
     ========================================================= */

  function validPNR(value) {
    return /^\d{10}$/.test(value.trim());
  }

  function validTrainNumber(value) {
    return /^\d{4,6}$/.test(value.trim());
  }

  function validStation(value) {
    return value.trim().length >= 2;
  }

  /* =========================================================
     PNR
     ========================================================= */

  function setupPNR(panel) {
    if (!panel) return;

    const input =
      $("input[placeholder*='PNR']", panel) ||
      $("input[type='text']", panel);

    const button =
      $("button[type='submit']", panel) ||
      $$("button", panel).find(
        btn => /check pnr/i.test(btn.textContent)
      );

    if (!input || !button) return;

    if (input.dataset.railBound) return;
    input.dataset.railBound = "1";

    input.inputMode = "numeric";
    input.maxLength = 10;

    input.addEventListener("input", () => {
      input.value = input.value
        .replace(/\D/g, "")
        .slice(0, 10);
    });

    button.addEventListener("click", async event => {
      event.preventDefault();

      const pnr = input.value.trim();

      if (!validPNR(pnr)) {
        showResult(
          panel,
          "Invalid PNR",
          "Please enter a valid 10-digit PNR number.",
          "error"
        );
        return;
      }

      setLoading(button, true, "Checking...");

      saveHistory("PNR Status", { pnr });

      await wait(700);

      showResult(
        panel,
        "PNR Accepted",
        `PNR ${pnr} is ready for live railway API lookup.`,
        "success"
      );

      setLoading(button, false);
    });
  }

  /* =========================================================
     TRAIN SEARCH
     ========================================================= */

  function setupTrainSearch(panel) {
    if (!panel) return;

    const inputs = $$("input", panel);

    if (inputs.length < 2) return;

    const from = inputs[0];
    const to = inputs[1];

    const button = $$("button", panel).find(
      btn => /search trains/i.test(btn.textContent)
    );

    if (!button || button.dataset.railBound) return;

    button.dataset.railBound = "1";

    button.addEventListener("click", async event => {
      event.preventDefault();

      const fromValue = from.value.trim();
      const toValue = to.value.trim();

      if (!validStation(fromValue)) {
        showResult(
          panel,
          "From station required",
          "Please enter a valid departure station.",
          "error"
        );
        from.focus();
        return;
      }

      if (!validStation(toValue)) {
        showResult(
          panel,
          "To station required",
          "Please enter a valid destination station.",
          "error"
        );
        to.focus();
        return;
      }

      if (
        fromValue.toLowerCase() ===
        toValue.toLowerCase()
      ) {
        showResult(
          panel,
          "Invalid journey",
          "From and To stations cannot be the same.",
          "error"
        );
        return;
      }

      setLoading(button, true, "Searching...");

      saveHistory("Train Search", {
        from: fromValue,
        to: toValue
      });

      await wait(700);

      showResult(
        panel,
        "Journey Ready",
        `${fromValue} → ${toValue} is ready for live train search.`,
        "success"
      );

      setLoading(button, false);
    });
  }

  /* =========================================================
     LIVE TRAIN STATUS
     ========================================================= */

  function setupLiveStatus(panel) {
    if (!panel) return;

    const input = $("input", panel);

    const button = $$("button", panel).find(
      btn => /live status/i.test(btn.textContent)
    );

    if (!input || !button || button.dataset.railBound) {
      return;
    }

    button.dataset.railBound = "1";

    input.inputMode = "numeric";

    input.addEventListener("input", () => {
      input.value = input.value
        .replace(/\D/g, "")
        .slice(0, 6);
    });

    button.addEventListener("click", async event => {
      event.preventDefault();

      const train = input.value.trim();

      if (!validTrainNumber(train)) {
        showResult(
          panel,
          "Invalid train number",
          "Enter a valid 4 to 6 digit train number.",
          "error"
        );
        return;
      }

      setLoading(button, true, "Checking...");

      saveHistory("Live Train Status", {
        train
      });

      await wait(700);

      showResult(
        panel,
        "Train Accepted",
        `Train ${train} is ready for live running-status lookup.`,
        "success"
      );

      setLoading(button, false);
    });
  }

  /* =========================================================
     TRAIN ROUTE
     ========================================================= */

  function setupTrainRoute(panel) {
    if (!panel) return;

    const input = $("input", panel);

    const button = $$("button", panel).find(
      btn => /show route/i.test(btn.textContent)
    );

    if (!input || !button || button.dataset.railBound) {
      return;
    }

    button.dataset.railBound = "1";

    button.addEventListener("click", async event => {
      event.preventDefault();

      const value = input.value.trim();

      if (!value) {
        showResult(
          panel,
          "Train required",
          "Enter a train number or train name.",
          "error"
        );
        return;
      }

      setLoading(button, true, "Loading...");

      saveHistory("Train Route", {
        train: value
      });

      await wait(700);

      showResult(
        panel,
        "Route Request Ready",
        `${value} is ready for live route lookup.`,
        "success"
      );

      setLoading(button, false);
    });
  }

  /* =========================================================
     SEAT AVAILABILITY
     ========================================================= */

  function setupSeatAvailability(panel) {
    if (!panel) return;

    const inputs = $$("input", panel);

    const button = $$("button", panel).find(
      btn => /check availability/i.test(btn.textContent)
    );

    if (
      inputs.length < 2 ||
      !button ||
      button.dataset.railBound
    ) {
      return;
    }

    button.dataset.railBound = "1";

    button.addEventListener("click", async event => {
      event.preventDefault();

      const from = inputs[0].value.trim();
      const to = inputs[1].value.trim();

      if (!validStation(from) || !validStation(to)) {
        showResult(
          panel,
          "Journey details required",
          "Enter both From and To stations.",
          "error"
        );
        return;
      }

      setLoading(button, true, "Checking...");

      saveHistory("Seat Availability", {
        from,
        to
      });

      await wait(700);

      showResult(
        panel,
        "Availability Request Ready",
        `${from} → ${to} is ready for live seat availability lookup.`,
        "success"
      );

      setLoading(button, false);
    });
  }

  /* =========================================================
     BETWEEN STATIONS
     ========================================================= */

  function setupBetweenStations(panel) {
    if (!panel) return;

    const inputs = $$("input", panel);

    const button = $$("button", panel).find(
      btn => /find trains/i.test(btn.textContent)
    );

    if (
      inputs.length < 2 ||
      !button ||
      button.dataset.railBound
    ) {
      return;
    }

    button.dataset.railBound = "1";

    button.addEventListener("click", async event => {
      event.preventDefault();

      const from = inputs[0].value.trim();
      const to = inputs[1].value.trim();

      if (!validStation(from) || !validStation(to)) {
        showResult(
          panel,
          "Both stations required",
          "Please enter From and To stations.",
          "error"
        );
        return;
      }

      setLoading(button, true, "Finding...");

      saveHistory("Between Stations", {
        from,
        to
      });

      await wait(700);

      showResult(
        panel,
        "Search Ready",
        `Train search between ${from} and ${to} is ready for live data.`,
        "success"
      );

      setLoading(button, false);
    });
  }

  /* =========================================================
     ARRIVAL / DEPARTURE
     ========================================================= */

  function setupArrivalDeparture(panel) {
    if (!panel) return;

    const input = $("input", panel);

    const button = $$("button", panel).find(
      btn => /check timings/i.test(btn.textContent)
    );

    if (!input || !button || button.dataset.railBound) {
      return;
    }

    button.dataset.railBound = "1";

    button.addEventListener("click", async event => {
      event.preventDefault();

      const station = input.value.trim();

      if (!validStation(station)) {
        showResult(
          panel,
          "Station required",
          "Enter a railway station name.",
          "error"
        );
        return;
      }

      setLoading(button, true, "Checking...");

      saveHistory("Arrival / Departure", {
        station
      });

      await wait(700);

      showResult(
        panel,
        "Station Accepted",
        `${station} is ready for live arrival/departure lookup.`,
        "success"
      );

      setLoading(button, false);
    });
  }

  /* =========================================================
     DELAY ALERTS
     ========================================================= */

  function setupDelayAlerts(panel) {
    if (!panel) return;

    const input = $("input", panel);

    const button = $$("button", panel).find(
      btn => /check delay/i.test(btn.textContent)
    );

    if (!input || !button || button.dataset.railBound) {
      return;
    }

    button.dataset.railBound = "1";

    input.inputMode = "numeric";

    input.addEventListener("input", () => {
      input.value = input.value
        .replace(/\D/g, "")
        .slice(0, 6);
    });

    button.addEventListener("click", async event => {
      event.preventDefault();

      const train = input.value.trim();

      if (!validTrainNumber(train)) {
        showResult(
          panel,
          "Invalid train number",
          "Enter a valid 4 to 6 digit train number.",
          "error"
        );
        return;
      }

      setLoading(button, true, "Checking...");

      saveHistory("Delay Alerts", {
        train
      });

      await wait(700);

      showResult(
        panel,
        "Delay Monitor Ready",
        `Train ${train} is ready for live delay information.`,
        "success"
      );

      setLoading(button, false);
    });
  }

  /* =========================================================
     MODE DETECTION
     ========================================================= */

  function detectPanelMode(panel) {
    if (!panel) return;

    const heading =
      $("h1", panel) ||
      $("h2", panel) ||
      $("h3", panel);

    if (!heading) return;

    const title =
      heading.textContent
        .trim()
        .toLowerCase();

    if (title.includes("pnr")) {
      setupPNR(panel);
    }

    if (title.includes("train search")) {
      setupTrainSearch(panel);
    }

    if (title.includes("live train status")) {
      setupLiveStatus(panel);
    }

    if (title.includes("train route")) {
      setupTrainRoute(panel);
    }

    if (title.includes("seat availability")) {
      setupSeatAvailability(panel);
    }

    if (title.includes("between stations")) {
      setupBetweenStations(panel);
    }

    if (title.includes("arrival / departure")) {
      setupArrivalDeparture(panel);
    }

    if (title.includes("delay alerts")) {
      setupDelayAlerts(panel);
    }
  }

  /* =========================================================
     INITIALIZE
     ========================================================= */

  function initRailMode() {
    const panels = $$(".panel");

    panels.forEach(panel => {
      detectPanelMode(panel);
    });

    console.log(
      "%cNEXUS Rail Mode V2 loaded",
      "color:#20d9ff;font-weight:bold"
    );
  }

  function wait(ms) {
    return new Promise(resolve =>
      setTimeout(resolve, ms)
    );
  }

  /* =========================================================
     START
     ========================================================= */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initRailMode
    );
  } else {
    initRailMode();
  }

})();
