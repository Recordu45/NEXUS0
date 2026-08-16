/* ==========================================
   NEXUS RAIL MODE V2
   Functional Rail Tools
========================================== */

(() => {
  "use strict";

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const RAIL_URLS = {
    pnr:
      "https://www.indianrail.gov.in/enquiry/PNR/PnrEnquiry.html?locale=en",

    seat:
      "https://www.indianrail.gov.in/enquiry/SEAT/SeatAvailability.html?locale=en",

    train:
      "https://www.indianrail.gov.in/enquiry/TrainSchedule.html?locale=en",

    arrival:
      "https://www.indianrail.gov.in/enquiry/TrainArrDep.html?locale=en"
  };

  const SEARCHES = {
    "Train Search":
      "Indian Railways train search",

    "Live Train Status":
      "Indian Railways live train status",

    "Train Route":
      "Indian Railways train route",

    "Between Stations":
      "Indian Railways trains between stations",

    "Delay Alerts":
      "Indian Railways train delay status"
  };


  /* =========================
     TOAST
  ========================= */

  function toast(message) {

    if (typeof window.toast === "function") {
      window.toast(message);
      return;
    }

    const element = $("#toast");

    if (!element) return;

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(
      window.nexusRailToastTimer
    );

    window.nexusRailToastTimer =
      setTimeout(() => {
        element.classList.remove("show");
      }, 2200);
  }


  /* =========================
     ACTIVITY
  ========================= */

  function saveRailActivity(title) {

    try {

      const current =
        JSON.parse(
          localStorage.getItem(
            "nexusActivity"
          ) || "[]"
        );


      current.unshift({

        title: String(title),

        subtitle:
          "Opened in Rail Mode",

        time:
          new Date().toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit"
            }
          )

      });


      localStorage.setItem(
        "nexusActivity",
        JSON.stringify(
          current.slice(0, 8)
        )
      );

    } catch (_) {}

  }


  /* =========================
     OPEN URL
  ========================= */

  function openUrl(url) {

    if (!url) return;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

  }


  /* =========================
     GOOGLE SEARCH
  ========================= */

  function openSearch(query) {

    openUrl(
      "https://www.google.com/search?q=" +
      encodeURIComponent(query)
    );

  }


  /* =========================
     RAIL TOOL HANDLER
  ========================= */

  function handleRailTool(tool) {

    if (!tool) return;


    saveRailActivity(tool);


    switch (tool) {

      case "PNR Status":

        toast(
          "Opening official PNR enquiry..."
        );

        openUrl(
          RAIL_URLS.pnr
        );

        break;


      case "Seat Availability":

        toast(
          "Opening official seat availability..."
        );

        openUrl(
          RAIL_URLS.seat
        );

        break;


      case "Train Search":

        toast(
          "Opening train search..."
        );

        openSearch(
          SEARCHES[tool]
        );

        break;


      case "Live Train Status":

        toast(
          "Opening live train status..."
        );

        openSearch(
          SEARCHES[tool]
        );

        break;


      case "Train Route":

        toast(
          "Opening train route search..."
        );

        openSearch(
          SEARCHES[tool]
        );

        break;


      case "Between Stations":

        toast(
          "Opening trains between stations..."
        );

        openSearch(
          SEARCHES[tool]
        );

        break;


      case "Arrival / Departure":

        toast(
          "Opening arrival / departure enquiry..."
        );

        openUrl(
          RAIL_URLS.arrival
        );

        break;


      case "Delay Alerts":

        toast(
          "Opening train delay search..."
        );

        openSearch(
          SEARCHES[tool]
        );

        break;


      default:

        toast(
          tool +
          " is being prepared"
        );

    }

  }


  /* =========================
     FIX ORIGINAL RAIL BUTTONS
  ========================= */

  document.addEventListener(
    "click",
    event => {

      const button =
        event.target.closest(
          "#railPanel .tool.cyan[data-tool]"
        );


      if (!button) return;


      /*
        app.js ka generic handler
        Rail button se pehle hi stop.
      */

      event.preventDefault();

      event.stopImmediatePropagation();


      handleRailTool(
        button.dataset.tool
      );

    },
    true
  );


  /* =========================
     PNR QUICK BOX
  ========================= */

  function createRailQuickBox() {

    const panel =
      $("#railPanel");


    if (!panel) return;


    if (
      $("#nexusRailQuickBox")
    ) return;


    const box =
      document.createElement(
        "div"
      );


    box.id =
      "nexusRailQuickBox";


    box.innerHTML = `

      <div class="nexus-rail-quick-title">

        <span class="panel-label cyan">
          RAIL QUICK ACCESS
        </span>

        <h3>
          Where Is My Train?
        </h3>

        <p>
          Enter your 10-digit PNR to
          open the official enquiry.
        </p>

      </div>


      <div class="nexus-rail-pnr-row">

        <input
          id="nexusRailPNR"
          type="text"
          inputmode="numeric"
          maxlength="10"
          placeholder="Enter 10 digit PNR"
          autocomplete="off"
        >


        <button
          id="nexusRailPNRBtn"
          type="button"
        >
          Check PNR
        </button>

      </div>


      <div
        id="nexusRailPNRStatus"
        class="nexus-rail-pnr-status"
      >
        Ready.
      </div>

    `;


    const hero =
      $(".train-hero", panel);


    const tools =
      $(".tool-grid", panel);


    if (hero) {

      hero.after(box);

    } else if (tools) {

      tools.before(box);

    } else {

      panel.appendChild(box);

    }


    const input =
      $("#nexusRailPNR");


    const button =
      $("#nexusRailPNRBtn");


    const status =
      $("#nexusRailPNRStatus");


    input?.addEventListener(
      "input",
      () => {

        input.value =
          input.value
            .replace(
              /\D/g,
              ""
            )
            .slice(0, 10);

      }
    );


    function checkPNR() {

      const pnr =
        input?.value.trim() || "";


      if (
        !/^\d{10}$/.test(pnr)
      ) {

        if (status) {

          status.textContent =
            "Please enter exactly 10 digits.";

        }

        toast(
          "Enter a valid 10 digit PNR"
        );

        input?.focus();

        return;

      }


      if (status) {

        status.textContent =
          "Opening official PNR enquiry...";

      }


      saveRailActivity(
        "PNR Status"
      );


      openUrl(
        RAIL_URLS.pnr
      );

    }


    button?.addEventListener(
      "click",
      checkPNR
    );


    input?.addEventListener(
      "keydown",
      event => {

        if (
          event.key === "Enter"
        ) {

          event.preventDefault();

          checkPNR();

        }

      }
    );

  }


  /* =========================
     STYLES
  ========================= */

  function injectStyles() {

    if (
      $("#nexusRailV2Styles")
    ) return;


    const style =
      document.createElement(
        "style"
      );


    style.id =
      "nexusRailV2Styles";


    style.textContent = `

      #nexusRailQuickBox {

        margin: 12px 0;

        padding: 15px;

        border:
          1px solid
          rgba(255,255,255,.07);

        border-radius: 15px;

        background:
          rgba(0,210,240,.035);

      }


      .nexus-rail-quick-title h3 {

        margin:
          7px 0 4px;

        color:
          #e7f8ff;

        font-size:
          16px;

      }


      .nexus-rail-quick-title p {

        margin:
          0 0 12px;

        color:
          #718198;

        font-size:
          9px;

      }


      .nexus-rail-pnr-row {

        display:
          grid;

        grid-template-columns:
          1fr auto;

        gap:
          8px;

      }


      .nexus-rail-pnr-row input {

        min-width:
          0;

        height:
          42px;

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


      .nexus-rail-pnr-row button {

        height:
          42px;

        padding:
          0 13px;

        border:
          0;

        border-radius:
          10px;

        background:
          linear-gradient(
            135deg,
            #00b9dc,
            #477cff
          );

        color:
          #fff;

        font-size:
          9px;

        font-weight:
          800;

      }


      .nexus-rail-pnr-status {

        margin-top:
          7px;

        color:
          #6f8298;

        font-size:
          8px;

      }


      @media (max-width: 520px) {

        .nexus-rail-pnr-row {

          grid-template-columns:
            1fr;

        }

      }

    `;


    document.head.appendChild(
      style
    );

  }


  /* =========================
     INIT
  ========================= */

  function init() {

    injectStyles();

    createRailQuickBox();

    console.log(
      "NEXUS Rail Mode V2 initialized."
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
