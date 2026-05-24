/**
 * Big Bros Sandwhich — Landing Page Scripts
 * Beginner-friendly: each section handles one feature.
 */

/* ---------- Mobile hamburger menu ---------- */
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const navLinks = document.querySelectorAll(".nav__link");
const header = document.getElementById("header");

// Guard: only run if navbar elements exist (avoids console errors)
if (navToggle && navMenu) {
  /**
   * Opens or closes the mobile navigation menu
   */
  function toggleMenu() {
    const isOpen = navMenu.classList.toggle("nav__menu--open");
    navToggle.classList.toggle("nav__toggle--active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  /**
   * Closes the menu (used when a link is clicked)
   */
  function closeMenu() {
    navMenu.classList.remove("nav__menu--open");
    navToggle.classList.remove("nav__toggle--active");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
  }

  navToggle.addEventListener("click", toggleMenu);

  navLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
}

/* ---------- Sticky navbar shadow on scroll ---------- */
if (header) {
  window.addEventListener("scroll", () => {
    header.classList.toggle("header--scrolled", window.scrollY > 20);
  });
}

/* ---------- Active nav link highlight ---------- */
const sections = document.querySelectorAll("section[id]");

function setActiveLink() {
  if (!sections.length || !navLinks.length) return;

  const scrollY = window.scrollY + 100;
  let currentId = sections[0].getAttribute("id");

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      currentId = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle("nav__link--active", href === `#${currentId}`);
  });
}

window.addEventListener("scroll", setActiveLink);
setActiveLink();

/* ---------- Menu category filters ---------- */
const menuFilters = document.querySelectorAll(".menu__filter");
const menuCards = document.querySelectorAll(".menu-card");

if (menuFilters.length && menuCards.length) {
  menuFilters.forEach((filterBtn) => {
    filterBtn.addEventListener("click", () => {
      const category = filterBtn.getAttribute("data-filter");

      // Update active pill style
      menuFilters.forEach((btn) => {
        const isActive = btn === filterBtn;
        btn.classList.toggle("menu__filter--active", isActive);
        btn.setAttribute("aria-selected", String(isActive));
      });

      // Show or hide cards based on data-category
      menuCards.forEach((card) => {
        const cardCategory = card.getAttribute("data-category");
        const showCard = category === "all" || cardCategory === category;
        card.classList.toggle("menu-card--hidden", !showCard);
      });
    });
  });
}

/* ---------- Order form: menu dropdowns (built from Menu section) ---------- */
const orderForm = document.getElementById("order-form");
const orderAddressGroup = document.getElementById("order-address-group");
const orderAddressInput = document.getElementById("order-address");
const orderTypeInputs = document.querySelectorAll('input[name="order-type"]');
const orderMessage = document.getElementById("order-message");
const orderItemsList = document.getElementById("order-items-list");
const orderAddItemBtn = document.getElementById("order-add-item");
const orderTotalEl = document.getElementById("order-total");

/** Category labels for dropdown groups — keys match data-category on menu cards */
const MENU_CATEGORY_LABELS = {
  sandwiches: "Sandwiches",
  melts: "Melts",
  sides: "Sides",
  drinks: "Drinks",
};

/**
 * Reads every .menu-card on the page and returns menu data for dropdowns.
 * When you add a new item to the Menu section, it appears here automatically.
 */
function getMenuItemsFromPage() {
  const cards = document.querySelectorAll(".menu-card");
  const items = [];

  cards.forEach((card) => {
    const nameEl = card.querySelector(".menu-card__name");
    const priceEl = card.querySelector(".menu-card__price");
    if (!nameEl || !priceEl) return;

    const name = nameEl.textContent.trim();
    const priceText = priceEl.textContent.trim();
    const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;
    const category = card.getAttribute("data-category") || "other";
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    items.push({ id, name, price, priceText, category });
  });

  return items;
}

/** HTML <option> list grouped by category (Sandwiches, Melts, etc.) */
function buildMenuOptionsHTML(menuItems) {
  const placeholder = '<option value="">Choose an item...</option>';
  const grouped = {};

  menuItems.forEach((item) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  let html = placeholder;

  Object.keys(MENU_CATEGORY_LABELS).forEach((categoryKey) => {
    const groupItems = grouped[categoryKey];
    if (!groupItems?.length) return;

    const label = MENU_CATEGORY_LABELS[categoryKey];
    html += `<optgroup label="${label}">`;

    groupItems.forEach((item) => {
      html += `<option value="${item.id}" data-price="${item.price}">${item.name} — ${item.priceText}</option>`;
    });

    html += "</optgroup>";
  });

  return html;
}

/** Put menu options into one item dropdown */
function fillItemSelect(selectEl, menuItems, selectedId = "") {
  if (!selectEl) return;
  selectEl.innerHTML = buildMenuOptionsHTML(menuItems);
  if (selectedId) selectEl.value = selectedId;
}

/** Update estimated total from all selected rows */
function updateOrderTotal() {
  if (!orderTotalEl || !orderItemsList) return;

  let total = 0;

  orderItemsList.querySelectorAll(".order__item-row").forEach((row) => {
    const select = row.querySelector(".order__item-select");
    const qty = row.querySelector(".order__item-qty");
    const option = select?.selectedOptions[0];
    const price = parseFloat(option?.getAttribute("data-price") || "0");
    const count = parseInt(qty?.value || "1", 10);

    if (select?.value && price) {
      total += price * count;
    }
  });

  orderTotalEl.textContent = `$${total.toFixed(2)}`;
}

/** Show remove button only when there is more than one row */
function updateOrderItemRows() {
  if (!orderItemsList) return;

  const rows = orderItemsList.querySelectorAll(".order__item-row");

  rows.forEach((row, index) => {
    const removeBtn = row.querySelector(".order__item-remove");
    if (removeBtn) removeBtn.hidden = rows.length <= 1;
  });

  updateOrderTotal();
}

/** HTML for one order item row (menu dropdown + quantity) */
function createOrderItemRowHTML(menuOptionsHTML) {
  return `
    <select class="form__input form__select order__item-select" aria-label="Menu item" data-order-item-select required>
      ${menuOptionsHTML}
    </select>
    <select class="form__input form__select order__item-qty" aria-label="Quantity" data-order-qty-select>
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
      <option value="5">5</option>
    </select>
    <button type="button" class="order__item-remove" aria-label="Remove item">&times;</button>
  `;
}

/** Wire events on a new order item row */
function bindOrderItemRow(row) {
  row.querySelector(".order__item-select")?.addEventListener("change", updateOrderTotal);
  row.querySelector(".order__item-qty")?.addEventListener("change", updateOrderTotal);
  row.querySelector(".order__item-remove")?.addEventListener("click", () => {
    row.remove();
    updateOrderItemRows();
  });
}

/** Add a new menu item + quantity row */
function addOrderItemRow(menuItems, selectedId = "") {
  if (!orderItemsList) return;

  const row = document.createElement("div");
  row.className = "order__item-row";
  row.innerHTML = createOrderItemRowHTML(buildMenuOptionsHTML(menuItems));

  const select = row.querySelector(".order__item-select");
  fillItemSelect(select, menuItems, selectedId);

  bindOrderItemRow(row);
  orderItemsList.appendChild(row);
  updateOrderItemRows();
}

/** Wire up order item dropdowns */
function initOrderMenuDropdowns() {
  if (!orderItemsList) return;

  const menuItems = getMenuItemsFromPage();
  if (!menuItems.length) return;

  const firstSelect = orderItemsList.querySelector(".order__item-select");
  fillItemSelect(firstSelect, menuItems);

  orderItemsList.querySelectorAll(".order__item-select").forEach((select) => {
    select.addEventListener("change", updateOrderTotal);
  });

  orderItemsList.querySelectorAll(".order__item-qty").forEach((qty) => {
    qty.addEventListener("change", updateOrderTotal);
  });

  const firstRemove = orderItemsList.querySelector(".order__item-remove");
  if (firstRemove) {
    firstRemove.addEventListener("click", () => {
      const rows = orderItemsList.querySelectorAll(".order__item-row");
      if (rows.length > 1) {
        firstRemove.closest(".order__item-row")?.remove();
        updateOrderItemRows();
      }
    });
  }

  if (orderAddItemBtn) {
    orderAddItemBtn.addEventListener("click", () => addOrderItemRow(menuItems));
  }

  /* "Add to order" on menu cards — scroll to form and pre-select that item */
  document.querySelectorAll(".menu-card__btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const card = btn.closest(".menu-card");
      const name = card?.querySelector(".menu-card__name")?.textContent.trim();
      if (!name) return;

      const item = menuItems.find((m) => m.name === name);
      if (!item) return;

      const firstRow = orderItemsList.querySelector(".order__item-row");
      const firstSelect = firstRow?.querySelector(".order__item-select");

      if (firstSelect && !firstSelect.value) {
        firstSelect.value = item.id;
      } else {
        addOrderItemRow(menuItems, item.id);
      }

      updateOrderTotal();
    });
  });

  updateOrderItemRows();
}

initOrderMenuDropdowns();

/* ---------- Order form: delivery address toggle ---------- */
function toggleDeliveryAddress() {
  const isDelivery = document.querySelector('input[name="order-type"]:checked')?.value === "delivery";

  if (orderAddressGroup && orderAddressInput) {
    orderAddressGroup.classList.toggle("form__group--hidden", !isDelivery);
    orderAddressInput.required = isDelivery;
    if (!isDelivery) orderAddressInput.value = "";
  }
}

orderTypeInputs.forEach((input) => {
  input.addEventListener("change", toggleDeliveryAddress);
});
toggleDeliveryAddress();

/** Reset order rows back to a single empty dropdown */
function resetOrderItems() {
  if (!orderItemsList) return;

  const menuItems = getMenuItemsFromPage();
  orderItemsList.innerHTML = "";

  const row = document.createElement("div");
  row.className = "order__item-row";
  row.innerHTML = createOrderItemRowHTML(buildMenuOptionsHTML(menuItems));

  bindOrderItemRow(row);
  orderItemsList.appendChild(row);
  updateOrderItemRows();
}

/* ---------- Formspree: send forms to your email ---------- */
function getFormspreeId(configKey) {
  const config = window.FORMSPREE_CONFIG || {};
  const id = config[configKey];
  if (!id || String(id).startsWith("YOUR_")) return null;
  return id;
}

async function submitToFormspree(form, configKey, messageEl, successText, afterSuccess) {
  const formId = getFormspreeId(configKey);

  if (!formId) {
    messageEl.textContent = "Add your Formspree form ID in formspree-config.js";
    messageEl.className = "form__message form__message--error";
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalLabel = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";

  try {
    const response = await fetch(`https://formspree.io/f/${formId}`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok) {
      messageEl.textContent = successText;
      messageEl.className = "form__message form__message--success";
      form.reset();
      if (afterSuccess) afterSuccess();
      return;
    }

    throw new Error(data.error || "Could not send. Please try again.");
  } catch (error) {
    messageEl.textContent = error.message || "Could not send. Please try again.";
    messageEl.className = "form__message form__message--error";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalLabel;
  }
}

/** Build readable order lines for the Formspree email */
function buildOrderSummaryText() {
  if (!orderItemsList) return "";

  const lines = [];
  orderItemsList.querySelectorAll(".order__item-row").forEach((row) => {
    const select = row.querySelector(".order__item-select");
    const qty = row.querySelector(".order__item-qty");

    if (select?.value) {
      lines.push(`${qty?.value || 1}x ${select.selectedOptions[0].textContent}`);
    }
  });

  return lines.join("\n");
}

/** Copy dropdown order into hidden fields before submit */
function syncOrderHiddenFields() {
  const summaryField = document.getElementById("order-summary-field");
  const totalField = document.getElementById("order-total-field");

  if (summaryField) summaryField.value = buildOrderSummaryText();
  if (totalField && orderTotalEl) totalField.value = orderTotalEl.textContent;
}

/* ---------- Order form submit → Formspree ---------- */
if (orderForm && orderMessage) {
  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const hasItem = [...orderItemsList.querySelectorAll(".order__item-select")].some(
      (select) => select.value !== ""
    );

    if (!hasItem) {
      orderMessage.textContent = "Please choose at least one menu item.";
      orderMessage.className = "form__message form__message--error";
      return;
    }

    if (!orderForm.checkValidity()) {
      orderForm.reportValidity();
      return;
    }

    syncOrderHiddenFields();

    await submitToFormspree(
      orderForm,
      "order",
      orderMessage,
      "Thanks! Your order was received. We'll text you shortly to confirm.",
      () => {
        resetOrderItems();
        toggleDeliveryAddress();
      }
    );
  });
}

/* ---------- Contact form submit → Formspree ---------- */
const contactForm = document.getElementById("contact-form");
const contactMessageEl = document.getElementById("contact-form-message");

if (contactForm && contactMessageEl) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    await submitToFormspree(
      contactForm,
      "contact",
      contactMessageEl,
      "Message sent! We'll get back to you within 24 hours."
    );
  });
}
