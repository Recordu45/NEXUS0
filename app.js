const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function toast(message) {
  const element = $("#toast");

  if (!element) return;

  element.textContent = message;
  element.classList.add("show");

  clearTimeout(window.nexusToastTimer);

  window.nexusToastTimer = setTimeout(() => {
    element.classList.remove("show");
  }, 2200);
}


/* =========================
   PANELS
========================= */

function openPanel(id) {
  $$(".panel").forEach((panel) => {
    panel.classList.remove("open");
  });

  const panel = document.getElementById(id);

  if (!panel) return;

  panel.classList.add("open");

  setTimeout(() => {
    panel.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 50);
}

$$("[data-open]").forEach((button) => {
  button.addEventListener("click", () => {
    openPanel(button.dataset.open);
  });
});

$$(".close-panel").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = button.closest(".panel");

    if (panel) {
      panel.classList.remove("open");
    }
  });
});


/* =========================
   GLOBAL SEARCH
========================= */

$("#searchForm")?.addEventListener("submit", (event) => {
  event.preventDefault();

  const query = $("#globalSearch")?.value.trim();

  if (!query) {
    toast("Type something to search");
    return;
  }

  saveActivity("Search", query);

  const url =
    "https://www.google.com/search?q=" +
    encodeURIComponent(query);

  window.open(url, "_blank", "noopener,noreferrer");
});


/* =========================
   SEARCH PANEL
========================= */

$("#panelSearchForm")?.addEventListener("submit", (event) => {
  event.preventDefault();

  const input = $("#panelSearch");

  if (!input) return;

  const query = input.value.trim();

  if (!query) {
    toast("Type something to search");
    return;
  }

  saveActivity("Search", query);

  const url =
    "https://www.google.com/search?q=" +
    encodeURIComponent(query);

  window.open(url, "_blank", "noopener,noreferrer");
});


/* =========================
   SEARCH CHIPS
========================= */

$$("[data-query]").forEach((button) => {
  button.addEventListener("click", () => {
    const query = button.dataset.query || "";

    const searchInput = $("#globalSearch");

    if (!searchInput) return;

    searchInput.value = query;
    searchInput.focus();
  });
});


/* =========================
   VOICE SEARCH
========================= */

$("#voiceBtn")?.addEventListener("click", () => {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    toast("Voice search is not supported in this browser");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    toast("Listening...");
  };

  recognition.onresult = (event) => {
    const text =
      event.results[0][0].transcript;

    const input = $("#globalSearch");

    if (input) {
      input.value = text;
      input.focus();
    }
  };

  recognition.onerror = () => {
    toast("Voice search could not start");
  };

  recognition.start();
});


/* =========================
   QUICK ACCESS
========================= */

$("#editQuick")?.addEventListener("click", () => {
  toast("Quick Access customization will be added in V1.1");
});


/* =========================
   NOTIFICATIONS
========================= */

$("#notifyBtn")?.addEventListener("click", () => {
  toast("No new notifications");
});


/* =========================
   MENU
========================= */

$("#menuBtn")?.addEventListener("click", () => {
  openPanel("morePanel");
});


/* =========================
   BANK / TOOLS
========================= */

$$("[data-tool]").forEach((button) => {
  button.addEventListener("click", () => {

    const tool = button.dataset.tool;

    if (!tool) return;

    saveActivity(
      tool,
      "Opened in NEXUS"
    );


    /* PNR */

    if (tool === "PNR Status") {

      window.open(
        "https://www.indianrail.gov.in/enquiry/PNR/PnrEnquiry.html?locale=en",
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }


    /* SEAT AVAILABILITY */

    if (tool === "Seat Availability") {

      window.open(
        "https://www.indianrail.gov.in/enquiry/SEAT/SeatAvailability.html?locale=en",
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }


    toast(tool + " selected");

  });
});


/* =========================
   NEARBY
========================= */

$$("[data-near]").forEach((button) => {

  button.addEventListener("click", () => {

    const place =
      button.dataset.near;

    if (!place) return;

    saveActivity(
      "Nearby",
      place
    );

    const url =
      "https://www.google.com/maps/search/" +
      encodeURIComponent(
        place + " near me"
      );

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

  });

});


/* =========================
   GOOGLE MAPS
========================= */

$("#mapBtn")?.addEventListener(
  "click",
  () => {

    window.open(
      "https://www.google.com/maps/",
      "_blank",
      "noopener,noreferrer"
    );

  }
);


/* =========================
   EMERGENCY CALL
========================= */

function callEmergency(number) {

  if (!number) return;

  toast(
    "Opening emergency call: " +
    number
  );

  setTimeout(() => {

    window.location.href =
      "tel:" + number;

  }, 350);

}


/* =========================
   SHARE LOCATION
========================= */

function shareLocation() {

  if (!navigator.geolocation) {

    toast(
      "Location is not available on this device"
    );

    return;

  }

  toast(
    "Requesting your location..."
  );

  navigator.geolocation.getCurrentPosition(

    async (position) => {

      const latitude =
        position.coords.latitude;

      const longitude =
        position.coords.longitude;

      const mapUrl =
        `https://www.google.com/maps?q=${latitude},${longitude}`;


      if (navigator.share) {

        try {

          await navigator.share({

            title:
              "NEXUS Emergency Location",

            text:
              "My current location:",

            url:
              mapUrl

          });

        } catch (error) {

          if (error.name !== "AbortError") {

            toast(
              "Location sharing was cancelled"
            );

          }

        }

        return;
      }


      window.open(
        mapUrl,
        "_blank",
        "noopener,noreferrer"
      );

    },

    () => {

      toast(
        "Location permission was not granted"
      );

    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

  );

}


/* =========================
   SOS SAFETY
========================= */

let sosTimer = null;
let sosPressed = false;

const sosButton =
  $("#sosBtn");

if (sosButton) {

  const startSOS = () => {

    if (sosPressed) return;

    sosPressed = true;

    toast(
      "Hold... preparing SOS"
    );

    sosTimer = setTimeout(() => {

      sosPressed = false;

      toast(
        "SOS confirmation ready. No call was placed automatically."
      );

    }, 3000);

  };


  const cancelSOS = () => {

    clearTimeout(sosTimer);

    if (sosPressed) {

      sosPressed = false;

      toast(
        "SOS cancelled"
      );

    }

  };


  sosButton.addEventListener(
    "pointerdown",
    startSOS
  );

  sosButton.addEventListener(
    "pointerup",
    cancelSOS
  );

  sosButton.addEventListener(
    "pointerleave",
    cancelSOS
  );

  sosButton.addEventListener(
    "pointercancel",
    cancelSOS
  );

}


/* =========================
   CONTACTS
========================= */

$("#addContact")?.addEventListener(
  "click",
  () => {

    toast(
      "Contact storage will be added with the account system"
    );

  }
);


/* =========================
   RECENT ACTIVITY
========================= */

function saveActivity(title, subtitle) {

  const current =
    JSON.parse(
      localStorage.getItem(
        "nexusActivity"
      ) || "[]"
    );


  current.unshift({

    title:
      String(title),

    subtitle:
      String(subtitle),

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


  renderActivity();

}


function renderActivity() {

  const list =
    $("#activityList");

  if (!list) return;


  const data =
    JSON.parse(
      localStorage.getItem(
        "nexusActivity"
      ) || "[]"
    );


  if (!data.length) return;


  list.innerHTML =
    data.map((item) => {

      return `
        <div class="activity-row">

          <span class="activity-badge search-b">
            ✦
          </span>

          <div>

            <b>
              ${escapeHTML(item.title)}
            </b>

            <small>
              ${escapeHTML(item.subtitle)}
            </small>

          </div>

          <time>
            ${escapeHTML(item.time)}
          </time>

        </div>
      `;

    }).join("");

}


$("#clearActivity")?.addEventListener(
  "click",
  () => {

    localStorage.removeItem(
      "nexusActivity"
    );

    renderDefaultActivity();

    toast(
      "Activity cleared"
    );

  }
);


function renderDefaultActivity() {

  const list =
    $("#activityList");

  if (!list) return;


  list.innerHTML = `

    <div class="activity-row">

      <span class="activity-badge rail-b">
        ▰
      </span>

      <div>

        <b>
          Rail Mode
        </b>

        <small>
          PNR / train tools ready
        </small>

      </div>

      <time>
        Today
      </time>

    </div>


    <div class="activity-row">

      <span class="activity-badge bank-b">
        ₹
      </span>

      <div>

        <b>
          EMI Calculator
        </b>

        <small>
          Ready for a new calculation
        </small>

      </div>

      <time>
        Yesterday
      </time>

    </div>


    <div class="activity-row">

      <span class="activity-badge search-b">
        ⌕
      </span>

      <div>

        <b>
          Search
        </b>

        <small>
          Web search opened
        </small>

      </div>

      <time>
        2 days ago
      </time>

    </div>

  `;

}


/* =========================
   HTML SECURITY
========================= */

function escapeHTML(value) {

  return String(value).replace(
    /[&<>"']/g,
    (character) => {

      const entities = {

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"

      };

      return entities[character];

    }
  );

}


/* =========================
   BOTTOM NAVIGATION
========================= */

$$("[data-scroll]").forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        const target =
          document.getElementById(
            button.dataset.scroll
          );

        if (!target) return;

        target.scrollIntoView({
          behavior: "smooth"
        });

      }
    );

  }
);


/* =========================
   NEXUS START
========================= */

renderActivity();

console.log(
  "NEXUS V1 initialized successfully."
);
