const STORAGE_KEY = "expense-app-state-v1";

const categories = {
  expense: ["Food", "Rent", "Transport", "Bills", "Shopping", "Health", "Learning", "Travel", "Other"],
  income: ["Salary", "Freelance", "Gift", "Refund", "Investment", "Other"]
};

const defaultBudgets = {
  Food: 9000,
  Rent: 18000,
  Transport: 4500,
  Bills: 5500,
  Shopping: 7000,
  Learning: 3500,
  Health: 3500,
  Travel: 8000,
  Other: 4000
};

const demoTransactions = [
  { id: crypto.randomUUID(), title: "Internship stipend", amount: 28000, type: "income", category: "Salary", account: "Bank", date: "2026-05-01", note: "Monthly income" },
  { id: crypto.randomUUID(), title: "Freelance landing page", amount: 9500, type: "income", category: "Freelance", account: "UPI", date: "2026-05-07", note: "Client project" },
  { id: crypto.randomUUID(), title: "Room rent", amount: 14000, type: "expense", category: "Rent", account: "Bank", date: "2026-05-02", note: "Shared apartment" },
  { id: crypto.randomUUID(), title: "Groceries", amount: 2380, type: "expense", category: "Food", account: "UPI", date: "2026-05-04", note: "Weekly essentials" },
  { id: crypto.randomUUID(), title: "Metro pass", amount: 1100, type: "expense", category: "Transport", account: "Card", date: "2026-05-05", note: "Commute" },
  { id: crypto.randomUUID(), title: "Cloud hosting", amount: 799, type: "expense", category: "Learning", account: "Card", date: "2026-05-08", note: "Portfolio project" },
  { id: crypto.randomUUID(), title: "Electricity bill", amount: 1450, type: "expense", category: "Bills", account: "UPI", date: "2026-05-10", note: "Apartment utilities" },
  { id: crypto.randomUUID(), title: "Course subscription", amount: 2499, type: "expense", category: "Learning", account: "Card", date: "2026-05-11", note: "React practice" },
  { id: crypto.randomUUID(), title: "Weekend cafe", amount: 760, type: "expense", category: "Food", account: "UPI", date: "2026-05-14", note: "Friends" },
  { id: crypto.randomUUID(), title: "Medicine", amount: 620, type: "expense", category: "Health", account: "Cash", date: "2026-05-16", note: "Pharmacy" },
  { id: crypto.randomUUID(), title: "New backpack", amount: 1890, type: "expense", category: "Shopping", account: "Card", date: "2026-05-19", note: "College use" },
  { id: crypto.randomUUID(), title: "Bus tickets", amount: 2150, type: "expense", category: "Travel", account: "UPI", date: "2026-05-23", note: "Home visit" },
  { id: crypto.randomUUID(), title: "April freelance payout", amount: 7000, type: "income", category: "Freelance", account: "Bank", date: "2026-04-26", note: "Late payout" },
  { id: crypto.randomUUID(), title: "April groceries", amount: 4200, type: "expense", category: "Food", account: "UPI", date: "2026-04-16", note: "Monthly food" },
  { id: crypto.randomUUID(), title: "April rent", amount: 14000, type: "expense", category: "Rent", account: "Bank", date: "2026-04-02", note: "Shared apartment" }
];

const recurringBills = [
  { title: "Rent", amount: 14000, day: 2, category: "Rent" },
  { title: "Phone plan", amount: 299, day: 6, category: "Bills" },
  { title: "Internet", amount: 799, day: 12, category: "Bills" },
  { title: "Learning tools", amount: 999, day: 18, category: "Learning" }
];

let state = loadState();
let editingId = null;

const els = {
  form: document.querySelector("#transactionForm"),
  title: document.querySelector("#titleInput"),
  amount: document.querySelector("#amountInput"),
  type: document.querySelector("#typeInput"),
  category: document.querySelector("#categoryInput"),
  account: document.querySelector("#accountInput"),
  date: document.querySelector("#dateInput"),
  note: document.querySelector("#noteInput"),
  clearForm: document.querySelector("#clearFormBtn"),
  month: document.querySelector("#monthInput"),
  search: document.querySelector("#searchInput"),
  typeFilter: document.querySelector("#typeFilter"),
  categoryFilter: document.querySelector("#categoryFilter"),
  transactionList: document.querySelector("#transactionList"),
  budgetList: document.querySelector("#budgetList"),
  recurringList: document.querySelector("#recurringList"),
  insightsList: document.querySelector("#insightsList"),
  chart: document.querySelector("#trendChart"),
  seedDemo: document.querySelector("#seedDemoBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  importInput: document.querySelector("#importInput"),
  balanceValue: document.querySelector("#balanceValue"),
  incomeValue: document.querySelector("#incomeValue"),
  expenseValue: document.querySelector("#expenseValue"),
  savingsValue: document.querySelector("#savingsValue"),
  balanceNote: document.querySelector("#balanceNote"),
  incomeNote: document.querySelector("#incomeNote"),
  expenseNote: document.querySelector("#expenseNote"),
  savingsNote: document.querySelector("#savingsNote"),
  goalProgressLabel: document.querySelector("#goalProgressLabel"),
  goalProgressBar: document.querySelector("#goalProgressBar"),
  goalNote: document.querySelector("#goalNote"),
  emptyTemplate: document.querySelector("#emptyStateTemplate")
};

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return {
      transactions: demoTransactions,
      budgets: defaultBudgets,
      monthlySavingsGoal: 12000
    };
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : demoTransactions,
      budgets: parsed.budgets || defaultBudgets,
      monthlySavingsGoal: Number(parsed.monthlySavingsGoal) || 12000
    };
  } catch {
    return {
      transactions: demoTransactions,
      budgets: defaultBudgets,
      monthlySavingsGoal: 12000
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function parseMonth(dateString) {
  return dateString.slice(0, 7);
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getSelectedMonth() {
  return els.month.value || currentMonth();
}

function monthLabel(month) {
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(`${month}-01T00:00:00`));
}

function transactionsForMonth(month) {
  return state.transactions.filter((transaction) => parseMonth(transaction.date) === month);
}

function sumTransactions(transactions, type) {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
}

function groupByCategory(transactions) {
  return transactions.reduce((groups, transaction) => {
    groups[transaction.category] = (groups[transaction.category] || 0) + Number(transaction.amount);
    return groups;
  }, {});
}

function populateCategoryOptions() {
  const selectedType = els.type.value;
  els.category.innerHTML = categories[selectedType]
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");

  const allCategories = [...new Set([...categories.expense, ...categories.income])].sort();
  els.categoryFilter.innerHTML = `<option value="all">All categories</option>${allCategories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("")}`;
}

function populateMonths() {
  const months = [...new Set(state.transactions.map((transaction) => parseMonth(transaction.date)))].sort().reverse();
  const activeMonth = els.month.value || (months.includes(currentMonth()) ? currentMonth() : months[0]) || currentMonth();
  els.month.innerHTML = months.length
    ? months.map((month) => `<option value="${month}">${monthLabel(month)}</option>`).join("")
    : `<option value="${currentMonth()}">${monthLabel(currentMonth())}</option>`;
  els.month.value = months.includes(activeMonth) ? activeMonth : els.month.options[0].value;
}

function resetForm() {
  editingId = null;
  els.form.reset();
  els.date.value = new Date().toISOString().slice(0, 10);
  els.type.value = "expense";
  populateCategoryOptions();
  els.form.querySelector(".primary-btn").textContent = "Add transaction";
}

function renderStats() {
  const month = getSelectedMonth();
  const monthTransactions = transactionsForMonth(month);
  const allIncome = sumTransactions(state.transactions, "income");
  const allExpenses = sumTransactions(state.transactions, "expense");
  const income = sumTransactions(monthTransactions, "income");
  const expenses = sumTransactions(monthTransactions, "expense");
  const balance = allIncome - allExpenses;
  const savings = income - expenses;
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

  els.balanceValue.textContent = formatCurrency(balance);
  els.incomeValue.textContent = formatCurrency(income);
  els.expenseValue.textContent = formatCurrency(expenses);
  els.savingsValue.textContent = `${Math.max(savingsRate, 0)}%`;
  els.balanceNote.textContent = `${state.transactions.length} total transactions`;
  els.incomeNote.textContent = monthLabel(month);
  els.expenseNote.textContent = `${monthTransactions.filter((item) => item.type === "expense").length} expenses`;
  els.savingsNote.textContent = savingsRate >= 30 ? "Excellent momentum" : "Try to reach 30%";

  const goalPercent = state.monthlySavingsGoal > 0 ? Math.max(0, Math.min(100, Math.round((savings / state.monthlySavingsGoal) * 100))) : 0;
  els.goalProgressLabel.textContent = `${goalPercent}%`;
  els.goalProgressBar.style.width = `${goalPercent}%`;
  els.goalNote.textContent = `${formatCurrency(Math.max(savings, 0))} saved toward ${formatCurrency(state.monthlySavingsGoal)} this month.`;
}

function renderTransactions() {
  const query = els.search.value.trim().toLowerCase();
  const type = els.typeFilter.value;
  const category = els.categoryFilter.value;

  const visible = [...state.transactions]
    .filter((transaction) => type === "all" || transaction.type === type)
    .filter((transaction) => category === "all" || transaction.category === category)
    .filter((transaction) => {
      const haystack = `${transaction.title} ${transaction.note} ${transaction.account} ${transaction.category}`.toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!visible.length) {
    els.transactionList.innerHTML = "";
    els.transactionList.append(els.emptyTemplate.content.cloneNode(true));
    return;
  }

  els.transactionList.innerHTML = visible.map((transaction) => `
    <article class="transaction-item" data-id="${transaction.id}">
      <div class="transaction-main">
        <strong>${escapeHtml(transaction.title)}</strong>
        <div class="transaction-meta">
          <span>${transaction.date}</span>
          <span>${escapeHtml(transaction.category)}</span>
          <span>${escapeHtml(transaction.account)}</span>
          ${transaction.note ? `<span>${escapeHtml(transaction.note)}</span>` : ""}
        </div>
      </div>
      <span class="amount ${transaction.type}">${transaction.type === "income" ? "+" : "-"}${formatCurrency(transaction.amount)}</span>
      <div class="row-actions">
        <button class="mini-btn" type="button" data-edit="${transaction.id}">Edit</button>
        <button class="icon-btn" type="button" title="Delete transaction" aria-label="Delete transaction" data-delete="${transaction.id}">x</button>
      </div>
    </article>
  `).join("");
}

function renderBudgets() {
  const month = getSelectedMonth();
  const expenses = transactionsForMonth(month).filter((transaction) => transaction.type === "expense");
  const spendingByCategory = groupByCategory(expenses);

  els.budgetList.innerHTML = Object.entries(state.budgets).map(([category, limit]) => {
    const spent = spendingByCategory[category] || 0;
    const percent = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    const status = percent >= 100 ? "danger" : percent >= 75 ? "warning" : "";
    return `
      <article class="budget-item">
        <div class="budget-top">
          <strong>${category}</strong>
          <span>${percent}%</span>
        </div>
        <div class="budget-meta">${formatCurrency(spent)} of ${formatCurrency(limit)}</div>
        <div class="progress-track" aria-hidden="true"><span class="${status}" style="width: ${Math.min(percent, 100)}%"></span></div>
      </article>
    `;
  }).join("");
}

function renderRecurring() {
  const today = new Date();
  const month = getSelectedMonth();
  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;

  els.recurringList.innerHTML = recurringBills.map((bill) => {
    const dueDate = new Date(year, monthIndex, bill.day);
    const daysLeft = Math.ceil((dueDate - today) / 86400000);
    const status = daysLeft < 0 ? "paid or overdue" : daysLeft === 0 ? "due today" : `in ${daysLeft} days`;
    return `
      <article class="recurring-item">
        <div>
          <strong>${bill.title}</strong>
          <small>${bill.category} - ${status}</small>
        </div>
        <span>${formatCurrency(bill.amount)}</span>
      </article>
    `;
  }).join("");
}

function renderInsights() {
  const month = getSelectedMonth();
  const monthTransactions = transactionsForMonth(month);
  const expenses = monthTransactions.filter((transaction) => transaction.type === "expense");
  const income = sumTransactions(monthTransactions, "income");
  const spending = sumTransactions(monthTransactions, "expense");
  const byCategory = groupByCategory(expenses);
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const averageExpense = expenses.length ? spending / expenses.length : 0;
  const projected = spending * (30 / Math.max(1, new Date().getDate()));
  const savingsRate = income > 0 ? Math.round(((income - spending) / income) * 100) : 0;

  const insights = [
    {
      title: topCategory ? `Top category: ${topCategory[0]}` : "Top category",
      body: topCategory ? `${formatCurrency(topCategory[1])} spent in ${topCategory[0]} for ${monthLabel(month)}.` : "Add expenses to reveal your biggest category."
    },
    {
      title: "Average expense",
      body: expenses.length ? `${formatCurrency(averageExpense)} per expense across ${expenses.length} entries.` : "No expenses recorded for this month."
    },
    {
      title: "Monthly signal",
      body: income ? `${savingsRate}% savings rate. Projected spending is around ${formatCurrency(projected)}.` : "Add income to calculate savings rate."
    }
  ];

  els.insightsList.innerHTML = insights.map((insight) => `
    <article class="insight">
      <strong>${escapeHtml(insight.title)}</strong>
      <span>${escapeHtml(insight.body)}</span>
    </article>
  `).join("");
}

function renderChart() {
  const canvas = els.chart;
  const ctx = canvas.getContext("2d");
  const pixelRatio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width * pixelRatio));
  canvas.height = Math.max(1, Math.floor(rect.height * pixelRatio));
  ctx.scale(pixelRatio, pixelRatio);

  const months = [...new Set(state.transactions.map((transaction) => parseMonth(transaction.date)))].sort().slice(-6);
  const data = months.map((month) => {
    const items = transactionsForMonth(month);
    return {
      month,
      income: sumTransactions(items, "income"),
      expense: sumTransactions(items, "expense")
    };
  });

  const width = rect.width;
  const height = rect.height;
  const padding = { top: 22, right: 18, bottom: 42, left: 54 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(1000, ...data.flatMap((item) => [item.income, item.expense]));

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#fbfcf8";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#dfe3dc";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#6b6f76";
  ctx.font = "12px Inter, system-ui, sans-serif";

  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    const label = formatCompact(maxValue - (maxValue / 4) * i);
    ctx.fillText(label, 8, y + 4);
  }

  if (!data.length) {
    ctx.fillStyle = "#6b6f76";
    ctx.textAlign = "center";
    ctx.fillText("Add transactions to draw trends", width / 2, height / 2);
    ctx.textAlign = "left";
    return;
  }

  const groupWidth = chartWidth / data.length;
  const barWidth = Math.min(34, groupWidth / 4);

  data.forEach((item, index) => {
    const x = padding.left + index * groupWidth + groupWidth / 2;
    const incomeHeight = (item.income / maxValue) * chartHeight;
    const expenseHeight = (item.expense / maxValue) * chartHeight;
    const baseY = padding.top + chartHeight;

    ctx.fillStyle = "#0f8b8d";
    ctx.fillRect(x - barWidth - 3, baseY - incomeHeight, barWidth, incomeHeight);
    ctx.fillStyle = "#d95d39";
    ctx.fillRect(x + 3, baseY - expenseHeight, barWidth, expenseHeight);

    ctx.fillStyle = "#44484f";
    ctx.textAlign = "center";
    ctx.fillText(item.month.slice(5), x, height - 16);
  });

  ctx.textAlign = "left";
  drawLegend(ctx, width - 170, 18, "#0f8b8d", "Income");
  drawLegend(ctx, width - 92, 18, "#d95d39", "Expense");
}

function drawLegend(ctx, x, y, color, label) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 10, 10);
  ctx.fillStyle = "#44484f";
  ctx.font = "12px Inter, system-ui, sans-serif";
  ctx.fillText(label, x + 15, y + 9);
}

function formatCompact(value) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function addOrUpdateTransaction(event) {
  event.preventDefault();
  const transaction = {
    id: editingId || crypto.randomUUID(),
    title: els.title.value.trim(),
    amount: Number(els.amount.value),
    type: els.type.value,
    category: els.category.value,
    account: els.account.value,
    date: els.date.value,
    note: els.note.value.trim()
  };

  if (!transaction.title || !transaction.amount || !transaction.date) {
    return;
  }

  if (editingId) {
    state.transactions = state.transactions.map((item) => item.id === editingId ? transaction : item);
  } else {
    state.transactions.push(transaction);
  }

  saveState();
  resetForm();
  renderAll();
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter((transaction) => transaction.id !== id);
  saveState();
  renderAll();
}

function editTransaction(id) {
  const transaction = state.transactions.find((item) => item.id === id);
  if (!transaction) {
    return;
  }

  editingId = id;
  els.title.value = transaction.title;
  els.amount.value = transaction.amount;
  els.type.value = transaction.type;
  populateCategoryOptions();
  els.category.value = transaction.category;
  els.account.value = transaction.account;
  els.date.value = transaction.date;
  els.note.value = transaction.note || "";
  els.form.querySelector(".primary-btn").textContent = "Update transaction";
  document.querySelector("#transactionFormTitle").scrollIntoView({ behavior: "smooth", block: "start" });
}

function exportState() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `expense-app-export-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importState(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed.transactions)) {
        throw new Error("Missing transactions");
      }
      state = {
        transactions: parsed.transactions,
        budgets: parsed.budgets || defaultBudgets,
        monthlySavingsGoal: Number(parsed.monthlySavingsGoal) || 12000
      };
      saveState();
      renderAll();
    } catch {
      alert("That file does not look like a valid Expense App export.");
    }
  };
  reader.readAsText(file);
}

function renderAll() {
  populateMonths();
  renderStats();
  renderTransactions();
  renderBudgets();
  renderRecurring();
  renderInsights();
  renderChart();
}

function bindEvents() {
  els.type.addEventListener("change", populateCategoryOptions);
  els.form.addEventListener("submit", addOrUpdateTransaction);
  els.clearForm.addEventListener("click", resetForm);
  els.month.addEventListener("change", renderAll);
  els.search.addEventListener("input", renderTransactions);
  els.typeFilter.addEventListener("change", renderTransactions);
  els.categoryFilter.addEventListener("change", renderTransactions);
  els.seedDemo.addEventListener("click", () => {
    state = {
      transactions: demoTransactions.map((transaction) => ({ ...transaction, id: crypto.randomUUID() })),
      budgets: defaultBudgets,
      monthlySavingsGoal: 12000
    };
    saveState();
    renderAll();
  });
  els.exportBtn.addEventListener("click", exportState);
  els.importInput.addEventListener("change", (event) => {
    const [file] = event.target.files;
    if (file) {
      importState(file);
    }
    event.target.value = "";
  });
  els.transactionList.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit]");
    if (editButton) {
      editTransaction(editButton.dataset.edit);
      return;
    }

    const deleteButton = event.target.closest("[data-delete]");
    if (deleteButton) {
      deleteTransaction(deleteButton.dataset.delete);
    }
  });
  window.addEventListener("resize", renderChart);
}

populateCategoryOptions();
resetForm();
bindEvents();
renderAll();
