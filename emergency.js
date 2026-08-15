/* ==========================================
   NEXUS EMERGENCY MODE
   Trusted Emergency Contacts
========================================== */

(() => {
  "use strict";

  const STORAGE_KEY = "nexusEmergencyContacts";

  const $ = (selector, root = document) =>
    root.querySelector(selector);


  /* =========================
     STORAGE
  ========================= */

  function getContacts() {
    try {
      return JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );
    } catch {
      return [];
    }
  }


  function saveContacts(contacts) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        contacts.slice(0, 5)
      )
    );
  }


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

    clearTimeout(
      window.nexusEmergencyToastTimer
    );

    window.nexusEmergencyToastTimer =
      setTimeout(() => {
        toast.classList.remove("show");
      }, 2200);
  }


  /* =========================
     SECURITY
  ========================= */

  function escapeHTML(value) {

    return String(value).replace(
      /[&<>"']/g,
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[character])
    );

  }


  /* =========================
     STYLES
  ========================= */

  function injectStyles() {

    if ($("#nexusEmergencyStyles")) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "nexusEmergencyStyles";

    style.textContent = `

      #nexusEmergencyContacts {
        margin-top: 16px;
      }

      .nexus-contact-box {
        padding: 17px;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 16px;
        background: rgba(255,255,255,.025);
      }

      .nexus-contact-head h3 {
        margin: 7px 0 4px;
        font-size: 15px;
      }

      .nexus-contact-head p {
        margin: 0 0 14px;
        color: #78849c;
        font-size: 10px;
      }

      .nexus-contact-form {
        display: grid;
        grid-template-columns:
          1fr 1fr auto;
        gap: 8px;
      }

      .nexus-contact-form input {
        min-width: 0;
        min-height: 42px;
        padding: 0 11px;

        border: 1px solid
          rgba(255,255,255,.08);

        border-radius: 10px;

        outline: none;

        background: #091226;
        color: #fff;

        font-size: 10px;
      }

      .nexus-contact-form input:focus {
        border-color:
          rgba(255,90,110,.5);
      }

      .nexus-contact-form button {
        min-height: 42px;
        padding: 0 13px;

        border: 0;
        border-radius: 10px;

        background:
          linear-gradient(
            135deg,
            #c53c55,
            #8c3bd1
          );

        color: #fff;

        font-size: 9px;
        font-weight: 800;
      }

      .nexus-contact-list {
        display: grid;
        gap: 7px;
        margin-top: 10px;
      }

      .nexus-contact-row {
        display: flex;
        align-items: center;
        justify-content: space-between;

        gap: 10px;

        padding: 11px;

        border: 1px solid
          rgba(255,255,255,.06);

        border-radius: 11px;

        background:
          rgba(255,255,255,.02);
      }

      .nexus-contact-info strong {
        display: block;
        color: #e4e9f5;
        font-size: 10px;
      }

      .nexus-contact-info small {
        display: block;
        margin-top: 4px;
        color: #78849c;
        font-size: 9px;
      }

      .nexus-contact-actions {
        display: flex;
        gap: 6px;
      }

      .nexus-contact-actions button {
        padding: 7px 9px;

        border: 1px solid
          rgba(255,255,255,.08);

        border-radius: 8px;

        background:
          rgba(255,255,255,.04);

        color: #c8d1e2;

        font-size: 8px;
      }

      .nexus-contact-actions
      button:first-child {
        color: #ff8494;
      }

      .nexus-empty-contact {
        padding: 12px;

        text-align: center;

        color: #657189;

        font-size: 9px;
      }

      @media (max-width: 650px) {

        .nexus-contact-form {
          grid-template-columns: 1fr;
        }

        .nexus-contact-form button {
          width: 100%;
        }

      }

    `;

    document.head.appendChild(style);
  }


  /* =========================
     RENDER CONTACTS
  ========================= */

  function renderContacts() {

    const list =
      $("#nexusContactList");

    if (!list) return;

    const contacts =
      getContacts();


    if (!contacts.length) {

      list.innerHTML = `
        <div class="nexus-empty-contact">
          No trusted contacts saved yet.
        </div>
      `;

      return;
    }


    list.innerHTML =
      contacts.map(
        (contact, index) => `

        <div class="nexus-contact-row">

          <div class="nexus-contact-info">

            <strong>
              ${escapeHTML(contact.name)}
            </strong>

            <small>
              ${escapeHTML(contact.phone)}
            </small>

          </div>


          <div class="nexus-contact-actions">

            <button
              type="button"
              data-contact-call="${index}"
            >
              Call
            </button>

            <button
              type="button"
              data-contact-delete="${index}"
            >
              Delete
            </button>

          </div>

        </div>

      `
      ).join("");


    /* CALL */

    list
      .querySelectorAll(
        "[data-contact-call]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const contact =
              getContacts()[
                Number(
                  button.dataset.contactCall
                )
              ];

            if (!contact) return;

            showToast(
              "Opening call: " +
              contact.name
            );

            setTimeout(() => {

              window.location.href =
                "tel:" +
                contact.phone.replace(
                  /[^\d+]/g,
                  ""
                );

            }, 250);

          }
        );

      });


    /* DELETE */

    list
      .querySelectorAll(
        "[data-contact-delete]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const contacts =
              getContacts();

            const index =
              Number(
                button.dataset.contactDelete
              );

            if (!contacts[index]) {
              return;
            }

            const name =
              contacts[index].name;

            contacts.splice(index, 1);

            saveContacts(contacts);

            renderContacts();

            showToast(
              name + " removed"
            );

          }
        );

      });

  }


  /* =========================
     FORM
  ========================= */

  function setupForm() {

    const form =
      $("#nexusContactForm");

    if (!form) return;

    if (form.dataset.ready === "1") {
      return;
    }

    form.dataset.ready = "1";


    form.addEventListener(
      "submit",
      event => {

        event.preventDefault();


        const nameInput =
          $("#nexusContactName");

        const phoneInput =
          $("#nexusContactPhone");


        const name =
          nameInput.value.trim();

        const phone =
          phoneInput.value.trim();


        const normalizedPhone =
          phone.replace(
            /[^\d+]/g,
            ""
          );


        if (!name || !phone) {

          showToast(
            "Enter contact name and phone number"
          );

          return;
        }


        if (
          normalizedPhone.length < 7
        ) {

          showToast(
            "Enter a valid phone number"
          );

          return;
        }


        const contacts =
          getContacts();


        if (contacts.length >= 5) {

          showToast(
            "Maximum 5 trusted contacts allowed"
          );

          return;
        }


        contacts.push({

          name: name,

          phone: normalizedPhone

        });


        saveContacts(contacts);


        nameInput.value = "";

        phoneInput.value = "";


        renderContacts();


        showToast(
          "Emergency contact saved"
        );

      }
    );

  }


  /* =========================
     MOUNT UI
  ========================= */

  function mountEmergencyContacts() {

    const panel =
      $("#emergencyPanel");

    if (!panel) return;


    if (
      $("#nexusEmergencyContacts")
    ) {

      renderContacts();
      setupForm();

      return;
    }


    const section =
      document.createElement("div");

    section.id =
      "nexusEmergencyContacts";


    section.innerHTML = `

      <div class="nexus-contact-box">

        <div class="nexus-contact-head">

          <span class="panel-label red">
            TRUSTED CONTACTS
          </span>

          <h3>
            Emergency Contacts
          </h3>

          <p>
            Save up to 5 people you trust.
          </p>

        </div>


        <form
          id="nexusContactForm"
          class="nexus-contact-form"
        >

          <input
            id="nexusContactName"
            type="text"
            maxlength="40"
            placeholder="Contact name"
            autocomplete="name"
            required
          >


          <input
            id="nexusContactPhone"
            type="tel"
            maxlength="15"
            inputmode="tel"
            placeholder="Phone number"
            autocomplete="tel"
            required
          >


          <button type="submit">
            + Add Contact
          </button>

        </form>


        <div
          id="nexusContactList"
          class="nexus-contact-list"
        ></div>

      </div>

    `;


    const note =
      $(".safety-note", panel);


    if (note) {

      note.before(section);

    } else {

      panel.appendChild(section);

    }


    renderContacts();

    setupForm();

  }


  /* =========================
     INITIALIZE
  ========================= */

  function init() {

    injectStyles();


    document
      .querySelectorAll(
        '[data-open="emergencyPanel"]'
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            setTimeout(
              mountEmergencyContacts,
              60
            );

          }
        );

      });


    const panel =
      $("#emergencyPanel");


    if (panel) {

      const observer =
        new MutationObserver(
          () => {

            if (
              panel.classList.contains(
                "open"
              )
            ) {

              mountEmergencyContacts();

            }

          }
        );


      observer.observe(
        panel,
        {
          attributes: true,
          attributeFilter: ["class"]
        }
      );

    }


    mountEmergencyContacts();

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
