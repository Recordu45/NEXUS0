/* ==========================================
   NEXUS RAIL MODE V1
   Where Is My Train?
========================================== */

(() => {
  "use strict";

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  /* =========================
     TOAST
  ========================= */

  function showToast(message) {
    if (typeof window.toast === "function") {
      window.toast(message);
      return;
    }

    const toast = $("#toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.nexusRailToastTimer);

    window.nexusRailToastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }


  /* =========================
     OPEN OFFICIAL RAIL PAGE
  ========================= */

  function openRailPage(type) {

    const urls = {

      pnr:
        "https://www.indianrail.gov.in/enquiry/PNR/PnrEnquiry.html?locale=en",

      seat:
        "https://www.indianrail.gov.in/enquiry/SEAT/SeatAvailability.html?locale=en",

      train:
        "https://www.indianrail.gov.in/enquiry/TrainSchedule.html?locale=en",

      arrival:
        "https://www.indianrail.gov.in/enquiry/TrainArrDep.html?locale=en"

    };

    if (!urls[type]) {
      showToast("Rail tool is being prepared");
      return;
    }

    window.open(
      urls[type],
      "_blank",
      "noopener,noreferrer"
    );
  }


  /* =========================
     RAIL UI
  ========================= */

  function createRailInterface() {

    const panel = $("#railPanel");

    if (!panel) return;

    if ($("#nexusRailInterface")) return;


    const existingTools =
      $(".tool-grid", panel);

    if (!existingTools) return;


    const section =
      document.createElement("div");

    section.id =
      "nexusRailInterface";


    section.innerHTML = `

      <div class="nexus-rail-search">

        <div class="nexus-rail-title">

          <span class="panel-label cyan">
            WHERE IS MY TRAIN?
          </span>

          <h3>
            Railway Quick Access
          </h3>

          <p>
            Open railway services directly from NEXUS.
          </p>

        </div>


        <div class="nexus-pnr-box">

          <input
            id="nexusPNRInput"
            type="text"
            inputmode="numeric"
            maxlength="10"
            placeholder="Enter 10 digit PNR"
            autocomplete="off"
          >

          <button
            type="button"
            id="nexusPNRButton"
          >
            Check PNR
          </button>

        </div>


        <div class="nexus-rail-status"
             id="nexusRailStatus">

          Ready for railway search.

        </div>

      </div>


      <div class="nexus-rail-actions">

        <button
          type="button"
          data-rail-action="pnr"
        >
          <strong>
            PNR Status
          </strong>

          <small>
            Check booking status
          </small>
        </button>


        <button
          type="button"
          data-rail-action="train"
        >
          <strong>
            Train Search
          </strong>

          <small>
            Find train schedules
          </small>
        </button>


        <button
          type="button"
          data-rail-action="seat"
        >
          <strong>
            Seat Availability
          </strong>

          <small>
            Check available seats
          </small>
        </button>


        <button
          type="button"
          data-rail-action="arrival"
        >
          <strong>
            Arrival / Departure
          </strong>

          <small>
            Train timings
          </small>
        </button>


        <button
          type="button"
          data-rail-action="route"
        >
          <strong>
            Train Route
          </strong>

          <small>
            View route information
          </small>
        </button>


        <button
          type="button"
          data-rail-action="between"
        >
          <strong>
            Between Stations
          </strong>

          <small>
            Find trains between stations
          </small>
        </button>


        <button
          type="button"
          data-rail-action="live"
        >
          <strong>
            Live Train Status
          </strong>

          <small>
            Track your train
          </small>
        </button>


        <button
          type="button"
          data-rail-action="delay"
        >
          <strong>
            Delay Alerts
          </strong>

          <small>
            Check train delays
          </small>
        </button>

      </div>


      <div class="nexus-rail-note">

        <strong>
          Official Railway Services
        </strong>

        <span>
          NEXUS does not collect your PNR.
          Railway searches open through official
          railway services where available.
        </span>

      </div>

    `;


    existingTools.after(section);

    setupRailEvents();

  }


  /* =========================
     EVENTS
  ========================= */

  function setupRailEvents() {

    const pnrInput =
      $("#nexusPNRInput");

    const pnrButton =
      $("#nexusPNRButton");


    if (pnrButton) {

      pnrButton.addEventListener(
        "click",
        checkPNR
      );

    }


    if (pnrInput) {

      pnrInput.addEventListener(
        "input",
        () => {

          pnrInput.value =
            pnrInput.value.replace(
              /\D/g,
              ""
            ).slice(0, 10);

        }
      );


      pnrInput.addEventListener(
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


    $$(
      "[data-rail-action]"
    ).forEach(button => {

      button.addEventListener(
        "click",
        () => {

          handleRailAction(
            button.dataset.railAction
          );

        }
      );

    });

  }


  /* =========================
     PNR
  ========================= */

  function checkPNR() {

    const input =
      $("#nexusPNRInput");

    const status =
      $("#nexusRailStatus");


    if (!input) return;


    const pnr =
      input.value.trim();


    if (!/^\d{10}$/.test(pnr)) {

      showToast(
        "Enter a valid 10 digit PNR"
      );

      if (status) {

        status.textContent =
          "PNR must contain exactly 10 digits.";

      }

      input.focus();

      return;

    }


    if (status) {

      status.textContent =
        "Opening official PNR enquiry...";

    }


    showToast(
      "Opening PNR enquiry"
    );


    setTimeout(() => {

      openRailPage("pnr");

    }, 250);

  }


  /* =========================
     ACTION HANDLER
  ========================= */

  function handleRailAction(action) {

    switch (action) {

      case "pnr":

        openRailPage("pnr");

        break;


      case "train":

        openRailPage("train");

        break;


      case "seat":

        openRailPage("seat");

        break;


      case "arrival":

        openRailPage("arrival");

        break;


      case "route":

        openExternalSearch(
          "Indian Railways train route"
        );

        break;


      case "between":

        openExternalSearch(
          "Indian Railways trains between stations"
        );

        break;


      case "live":

        openExternalSearch(
          "Indian Railways live train status"
        );

        break;


      case "delay":

        openExternalSearch(
          "Indian Railways train delay status"
        );

        break;


      default:

        showToast(
          "Rail tool is being prepared"
        );

    }

  }


  /* =========================
     EXTERNAL SEARCH
  ========================= */

  function openExternalSearch(query) {

    const url =
      "https://www.google.com/search?q=" +
      encodeURIComponent(query);

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

  }


  /* =========================
     STYLES
  ========================= */

  function injectStyles() {

    if ($("#nexusRailStyles")) return;


    const style =
      document.createElement("style");

    style.id =
      "nexusRailStyles";


    style.textContent = `

      #nexusRailInterface {
        margin-top: 18px;
      }


      .nexus-rail-search {
        padding: 16px;

        border: 1px solid
          rgba(255,255,255,.07);

        border-radius: 16px;

        background:
          linear-gradient(
            135deg,
            rgba(0,220,255,.045),
            rgba(120,80,255,.035)
          );
      }


      .nexus-rail-title h3 {
        margin: 7px 0 4px;

        color: #e7f8ff;

        font-size: 16px;
      }


      .nexus-rail-title p {
        margin: 0 0 14px;

        color: #718198;

        font-size: 10px;
      }


      .nexus-pnr-box {
        display: grid;

        grid-template-columns:
          1fr auto;

        gap: 8px;
      }


      .nexus-pnr-box input {
        min-width: 0;

        height: 44px;

        padding: 0 12px;

        border: 1px solid
          rgba(255,255,255,.08);

        border-radius: 10px;

        outline: none;

        background: #071120;

        color: #fff;

        font-size: 11px;

        letter-spacing: .5px;
      }


      .nexus-pnr-box input:focus {
        border-color:
          rgba(0,220,255,.5);
      }


      .nexus-pnr-box button {
        height: 44px;

        padding: 0 15px;

        border: 0;

        border-radius: 10px;

        background:
          linear-gradient(
            135deg,
            #00b9dc,
            #477cff
          );

        color: #fff;

        font-size: 10px;

        font-weight: 800;
      }


      .nexus-rail-status {
        margin-top: 9px;

        color: #6f8298;

        font-size: 9px;
      }


      .nexus-rail-actions {
        display: grid;

        grid-template-columns:
          repeat(2, 1fr);

        gap: 8px;

        margin-top: 10px;
      }


      .nexus-rail-actions button {
        display: flex;

        flex-direction: column;

        align-items: flex-start;

        gap: 4px;

        min-height: 70px;

        padding: 12px;

        border: 1px solid
          rgba(255,255,255,.07);

        border-radius: 12px;

        background:
          rgba(255,255,255,.025);

        color: #dce7f4;

        text-align: left;

        transition:
          transform .15s ease,
          border-color .15s ease,
          background .15s ease;
      }


      .nexus-rail-actions button:active {
        transform: scale(.98);
      }


      .nexus-rail-actions button:hover {
        border-color:
          rgba(0,220,255,.35);

        background:
          rgba(0,220,255,.035);
      }


      .nexus-rail-actions strong {
        font-size: 10px;
      }


      .nexus-rail-actions small {
        color: #718198;

        font-size: 8px;

        line-height: 1.35;
      }


      .nexus-rail-note {
        display: flex;

        flex-direction: column;

        gap: 5px;

        margin-top: 12px;

        padding: 11px;

        border-radius: 10px;

        background:
          rgba(0,220,255,.025);
      }


      .nexus-rail-note strong {
        color: #8cecff;

        font-size: 9px;
      }


      .nexus-rail-note span {
        color: #66778d;

        font-size: 8px;

        line-height: 1.5;
      }


      @media (max-width: 520px) {

        .nexus-pnr-box {
          grid-template-columns: 1fr;
        }

        .nexus-pnr-box button {
          width: 100%;
        }

      }

    `;


    document.head.appendChild(style);

  }


  /* =========================
     INITIALIZE
  ========================= */

  function init() {

    injectStyles();


    const panel =
      $("#railPanel");


    if (!panel) return;


    createRailInterface();


    /* If panel opens dynamically,
       make sure UI remains available. */

    const observer =
      new MutationObserver(() => {

        if (
          panel.classList.contains(
            "open"
          )
        ) {

          createRailInterface();

        }

      });


    observer.observe(
      panel,
      {
        attributes: true,
        attributeFilter: ["class"]
      }
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
