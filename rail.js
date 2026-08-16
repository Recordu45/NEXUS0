/* ==========================================
   NEXUS RAIL MODE V3
   IN-APP RAIL TOOLS
========================================== */

(() => {
  "use strict";

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const TOOLS = {
    "PNR Status": {
      title: "PNR Status",
      subtitle: "Check your railway booking status",
      type: "pnr"
    },

    "Train Search": {
      title: "Train Search",
      subtitle: "Find trains for your journey",
      type: "train"
    },

    "Live Train Status": {
      title: "Live Train Status",
      subtitle: "Track a train by train number",
      type: "live"
    },

    "Train Route": {
      title: "Train Route",
      subtitle: "View route information",
      type: "route"
    },

    "Seat Availability": {
      title: "Seat Availability",
      subtitle: "Check seats for your journey",
      type: "seat"
    },

    "Between Stations": {
      title: "Between Stations",
      subtitle: "Find trains between two stations",
      type: "between"
    },

    "Arrival / Departure": {
      title: "Arrival / Departure",
      subtitle: "Check station train timings",
      type: "arrival"
    },

    "Delay Alerts": {
      title: "Delay Alerts",
      subtitle: "Check delay information",
      type: "delay"
    }
  };


  /* ==========================================
     TOAST
  ========================================== */

  function showToast(message) {

    if (typeof window.toast === "function") {
      window.toast(message);
      return;
    }

    const toast = $("#toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.nexusRailToast);

    window.nexusRailToast = setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }


  /* ==========================================
     ACTIVITY
  ========================================== */

  function saveActivity(title) {

    try {

      const old = JSON.parse(
        localStorage.getItem("nexusActivity") || "[]"
      );

      old.unshift({
        title: title,
        subtitle: "Rail Mode",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      });

      localStorage.setItem(
        "nexusActivity",
        JSON.stringify(old.slice(0, 10))
      );

    } catch (error) {}

  }


  /* ==========================================
     CLOSE TOOL
  ========================================== */

  function closeRailTool() {

    const screen =
      $("#nexusRailToolScreen");

    if (screen) {
      screen.remove();
    }

  }


  /* ==========================================
     OPEN TOOL
  ========================================== */

  function openRailTool(toolName) {

    const config =
      TOOLS[toolName];

    if (!config) return;

    saveActivity(toolName);

    closeRailTool();


    const panel =
      $("#railPanel");

    if (!panel) return;


    const screen =
      document.createElement("div");

    screen.id =
      "nexusRailToolScreen";


    screen.innerHTML = `

      <div class="nexus-rail-tool-head">

        <button
          type="button"
          id="nexusRailBack"
          class="nexus-rail-back"
        >
          ←
        </button>


        <div>

          <span class="panel-label cyan">
            RAIL MODE
          </span>

          <h3>
            ${config.title}
          </h3>

          <p>
            ${config.subtitle}
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

      panel.appendChild(screen);

    }


    const backButton =
      $("#nexusRailBack");


    if (backButton) {

      backButton.addEventListener(
        "click",
        closeRailTool
      );

    }


    renderToolForm(
      config.type
    );

  }


  /* ==========================================
     RESULT
  ========================================== */

  function setResult(html) {

    const result =
      $("#railResult");

    if (result) {
      result.innerHTML = html;
    }

  }


  /* ==========================================
     FORM RENDERER
  ========================================== */

  function renderToolForm(type) {

    const body =
      $("#nexusRailToolBody");

    if (!body) return;


    /* PNR */

    if (type === "pnr") {

      body.innerHTML = `

        <div class="rail-form-card">

          <label>
            PNR Number
          </label>

          <input
            id="railPnr"
            type="text"
            inputmode="numeric"
            maxlength="10"
            placeholder="Enter 10 digit PNR"
          >

          <button
            class="rail-primary-btn"
            id="railPnrCheck"
          >
            Check PNR
          </button>

        </div>


        <div
          id="railResult"
          class="rail-result"
        >
          Enter your PNR to continue.
        </div>

      `;


      const input =
        $("#railPnr");

      const button =
        $("#railPnrCheck");


      if (input) {

        input.addEventListener(
          "input",
          event => {

            event.target.value =
              event.target.value
                .replace(/\D/g, "")
                .slice(0, 10);

          }
        );

      }


      if (button) {

        button.addEventListener(
          "click",
          () => {

            const pnr =
              input.value.trim();


            if (
              !/^\d{10}$/.test(pnr)
            ) {

              setResult(`

                <strong>
                  Invalid PNR
                </strong>

                <span>
                  Please enter exactly 10 digits.
                </span>

              `);

              return;

            }


            setResult(`

              <strong>
                PNR Accepted
              </strong>

              <span>
                PNR ${pnr} is ready.
              </span>

              <small>
                Live railway data will be connected
                through the NEXUS railway API layer.
              </small>

            `);

          }
        );

      }

      return;
    }


    /* TRAIN SEARCH */

    if (type === "train") {

      body.innerHTML = `

        <div class="rail-form-card">

          <label>
            From Station
          </label>

          <input
            id="railFrom"
            placeholder="e.g. Ara"
          >


          <label>
            To Station
          </label>

          <input
            id="railTo"
            placeholder="e.g. New Delhi"
          >


          <label>
            Journey Date
          </label>

          <input
            id="railDate"
            type="date"
          >


          <button
            class="rail-primary-btn"
            id="railTrainSearch"
          >
            Search Trains
          </button>

        </div>


        <div
          id="railResult"
          class="rail-result"
        >
          Enter your journey details.
        </div>

      `;


      $("#railTrainSearch")
        ?.addEventListener(
          "click",
          () => {

            const from =
              $("#railFrom")?.value.trim();

            const to =
              $("#railTo")?.value.trim();

            const date =
              $("#railDate")?.value;


            if (!from || !to || !date) {

              setResult(`

                <strong>
                  Complete all fields
                </strong>

                <span>
                  Enter From, To and Journey Date.
                </span>

              `);

              return;

            }


            setResult(`

              <strong>
                Train Search Ready
              </strong>

              <span>
                ${from} → ${to}
              </span>

              <small>
                Journey date: ${date}
              </small>

              <small>
                Live train results will appear here
                after railway API integration.
              </small>

            `);

          }
        );

      return;
    }


    /* LIVE STATUS */

    if (type === "live") {

      body.innerHTML = `

        <div class="rail-form-card">

          <label>
            Train Number
          </label>

          <input
            id="railTrainNumber"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="Enter train number"
          >


          <button
            class="rail-primary-btn"
            id="railLiveCheck"
          >
            Check Live Status
          </button>

        </div>


        <div
          id="railResult"
          class="rail-result"
        >
          Enter a train number.
        </div>

      `;


      $("#railLiveCheck")
        ?.addEventListener(
          "click",
          () => {

            const number =
              $("#railTrainNumber")
                ?.value.trim();


            if (!number) {

              setResult(`
                <strong>
                  Enter Train Number
                </strong>
              `);

              return;

            }


            setResult(`

              <strong>
                Live Status
              </strong>

              <span>
                Train ${number}
              </span>

              <small>
                Live location and delay data will appear
                here after API integration.
              </small>

            `);

          }
        );

      return;
    }


    /* ROUTE */

    if (type === "route") {

      body.innerHTML = `

        <div class="rail-form-card">

          <label>
            Train Number / Name
          </label>

          <input
            id="railRouteTrain"
            placeholder="Enter train number or name"
          >


          <button
            class="rail-primary-btn"
            id="railRouteCheck"
          >
            Show Route
          </button>

        </div>


        <div
          id="railResult"
          class="rail-result"
        >
          Enter a train number or train name.
        </div>

      `;


      $("#railRouteCheck")
        ?.addEventListener(
          "click",
          () => {

            const train =
              $("#railRouteTrain")
                ?.value.trim();


            if (!train) {

              setResult(`
                <strong>
                  Enter Train Number or Name
                </strong>
              `);

              return;

            }


            setResult(`

              <strong>
                Train Route
              </strong>

              <span>
                ${train}
              </span>

              <small>
                Complete station-by-station route
                will appear here after API integration.
              </small>

            `);

          }
        );

      return;
    }


    /* SEAT AVAILABILITY */

    if (type === "seat") {

      body.innerHTML = `

        <div class="rail-form-card">

          <label>
            From Station
          </label>

          <input
            id="railSeatFrom"
            placeholder="From"
          >


          <label>
            To Station
          </label>

          <input
            id="railSeatTo"
            placeholder="To"
          >


          <label>
            Journey Date
          </label>

          <input
            id="railSeatDate"
            type="date"
          >


          <label>
            Class
          </label>

          <select
            id="railClass"
          >

            <option value="">
              Select Class
            </option>

            <option>
              SL
            </option>

            <option>
              3A
            </option>

            <option>
              2A
            </option>

            <option>
              1A
            </option>

            <option>
              CC
            </option>

            <option>
              EC
            </option>

          </select>


          <button
            class="rail-primary-btn"
            id="railSeatCheck"
          >
            Check Availability
          </button>

        </div>


        <div
          id="railResult"
          class="rail-result"
        >
          Enter journey details.
        </div>

      `;


      $("#railSeatCheck")
        ?.addEventListener(
          "click",
          () => {

            const from =
              $("#railSeatFrom")
                ?.value.trim();

            const to =
              $("#railSeatTo")
                ?.value.trim();

            const date =
              $("#railSeatDate")
                ?.value;

            const cls =
              $("#railClass")
                ?.value;


            if (
              !from ||
              !to ||
              !date ||
              !cls
            ) {

              setResult(`

                <strong>
                  Complete all fields
                </strong>

                <span>
                  Enter journey details and class.
                </span>

              `);

              return;

            }


            setResult(`

              <strong>
                Seat Availability
              </strong>

              <span>
                ${from} → ${to}
              </span>

              <small>
                Date: ${date}
              </small>

              <small>
                Class: ${cls}
              </small>

              <small>
                Live availability will appear here
                after API integration.
              </small>

            `);

          }
        );

      return;
    }


    /* BETWEEN STATIONS */

    if (type === "between") {

      body.innerHTML = `

        <div class="rail-form-card">

          <label>
            From Station
          </label>

          <input
            id="railBetweenFrom"
            placeholder="From station"
          >


          <label>
            To Station
          </label>

          <input
            id="railBetweenTo"
            placeholder="To station"
          >


          <button
            class="rail-primary-btn"
            id="railBetweenCheck"
          >
            Find Trains
          </button>

        </div>


        <div
          id="railResult"
          class="rail-result"
        >
          Enter both stations.
        </div>

      `;


      $("#railBetweenCheck")
        ?.addEventListener(
          "click",
          () => {

            const from =
              $("#railBetweenFrom")
                ?.value.trim();

            const to =
              $("#railBetweenTo")
                ?.value.trim();


            if (!from || !to) {

              setResult(`

                <strong>
                  Enter both stations
                </strong>

              `);

              return;

            }


            setResult(`

              <strong>
                Trains Between Stations
              </strong>

              <span>
                ${from} → ${to}
              </span>

              <small>
                Matching trains will appear here
                after API integration.
              </small>

            `);

          }
        );

      return;
    }


    /* ARRIVAL / DEPARTURE */

    if (type === "arrival") {

      body.innerHTML = `

        <div class="rail-form-card">

          <label>
            Railway Station
          </label>

          <input
            id="railStation"
            placeholder="Enter station name"
          >


          <button
            class="rail-primary-btn"
            id="railArrivalCheck"
          >
            Check Timings
          </button>

        </div>


        <div
          id="railResult"
          class="rail-result"
        >
          Enter a railway station.
        </div>

      `;


      $("#railArrivalCheck")
        ?.addEventListener(
          "click",
          () => {

            const station =
              $("#railStation")
                ?.value.trim();


            if (!station) {

              setResult(`

                <strong>
                  Enter Station
                </strong>

              `);

              return;

            }


            setResult(`

              <strong>
                Station Timings
              </strong>

              <span>
                ${station}
              </span>

              <small>
                Live arrival and departure data
                will appear here after API integration.
              </small>

            `);

          }
        );

      return;
    }


    /* DELAY ALERTS */

    if (type === "delay") {

      body.innerHTML = `

        <div class="rail-form-card">

          <label>
            Train Number
          </label>

          <input
            id="railDelayTrain"
            type="text"
            inputmode="numeric"
            placeholder="Enter train number"
          >


          <button
            class="rail-primary-btn"
            id="railDelayCheck"
          >
            Check Delay
          </button>

        </div>


        <div
          id="railResult"
          class="rail-result"
        >
          Enter a train number.
        </div>

      `;


      $("#railDelayCheck")
        ?.addEventListener(
          "click",
          () => {

            const number =
              $("#railDelayTrain")
                ?.value.trim();


            if (!number) {

              setResult(`

                <strong>
                  Enter Train Number
                </strong>

              `);

              return;

            }


            setResult(`

              <strong>
                Delay Status
              </strong>

              <span>
                Train ${number}
              </span>

              <small>
                Live delay information will appear
                here after API integration.
              </small>

            `);

          }
        );

    }

  }


  /* ==========================================
     RAIL BUTTON INTERCEPTOR
  ========================================== */

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "#railPanel .tool.cyan[data-tool]"
        );


      if (!button) return;


      const tool =
        button.dataset.tool;


      if (!TOOLS[tool]) return;


      event.preventDefault();

      event.stopImmediatePropagation();


      openRailTool(tool);

    },
    true
  );


  /* ==========================================
     STYLES
  ========================================== */

  function injectStyles() {

    if (
      $("#nexusRailV3Styles")
    ) return;


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "nexusRailV3Styles";


    style.textContent = `

      #nexusRailToolScreen {

        margin-top: 14px;

        padding: 15px;

        border:
          1px solid
          rgba(255,255,255,.08);

        border-radius: 17px;

        background:
          linear-gradient(
            145deg,
            rgba(0,210,240,.045),
            rgba(120,80,255,.035)
          );

      }


      .nexus-rail-tool-head {

        display: flex;

        align-items: flex-start;

        gap: 12px;

        margin-bottom: 14px;

      }


      .nexus-rail-back {

        width: 38px;

        height: 38px;

        flex-shrink: 0
        border:
          1px solid
          rgba(255,255,255,.08);

        border-radius: 11px;

        background:
          rgba(255,255,255,.035);

        color: #fff;

        font-size: 20px;

      }


      .nexus-rail-tool-head h3 {

        margin:
          5px 0 3px;

        color:
          #eaf8ff;

        font-size:
          17px;

      }


      .nexus-rail-tool-head p {

        margin: 0;

        color:
          #718198;

        font-size:
          9px;

      }


      .rail-form-card {

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
          14px;

        background:
          rgba(0,0,0,.12);

      }


      .rail-form-card label {

        margin-top:
          3px;

        color:
          #8ca0b7;

        font-size:
          9px;

      }


      .rail-form-card input,

      .rail-form-card select {

        width:
          100%;

        height:
          43px;

        box-sizing:
          border-box;

        padding:
          0 11px;

        border:
          1px solid
          rgba(255,255,255,.08);

        border-radius:
          10px;

        outline:
          none;

        background:
          #071120;

        color:
          #fff;

        font-size:
          10px;

      }


      .rail-form-card input:focus,

      .rail-form-card select:focus {

        border-color:
          rgba(0,210,240,.5);

      }


      .rail-primary-btn {

        width:
          100%;

        min-height:
          43px;

        margin-top:
          5px;

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
          800;

      }


      .rail-result {

        display:
          flex;

        flex-direction:
          column;

        gap:
          6px;

        margin-top:
          10px;

        padding:
          14px;

        border:
          1px solid
          rgba(255,255,255,.06);

        border-radius:
          13px;

        background:
          rgba(255,255,255,.025);

        color:
          #9eb0c4;

        font-size:
          9px;

        line-height:
          1.5;

      }


      .rail-result strong {

        color:
          #eaf8ff;

        font-size:
          11px;

      }


      .rail-result span {

        color:
          #a9bbcf;

      }


      .rail-result small {

        color:
          #65788f;

        font-size:
          8px;

      }


      @media (max-width: 520px) {

        #nexusRailToolScreen {

          padding:
            13px;

        }

      }

    `;


    document.head.appendChild(
      style
    );

  }


  /* ==========================================
     INITIALIZE
  ========================================== */

  function init() {

    injectStyles();

    console.log(
      "NEXUS Rail Mode V3 loaded."
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
