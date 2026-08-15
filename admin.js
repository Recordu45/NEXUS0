const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];


/* =========================
   TOAST
========================= */

function adminToast(message) {
  const toast = $("#adminToast");

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(window.nexusAdminToast);

  window.nexusAdminToast = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}


/* =========================
   SIDEBAR NAVIGATION
========================= */

const navButtons = $$(".admin-nav button");
const sections = $$(".admin-section");

navButtons.forEach((button) => {

  button.addEventListener("click", () => {

    const targetId = button.dataset.section;

    if (!targetId) return;

    navButtons.forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    sections.forEach((section) => {
      section.classList.remove("active");
    });

    const target = document.getElementById(targetId);

    if (target) {
      target.classList.add("active");
    }

    document
      .querySelector(".sidebar")
      ?.classList.remove("open");

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  });

});


/* =========================
   MOBILE SIDEBAR
========================= */

$("#mobileMenu")?.addEventListener("click", () => {

  document
    .querySelector(".sidebar")
    ?.classList.toggle("open");

});


/* =========================
   ADMIN SEARCH
========================= */

$("#adminSearch")?.addEventListener("input", (event) => {

  const query =
    event.target.value
      .trim()
      .toLowerCase();

  navButtons.forEach((button) => {

    const text =
      button.textContent
        .trim()
        .toLowerCase();

    button.style.display =
      !query || text.includes(query)
        ? "flex"
        : "none";

  });

});


/* =========================
   NOTIFICATION
========================= */

$("#adminNotification")?.addEventListener(
  "click",
  () => {

    adminToast(
      "No new admin notifications"
    );

  }
);


/* =========================
   REPORT DOWNLOAD
========================= */

$("#reportBtn")?.addEventListener(
  "click",
  () => {

    const report = `NEXUS ADMIN REPORT
====================

Generated:
${new Date().toLocaleString()}

Total Users:
25,689

Active Users:
18,432

Today's Active Users:
5,689

Total Searches:
1.25M

Top Modules:
1. Search
2. Bank Mode
3. Rail Mode
4. Emergency
5. Nearby

System Status:
App Server - Operational
Database - Operational
Rail API - Not Connected
Notifications - Operational

NEXUS v1.0.0
`;

    const blob = new Blob(
      [report],
      {
        type: "text/plain;charset=utf-8"
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "nexus-admin-report.txt";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    adminToast(
      "Report downloaded"
    );

  }
);


/* =========================
   QUICK ACTIONS
========================= */

$$("[data-action]").forEach((button) => {

  button.addEventListener("click", () => {

    const action =
      button.dataset.action;

    const sectionsMap = {

      announcement: "announcements",
      notification: "notifications",
      users: "users",
      reports: "analytics"

    };

    const sectionId =
      sectionsMap[action];

    if (!sectionId) return;

    const targetButton =
      document.querySelector(
        `[data-section="${sectionId}"]`
      );

    if (targetButton) {
      targetButton.click();
    }

  });

});


/* =========================
   ANNOUNCEMENT
========================= */

$("#publishAnnouncement")?.addEventListener(
  "click",
  () => {

    const title =
      $("#announcementTitle")?.value.trim();

    const message =
      $("#announcementMessage")?.value.trim();

    if (!title || !message) {

      adminToast(
        "Enter both title and message"
      );

      return;

    }

    const announcements =
      JSON.parse(
        localStorage.getItem(
          "nexusAnnouncements"
        ) || "[]"
      );

    announcements.unshift({

      title: title,
      message: message,

      createdAt:
        new Date().toLocaleString()

    });

    localStorage.setItem(
      "nexusAnnouncements",
      JSON.stringify(
        announcements.slice(0, 20)
      )
    );

    $("#announcementTitle").value = "";

    $("#announcementMessage").value = "";

    adminToast(
      "Announcement saved locally"
    );

  }
);


/* =========================
   NOTIFICATION
========================= */

$("#sendNotification")?.addEventListener(
  "click",
  () => {

    const title =
      $("#notificationTitle")?.value.trim();

    const message =
      $("#notificationMessage")?.value.trim();

    if (!title || !message) {

      adminToast(
        "Enter both title and message"
      );

      return;

    }

    const notifications =
      JSON.parse(
        localStorage.getItem(
          "nexusNotifications"
        ) || "[]"
      );

    notifications.unshift({

      title: title,
      message: message,

      createdAt:
        new Date().toLocaleString()

    });

    localStorage.setItem(
      "nexusNotifications",
      JSON.stringify(
        notifications.slice(0, 20)
      )
    );

    $("#notificationTitle").value = "";

    $("#notificationMessage").value = "";

    adminToast(
      "Notification saved locally"
    );

  }
);


/* =========================
   MODULE ON / OFF
========================= */

$$(".module-admin-card .switch input")
  .forEach((toggle) => {

    toggle.addEventListener(
      "change",
      () => {

        const card =
          toggle.closest(
            ".module-admin-card"
          );

        const name =
          card
            ?.querySelector("h3")
            ?.textContent
            .trim();

        if (!name) return;

        const settings =
          JSON.parse(
            localStorage.getItem(
              "nexusModules"
            ) || "{}"
          );

        settings[name] =
          toggle.checked;

        localStorage.setItem(
          "nexusModules",
          JSON.stringify(settings)
        );

        adminToast(
          `${name} ${
            toggle.checked
              ? "enabled"
              : "disabled"
          }`
        );

      }
    );

  });


/* =========================
   LOAD MODULE STATES
========================= */

function loadModuleStates() {

  const settings =
    JSON.parse(
      localStorage.getItem(
        "nexusModules"
      ) || "{}"
    );

  $$(".module-admin-card")
    .forEach((card) => {

      const name =
        card
          .querySelector("h3")
          ?.textContent
          .trim();

      const toggle =
        card.querySelector(
          ".switch input"
        );

      if (
        name &&
        toggle &&
        Object.prototype.hasOwnProperty.call(
          settings,
          name
        )
      ) {

        toggle.checked =
          Boolean(settings[name]);

      }

    });

}


/* =========================
   SYSTEM SETTINGS
========================= */

$$(".settings-card .switch input")
  .forEach((toggle) => {

    toggle.addEventListener(
      "change",
      () => {

        const row =
          toggle.closest(
            ".setting-row"
          );

        const name =
          row
            ?.querySelector("b")
            ?.textContent
            .trim();

        if (!name) return;

        const settings =
          JSON.parse(
            localStorage.getItem(
              "nexusSystemSettings"
            ) || "{}"
          );

        settings[name] =
          toggle.checked;

        localStorage.setItem(
          "nexusSystemSettings",
          JSON.stringify(settings)
        );

        adminToast(
          `${name}: ${
            toggle.checked
              ? "ON"
              : "OFF"
          }`
        );

      }
    );

  });


/* =========================
   USER VIEW BUTTONS
========================= */

$$(".table-btn").forEach((button) => {

  button.addEventListener("click", () => {

    const row =
      button.closest("tr");

    const user =
      row
        ?.querySelector("td")
        ?.textContent
        .trim();

    adminToast(
      `Opening ${user || "user"}`
    );

  });

});


/* =========================
   ROLE BUTTONS
========================= */

$$(".role-card button").forEach((button) => {

  button.addEventListener("click", () => {

    const role =
      button
        .closest(".role-card")
        ?.querySelector("h3")
        ?.textContent
        .trim();

    adminToast(
      `${role || "Role"} permissions selected`
    );

  });

});


/* =========================
   LEGAL CARDS
========================= */

$$(".legal-card").forEach((button) => {

  button.addEventListener("click", () => {

    const title =
      button
        .querySelector("b")
        ?.textContent
        .trim();

    adminToast(
      `${title || "Legal section"} will be connected next`
    );

  });

});


/* =========================
   START
========================= */

loadModuleStates();

console.log(
  "NEXUS Admin Panel initialized."
);
