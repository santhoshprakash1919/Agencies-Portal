// ---------- PRODUCT CATALOG ----------

const productCatalog = {
    "MTR Foods": [
      "BADAM MIX",
      "PAYASAM MIX",
      "LEMON RICE POWDER",
      "GULAB JAMUN MIX",
      "TOMATO RICE POWDER"
    ],
    "Oshan Chocolates": [
      "Cursh waffer biscuit",
      "Bisco candy",
      "Gems candy",
      "Pop up lollipop",
      "Cycle race candy"
    ],
    "Suriyan Lamp Oil": [
      "200 ml bottle",
      "500 ml bottle",
      "100 ml bottle",
      "500 ml bottle",
      "500 ml pouch"
    ],
    "Ganesh Atta": [
      "Regular Atta (bulk bag)"
    ]
  };
  
  const MIN_BULK_QTY = 5;
  const STORAGE_KEY = "sindhu_agencies_orders";
  let editingOrderId = null;
  
  // ---------- STORAGE (CRUD) ----------
  
  function loadOrders() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse orders from storage", e);
      return [];
    }
  }
  
  function saveOrders(orders) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }
  
  // ---------- PRODUCTS PAGE ----------
  
  function initProductsPage() {
    const container = document.getElementById("product-sections");
    if (!container) return;
  
    const wrapper = document.createElement("div");
    wrapper.className = "product-grid";
  
    Object.entries(productCatalog).forEach(([brand, items]) => {
      const card = document.createElement("section");
      card.className = "card";
  
      const pill = document.createElement("div");
      pill.className = "pill";
      pill.textContent = "Wholesale";
  
      const h3 = document.createElement("h3");
      h3.textContent = brand;
  
      const ul = document.createElement("ul");
      items.forEach((name) => {
        const li = document.createElement("li");
        li.textContent = name;
        ul.appendChild(li);
      });
  
      const cta = document.createElement("div");
      const btn = document.createElement("a");
      btn.href = "order.html";
      btn.className = "btn btn-outline btn-sm";
      btn.textContent = "Place bulk order";
      cta.appendChild(btn);
  
      card.appendChild(pill);
      card.appendChild(h3);
      card.appendChild(ul);
      card.appendChild(cta);
      wrapper.appendChild(card);
    });
  
    container.appendChild(wrapper);
  }
  
  // ---------- ORDER PAGE (FORM + CRUD) ----------
  
  function initOrderPage() {
    const form = document.getElementById("order-form");
    if (!form) return;
  
    buildOrderForm(form);
    renderOrdersTable();
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      handleOrderSubmit();
    });
  }
  
  function buildOrderForm(form) {
    form.innerHTML = "";
  
    // Customer details
    const customerCard = document.createElement("div");
    customerCard.className = "form-card";
    const customerTitle = document.createElement("h2");
    customerTitle.className = "section-title";
    customerTitle.textContent = "Bulk Order Details";
    const customerSub = document.createElement("p");
    customerSub.className = "section-subtitle";
    customerSub.textContent = "Orders are accepted only in bulk quantities.";
  
    const grid = document.createElement("div");
    grid.className = "form-grid";
  
    const fields = [
      { id: "agencyName", label: "Agency Name", required: true },
      { id: "contactPerson", label: "Contact Person", required: true },
      { id: "phone", label: "Phone Number", required: true },
      { id: "email", label: "Email", required: false }
    ];
  
    fields.forEach((f) => {
      const group = document.createElement("div");
      group.className = "form-group";
      const label = document.createElement("label");
      label.htmlFor = f.id;
      label.textContent = f.label + (f.required ? " *" : "");
      const input = document.createElement("input");
      input.type = "text";
      input.id = f.id;
      input.required = !!f.required;
      group.appendChild(label);
      group.appendChild(input);
      grid.appendChild(group);
    });
  
    const commentsGroup = document.createElement("div");
    commentsGroup.className = "form-group";
    const commentsLabel = document.createElement("label");
    commentsLabel.htmlFor = "comments";
    commentsLabel.textContent = "Special Instructions";
    const commentsTa = document.createElement("textarea");
    commentsTa.id = "comments";
    commentsGroup.appendChild(commentsLabel);
    commentsGroup.appendChild(commentsTa);
  
    customerCard.appendChild(customerTitle);
    customerCard.appendChild(customerSub);
    customerCard.appendChild(grid);
    customerCard.appendChild(commentsGroup);
  
    // Product groups
    const productsCard = document.createElement("div");
    productsCard.className = "form-card";
    const pTitle = document.createElement("h3");
    pTitle.className = "section-title";
    pTitle.textContent = "Select Products (Bulk Only)";
    const pSub = document.createElement("p");
    pSub.className = "section-subtitle";
    pSub.textContent = `Enter quantities (minimum ${MIN_BULK_QTY} units for each selected item). Leave blank if you don't want that item.`;
  
    productsCard.appendChild(pTitle);
    productsCard.appendChild(pSub);
  
    Object.entries(productCatalog).forEach(([brand, items]) => {
      const group = document.createElement("section");
      group.className = "brand-group";
  
      const title = document.createElement("div");
      title.className = "brand-group-title";
      title.textContent = brand;
  
      const subtitle = document.createElement("div");
      subtitle.className = "brand-group-sub";
      subtitle.textContent = "Enter quantity in units / packs";
  
      const qtyGrid = document.createElement("div");
      qtyGrid.className = "quantity-grid";
  
      items.forEach((name) => {
        const itemRow = document.createElement("div");
        itemRow.className = "quantity-item";
  
        const label = document.createElement("span");
        label.textContent = name;
  
        const input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.step = "1";
        input.placeholder = "0";
        input.className = "qty-input";
        input.dataset.brand = brand;
        input.dataset.product = name;
  
        itemRow.appendChild(label);
        itemRow.appendChild(input);
        qtyGrid.appendChild(itemRow);
      });
  
      group.appendChild(title);
      group.appendChild(subtitle);
      group.appendChild(qtyGrid);
      productsCard.appendChild(group);
    });
  
    const notice = document.createElement("div");
    notice.className = "notice";
    notice.textContent = `Note: Orders with any item below ${MIN_BULK_QTY} units will not be accepted.`;
  
    const errorBox = document.getElementById("order-error");
    if (errorBox) errorBox.textContent = "";
  
    const actions = document.createElement("div");
    actions.style.marginTop = "1rem";
    actions.style.display = "flex";
    actions.style.gap = "0.75rem";
    const submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className = "btn btn-primary";
    submitBtn.id = "submit-btn";
    submitBtn.textContent = "Save Bulk Order & Download PDF";
    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "btn btn-outline";
    resetBtn.textContent = "Reset Form";
    resetBtn.addEventListener("click", () => resetForm());
  
    actions.appendChild(submitBtn);
    actions.appendChild(resetBtn);
  
    productsCard.appendChild(notice);
    productsCard.appendChild(actions);
  
    form.appendChild(customerCard);
    form.appendChild(productsCard);
  }
  
  // ---------- SUBMIT / VALIDATION ----------
  
  function handleOrderSubmit() {
    const errorBox = document.getElementById("order-error");
    if (errorBox) errorBox.textContent = "";
  
    const agencyName = document.getElementById("agencyName").value.trim();
    const contactPerson = document.getElementById("contactPerson").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const comments = document.getElementById("comments").value.trim();
  
    if (!agencyName || !contactPerson || !phone) {
      if (errorBox) {
        errorBox.textContent = "Please fill in all required customer details (*).";
      }
      return;
    }
  
    const qtyInputs = Array.from(document.querySelectorAll(".qty-input"));
    const items = [];
    let invalidQty = false;
  
    qtyInputs.forEach((input) => {
      const raw = input.value.trim();
      if (!raw) return;
      const qty = Number(raw);
      if (!Number.isFinite(qty) || qty < MIN_BULK_QTY) {
        invalidQty = true;
        input.classList.add("input-error");
      } else {
        input.classList.remove("input-error");
        items.push({
          brand: input.dataset.brand,
          product: input.dataset.product,
          quantity: qty
        });
      }
    });
  
    if (invalidQty) {
      if (errorBox) {
        errorBox.textContent = `Each selected item must be at least ${MIN_BULK_QTY} units.`;
      }
      return;
    }
  
    if (items.length === 0) {
      if (errorBox) {
        errorBox.textContent = "Please enter a bulk quantity for at least one product.";
      }
      return;
    }
  
    const order = {
      id: editingOrderId || "ORD-" + Date.now(),
      createdAt: new Date().toISOString(),
      agencyName,
      contactPerson,
      phone,
      email,
      comments,
      items
    };
  
    const orders = loadOrders();
  
    if (editingOrderId) {
      const idx = orders.findIndex((o) => o.id === editingOrderId);
      if (idx !== -1) orders[idx] = order;
    } else {
      orders.push(order);
    }
  
    saveOrders(orders);
    renderOrdersTable();
    downloadOrderPdf(order); // ONLY PDF, no email
    resetForm();
  }
  
  // ---------- CRUD TABLE ----------
  
  function renderOrdersTable() {
    const container = document.getElementById("orders-list");
    if (!container) return;
  
    const orders = loadOrders();
    container.innerHTML = "";
  
    if (orders.length === 0) {
      const msg = document.createElement("div");
      msg.className = "notice";
      msg.textContent = "No bulk orders saved yet. Create one using the form above.";
      container.appendChild(msg);
      return;
    }
  
    const wrapper = document.createElement("div");
    wrapper.className = "table-wrapper";
  
    const table = document.createElement("table");
    table.className = "orders-table";
  
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Order ID</th>
        <th>Customer</th>
        <th>Items</th>
        <th>Created</th>
        <th>Actions</th>
      </tr>
    `;
    table.appendChild(thead);
  
    const tbody = document.createElement("tbody");
  
    orders.forEach((order) => {
      const tr = document.createElement("tr");
  
      const tdId = document.createElement("td");
      tdId.textContent = order.id;
  
      const tdCustomer = document.createElement("td");
      tdCustomer.innerHTML = `
        <strong>${order.agencyName}</strong><br/>
        ${order.contactPerson}<br/>
        <span class="badge">${order.phone}</span>
      `;
  
      const tdItems = document.createElement("td");
      tdItems.innerHTML = order.items
        .map(
          (i) =>
            `<div>${i.brand} – ${i.product}: <strong>${i.quantity}</strong></div>`
        )
        .join("");
  
      const tdDate = document.createElement("td");
      const date = new Date(order.createdAt);
      tdDate.textContent = date.toLocaleString();
  
      const tdActions = document.createElement("td");
      tdActions.className = "actions-cell";
  
      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-outline btn-sm";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => loadOrderIntoForm(order.id));
  
      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-danger btn-sm";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => deleteOrder(order.id));
  
      tdActions.appendChild(editBtn);
      tdActions.appendChild(delBtn);
  
      tr.appendChild(tdId);
      tr.appendChild(tdCustomer);
      tr.appendChild(tdItems);
      tr.appendChild(tdDate);
      tr.appendChild(tdActions);
  
      tbody.appendChild(tr);
    });
  
    table.appendChild(tbody);
    wrapper.appendChild(table);
    container.appendChild(wrapper);
  }
  
  function loadOrderIntoForm(orderId) {
    const orders = loadOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
  
    editingOrderId = orderId;
  
    document.getElementById("agencyName").value = order.agencyName || "";
    document.getElementById("contactPerson").value = order.contactPerson || "";
    document.getElementById("phone").value = order.phone || "";
    document.getElementById("email").value = order.email || "";
    document.getElementById("comments").value = order.comments || "";
  
    const qtyInputs = Array.from(document.querySelectorAll(".qty-input"));
    qtyInputs.forEach((input) => {
      input.value = "";
    });
  
    order.items.forEach((item) => {
      const match = qtyInputs.find(
        (input) =>
          input.dataset.brand === item.brand &&
          input.dataset.product === item.product
      );
      if (match) match.value = item.quantity;
    });
  
    const btn = document.getElementById("submit-btn");
    if (btn) btn.textContent = "Update Order & Download PDF";
  
    const errorBox = document.getElementById("order-error");
    if (errorBox) errorBox.textContent = "Editing existing order. Update quantities and save.";
  }
  
  function deleteOrder(orderId) {
    if (!confirm("Delete this order permanently?")) return;
    const orders = loadOrders().filter((o) => o.id !== orderId);
    saveOrders(orders);
    renderOrdersTable();
    resetForm();
  }
  
  function resetForm() {
    const form = document.getElementById("order-form");
    if (!form) return;
    form.reset();
    editingOrderId = null;
    const btn = document.getElementById("submit-btn");
    if (btn) btn.textContent = "Save Bulk Order & Download PDF";
    const errorBox = document.getElementById("order-error");
    if (errorBox) errorBox.textContent = "";
    document
      .querySelectorAll(".qty-input")
      .forEach((input) => input.classList.remove("input-error"));
  }
  
  // ---------- PDF ONLY (NO EMAIL) ----------
  
  function buildOrderSummary(order) {
    const lines = [];
    lines.push("Sindhu Agencies - Bulk Order");
    lines.push("------------------------------------");
    lines.push(`Order ID: ${order.id}`);
    lines.push(`Agency Name: ${order.agencyName}`);
    lines.push(`Contact Person: ${order.contactPerson}`);
    lines.push(`Phone: ${order.phone}`);
    if (order.email) lines.push(`Email: ${order.email}`);
    lines.push("");
    lines.push("Items:");
    order.items.forEach((item) => {
      lines.push(`- ${item.brand} | ${item.product} : ${item.quantity} units`);
    });
    if (order.comments) {
      lines.push("");
      lines.push("Special Instructions:");
      lines.push(order.comments);
    }
    lines.push("");
    lines.push("Location: Kaveripattinam, Krishnagiri District");
    lines.push("Note: This order is for wholesale/bulk supply only.");
    return lines.join("\n");
  }
  
  async function downloadOrderPdf(order) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
  
    const lines = buildOrderSummary(order).split("\n");
  
    let x = 10;
    let y = 15;
    const lineHeight = 7;
    const maxWidth = 180;
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
  
    lines.forEach((line) => {
      const splitted = doc.splitTextToSize(line, maxWidth);
      splitted.forEach((l) => {
        if (y > 280) {
          doc.addPage();
          y = 15;
        }
        doc.text(l, x, y);
        y += lineHeight;
      });
    });
  
    const fileName = `${order.id || "sindhu-order"}.pdf`;
    doc.save(fileName);
    alert("A PDF copy of your bulk order has been downloaded.");
  }
  
  // ---------- INIT ----------
  
  document.addEventListener("DOMContentLoaded", () => {
    initProductsPage();
    initOrderPage();
  });