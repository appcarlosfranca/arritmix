// =========================
// ELEMENTOS
// =========================
const monthsContainer = document.getElementById("monthsContainer");
const modal = document.getElementById("modal");

let showOutsideMonths = false;
let editing = null;

const months = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];

let data = {};
let income = 0;

// =========================
// TEMA
// =========================
function toggleTheme() {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "financeFlowTheme",
    document.body.classList.contains("light") ? "light" : "dark"
  );
}

// =========================
// MODAL AUX
// =========================
function handlePaymentType() {
  const type = expenseType.value;
  expenseCard.classList.toggle("hidden", type !== "parcelado");
  expenseInstallments.classList.toggle("hidden", type !== "parcelado");
}

function handlePayer() {
  otherPayer.classList.toggle("hidden", expensePayer.value !== "Outro");
}

expenseCard.addEventListener("change", () => {
  otherCard.classList.toggle("hidden", expenseCard.value !== "Outro");
});

// =========================
// GERAR MESES (CORRIGIDO)
// =========================
function generateMonths() {
  monthsContainer.innerHTML = "";

  const now = new Date();

  for (let i = -12; i <= 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const key = `${months[d.getMonth()]}-${d.getFullYear()}`;

    if (!Array.isArray(data[key])) data[key] = [];

    const card = document.createElement("div");
    card.className = "month-card";

    const isOutside = i < 0 || i > 11;
    if (isOutside && !showOutsideMonths) {
      card.classList.add("hidden");
    }

    card.innerHTML = `
      <h3>${key}</h3>
      <button onclick="exportMonthToPDF('${key}')">PDF</button>
      <button onclick="clearMonth('${key}')">Limpar</button>

      ${data[key].map((e, idx) => `
        <div class="expense-item">
          ${e.type} | R$ ${e.value.toFixed(2)}<br>
          <small>${e.card || "-"} • ${e.payer}</small><br>
          <button onclick="editExpense('${key}', ${idx})">Editar</button>
          <button onclick="deleteExpense('${key}', ${idx})">Excluir</button>
        </div>
      `).join("")}
    `;

    monthsContainer.appendChild(card);
  }

  updateTopSummary();
}

// =========================
// TOGGLE MESES
// =========================
function toggleHiddenMonths() {
  showOutsideMonths = !showOutsideMonths;
  document.querySelectorAll(".month-card").forEach(card => {
    card.classList.toggle("hidden");
  });
  generateMonths();
}

// =========================
// MODAL
// =========================
function openModal() {
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  editing = null;
  document.querySelectorAll("#modal input").forEach(i => i.value = "");
}

// =========================
// SALVAR LANÇAMENTO
// =========================
function saveExpense() {
  const value = parseFloat(expenseValue.value);
  if (isNaN(value)) return alert("Valor inválido");

  const type = expenseType.value;
  const payer = expensePayer.value === "Outro" ? otherPayer.value : expensePayer.value;
  const card = expenseCard.value === "Outro" ? otherCard.value : expenseCard.value;
  const installments = parseInt(expenseInstallments.value) || 1;
  const month = expenseMonth.value;
  const year = new Date().getFullYear();

  if (editing) {
    data[editing.key][editing.index] = { value, type, payer, card };
  } else if (type === "parcelado") {
    const base = months.indexOf(month);
    const part = value / installments;

    for (let i = 0; i < installments; i++) {
      const m = months[(base + i) % 12];
      const y = year + Math.floor((base + i) / 12);
      const key = `${m}-${y}`;
      if (!Array.isArray(data[key])) data[key] = [];
      data[key].push({ value: part, type, payer, card });
    }
  } else if (type === "recorrente") {
    for (let i = 0; i < 12; i++) {
      const d = new Date(year, months.indexOf(month) + i, 1);
      const key = `${months[d.getMonth()]}-${d.getFullYear()}`;
      if (!Array.isArray(data[key])) data[key] = [];
      data[key].push({ value, type, payer, card });
    }
  } else {
    const key = `${month}-${year}`;
    if (!Array.isArray(data[key])) data[key] = [];
    data[key].push({ value, type, payer, card });
  }

  saveToLocalStorage();
  generateMonths();
  closeModal();
}

// =========================
// EDITAR / EXCLUIR
// =========================
function editExpense(key, index) {
  const e = data[key][index];
  expenseValue.value = e.value;
  expenseType.value = e.type;
  expensePayer.value = e.payer;
  expenseCard.value = e.card || "";
  editing = { key, index };
  openModal();
}

function deleteExpense(key, index) {
  data[key].splice(index, 1);
  saveToLocalStorage();
  generateMonths();
}

function clearMonth(key) {
  if (confirm("Excluir todos os lançamentos deste mês?")) {
    data[key] = [];
    saveToLocalStorage();
    generateMonths();
  }
}

// =========================
// PDF
// =========================
function exportMonthToPDF(key) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;

  doc.text(`CAPITAL 79 - ${key}`, 10, y);
  y += 10;

  data[key].forEach(e => {
    doc.text(`${e.type} - R$ ${e.value.toFixed(2)} (${e.payer})`, 10, y);
    y += 6;
  });

  doc.save(`CAPITAL79_${key}.pdf`);
}

// =========================
// TOPO
// =========================
function updateTopSummary() {
  income = parseFloat(totalIncome.value) || 0;

  const now = new Date();
  const key = `${months[now.getMonth()]}-${now.getFullYear()}`;
  const total = (data[key] || []).reduce((s, e) => s + e.value, 0);

  currentExpense.innerText = `R$ ${total.toFixed(2)}`;
  balance.innerText = `R$ ${(income - total).toFixed(2)}`;
}

// =========================
// STORAGE
// =========================
function saveToLocalStorage() {
  localStorage.setItem("financeFlowData", JSON.stringify(data));
  localStorage.setItem("financeFlowIncome", totalIncome.value);
}

function loadFromLocalStorage() {
  const d = localStorage.getItem("financeFlowData");
  if (d) data = JSON.parse(d);

  const inc = localStorage.getItem("financeFlowIncome");
  if (inc) {
    totalIncome.value = inc;
    income = parseFloat(inc) || 0;
  }

  if (localStorage.getItem("financeFlowTheme") === "light") {
    document.body.classList.add("light");
  }
}

// =========================
// INIT
// =========================
loadFromLocalStorage();
generateMonths();
updateTopSummary();
