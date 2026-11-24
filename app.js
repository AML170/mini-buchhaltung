/**
 * Mini Accounting / Mini-Buchhaltung
 * A small income-and-expense tracker with localStorage.
 * All data stays in the browser, there is no server.
 *
 * Domain basis: the income surplus calculation
 * (Einnahmenüberschussrechnung): balance = total income - total expenses.
 *
 * The UI speaks English, German and Arabic. Texts live in TRANSLATIONS,
 * elements are wired through data-i18n attributes, and Arabic switches
 * the page direction to RTL.
 */

"use strict";

// --- Storage keys ---
const BOOKINGS_KEY = "mini-accounting:bookings";
const LANGUAGE_KEY = "mini-accounting:language";

// --- Fixed category keys; the visible name depends on the language ---
const CATEGORIES = ["salary", "groceries", "rent", "transport", "leisure", "other"];

// --- UI languages: English (default), German, Arabic ---
const LOCALES = { en: "en-IE", de: "de-DE", ar: "ar-EG" };

const TRANSLATIONS = {
  en: {
    appTitle: "Mini Accounting",
    subtitle: "Keep track of income and expenses.",
    income: "Income",
    expenses: "Expenses",
    balance: "Balance",
    descriptionPlaceholder: "Description, e.g. salary or rent...",
    amountPlaceholder: "Amount",
    incomeOpt: "Income",
    expenseOpt: "Expense",
    book: "Add booking",
    filterAll: "All",
    filterIncome: "Income",
    filterExpense: "Expenses",
    emptyAll: "No bookings yet. Add your first booking!",
    emptyFilter: "No bookings for this filter.",
    catTitle: "Expenses by category",
    catEmpty: "No expenses yet.",
    bookingCount: (n) => (n === 1 ? "1 booking" : n + " bookings"),
    storageError:
      "Saving not possible. Changes are kept only until this page is closed.",
    deleteSuffix: ": delete booking",
    "cat.salary": "Salary",
    "cat.groceries": "Groceries",
    "cat.rent": "Rent",
    "cat.transport": "Transport",
    "cat.leisure": "Leisure",
    "cat.other": "Other",
  },
  de: {
    appTitle: "Mini-Buchhaltung",
    subtitle: "Einnahmen und Ausgaben im Blick behalten.",
    income: "Einnahmen",
    expenses: "Ausgaben",
    balance: "Saldo",
    descriptionPlaceholder: "Beschreibung, z. B. Gehalt oder Miete...",
    amountPlaceholder: "Betrag",
    incomeOpt: "Einnahme",
    expenseOpt: "Ausgabe",
    book: "Buchen",
    filterAll: "Alle",
    filterIncome: "Einnahmen",
    filterExpense: "Ausgaben",
    emptyAll: "Noch keine Buchungen. Erfasse deine erste Buchung!",
    emptyFilter: "Keine Buchungen für diesen Filter vorhanden.",
    catTitle: "Ausgaben nach Kategorie",
    catEmpty: "Noch keine Ausgaben vorhanden.",
    bookingCount: (n) => (n === 1 ? "1 Buchung" : n + " Buchungen"),
    storageError:
      "Speichern nicht möglich. Änderungen bleiben nur bis zum Schließen dieser Seite erhalten.",
    deleteSuffix: ": Buchung löschen",
    "cat.salary": "Gehalt",
    "cat.groceries": "Lebensmittel",
    "cat.rent": "Miete",
    "cat.transport": "Transport",
    "cat.leisure": "Freizeit",
    "cat.other": "Sonstiges",
  },
  ar: {
    appTitle: "محاسبة مصغرة",
    subtitle: "تابعي الإيرادات والمصروفات.",
    income: "الإيرادات",
    expenses: "المصروفات",
    balance: "الرصيد",
    descriptionPlaceholder: "الوصف، مثال: المرتب أو الإيجار...",
    amountPlaceholder: "المبلغ",
    incomeOpt: "إيراد",
    expenseOpt: "مصروف",
    book: "سجّلي",
    filterAll: "الكل",
    filterIncome: "الإيرادات",
    filterExpense: "المصروفات",
    emptyAll: "لا توجد قيود بعد. سجّلي أول قيد!",
    emptyFilter: "لا توجد قيود لهذا الفلتر.",
    catTitle: "المصروفات حسب التصنيف",
    catEmpty: "لا توجد مصروفات بعد.",
    bookingCount: (n) => (n === 1 ? "قيد واحد" : n + " قيود"),
    storageError: "التخزين غير متاح. التعديلات تبقى فقط حتى إغلاق الصفحة.",
    deleteSuffix: ": حذف القيد",
    "cat.salary": "مرتب",
    "cat.groceries": "بقالة",
    "cat.rent": "إيجار",
    "cat.transport": "مواصلات",
    "cat.leisure": "ترفيه",
    "cat.other": "أخرى",
  },
};

// --- DOM elements ---
const formular = document.getElementById("buchungs-formular");
const beschreibungEingabe = document.getElementById("beschreibung-eingabe");
const betragEingabe = document.getElementById("betrag-eingabe");
const artAuswahl = document.getElementById("art-auswahl");
const kategorieAuswahl = document.getElementById("kategorie-auswahl");
const liste = document.getElementById("buchungs-liste");
const leerHinweis = document.getElementById("leer-hinweis");
const zaehler = document.getElementById("zaehler");
const summeEinnahmenAnzeige = document.getElementById("summe-einnahmen");
const summeAusgabenAnzeige = document.getElementById("summe-ausgaben");
const saldoAnzeige = document.getElementById("saldo-anzeige");
const kategorienListe = document.getElementById("kategorien-liste");
const kategorienLeer = document.getElementById("kategorien-leer");
const filterButtons = document.querySelectorAll(".filter__button");
const languageButtons = document.querySelectorAll(".language__button");

// --- Application state ---
let bookings = load();
let activeFilter = "alle";
let language = loadLanguage();

/** Returns the translation for a key in the active language. */
function t(key) {
  return TRANSLATIONS[language][key] || TRANSLATIONS.en[key] || key;
}

/** Loads the saved language, defaulting to English. */
function loadLanguage() {
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return TRANSLATIONS[saved] ? saved : "en";
  } catch {
    return "en";
  }
}

/** Loads the saved bookings from localStorage. */
function load() {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    const data = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(data)) return [];
    return data.filter((b) => b && typeof b.id === "string" &&
      typeof b.text === "string" && b.text.trim().length > 0 &&
      typeof b.amount === "number" && isFinite(b.amount) && b.amount > 0 &&
      ["income", "expense"].includes(b.type) &&
      CATEGORIES.includes(b.category) &&
      typeof b.date === "string");
  } catch (error) {
    console.error("Bookings could not be loaded:", error);
    return [];
  }
}

/** Saves all bookings to localStorage. */
function save() {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
    document.getElementById("speicher-status").textContent = "";
  } catch {
    document.getElementById("speicher-status").textContent = t("storageError");
  }
}

/** Creates a unique ID for a new booking. */
function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Rounds a money amount to two decimals.
 * Needed because JavaScript uses binary floating point,
 * so 0.1 + 0.2 would otherwise be 0.30000000000000004.
 */
function round(amount) {
  return Math.round(amount * 100) / 100;
}

/** Adds a new booking. The amount must be greater than 0. */
function addBooking(text, amount, type, category) {
  const value = round(Number(amount));
  if (!isFinite(value) || value <= 0) return false;
  if (!text || !text.trim()) return false;
  if (!CATEGORIES.includes(category)) return false;
  bookings.push({
    id: newId(),
    text: text.trim(),
    amount: value,
    type: type,
    category: category,
    date: new Date().toISOString(),
  });
  save();
  render();
  return true;
}

/** Deletes a single booking. */
function deleteBooking(id) {
  bookings = bookings.filter((b) => b.id !== id);
  save();
  render();
}

/** Total of all income. */
function totalIncome() {
  return round(bookings
    .filter((b) => b.type === "income")
    .reduce((sum, b) => sum + b.amount, 0));
}

/** Total of all expenses. */
function totalExpenses() {
  return round(bookings
    .filter((b) => b.type === "expense")
    .reduce((sum, b) => sum + b.amount, 0));
}

/** Balance = income minus expenses. */
function balance() {
  return round(totalIncome() - totalExpenses());
}

/** Expenses summed per category, for the breakdown. */
function expensesByCategory() {
  const result = {};
  for (const booking of bookings) {
    if (booking.type !== "expense") continue;
    result[booking.category] = round((result[booking.category] || 0) + booking.amount);
  }
  return result;
}

/** Returns the bookings for the active filter, newest first. */
function filteredBookings() {
  let visible = bookings;
  if (activeFilter !== "alle") {
    visible = bookings.filter((b) => b.type === activeFilter);
  }
  return visible.slice().reverse();
}

/** Formats a money amount in the active language, e.g. 1,234.56 €. */
function formatAmount(value) {
  return new Intl.NumberFormat(LOCALES[language], {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

/** Formats a booking date in the active language, e.g. 24/11/2026. */
function formatDate(isoDate) {
  return new Intl.DateTimeFormat(LOCALES[language], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(isoDate));
}

/** Builds a list element for one booking. */
function buildBookingElement(booking) {
  const element = document.createElement("li");
  element.className = "buchung buchung--" + booking.type;

  const info = document.createElement("div");
  info.className = "buchung__info";

  const text = document.createElement("span");
  text.className = "buchung__text";
  text.textContent = booking.text;

  const meta = document.createElement("span");
  meta.className = "buchung__meta";
  meta.textContent = t("cat." + booking.category) + " · " + formatDate(booking.date);

  info.append(text, meta);

  const amount = document.createElement("span");
  amount.className = "buchung__betrag buchung__betrag--" + booking.type;
  const sign = booking.type === "income" ? "+" : "−";
  amount.textContent = sign + formatAmount(booking.amount);

  const deleteButton = document.createElement("button");
  deleteButton.className = "buchung__loeschen";
  deleteButton.textContent = "×";
  deleteButton.setAttribute("aria-label", booking.text + t("deleteSuffix"));
  deleteButton.addEventListener("click", () => deleteBooking(booking.id));

  element.append(info, amount, deleteButton);
  return element;
}

/** Builds the "expenses by category" breakdown with bars. */
function renderCategories() {
  kategorienListe.innerHTML = "";
  const byCategory = expensesByCategory();
  const names = Object.keys(byCategory);
  kategorienLeer.classList.toggle("ist-sichtbar", names.length === 0);

  const allExpenses = totalExpenses();
  for (const name of names) {
    const sum = byCategory[name];
    const share = allExpenses > 0 ? (sum / allExpenses) * 100 : 0;

    const row = document.createElement("li");
    row.className = "kategorie";

    const head = document.createElement("div");
    head.className = "kategorie__kopf";

    const title = document.createElement("span");
    title.textContent = t("cat." + name);

    const value = document.createElement("span");
    value.textContent = formatAmount(sum) + " (" + Math.round(share) + " %)";

    head.append(title, value);

    const bar = document.createElement("div");
    bar.className = "kategorie__balken";

    const fill = document.createElement("div");
    fill.className = "kategorie__fuellung";
    fill.style.width = share + "%";

    bar.appendChild(fill);
    row.append(head, bar);
    kategorienListe.appendChild(row);
  }
}

/**
 * Applies the active language: updates all wired texts,
 * the html lang attribute and the page direction (RTL for Arabic).
 */
function applyLanguage() {
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  document.title = t("appTitle");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });

  languageButtons.forEach((button) => {
    const active = button.dataset.lang === language;
    button.classList.toggle("ist-aktiv", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

/** Switches the UI language and remembers the choice. */
function setLanguage(newLanguage) {
  if (!TRANSLATIONS[newLanguage]) return;
  language = newLanguage;
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // Language choice is kept only for this visit.
  }
  applyLanguage();
  render();
}

/** Updates the whole display. */
function render() {
  liste.innerHTML = "";
  const visible = filteredBookings();

  for (const booking of visible) {
    liste.appendChild(buildBookingElement(booking));
  }

  leerHinweis.textContent = activeFilter === "alle" ? t("emptyAll") : t("emptyFilter");
  leerHinweis.classList.toggle("ist-sichtbar", visible.length === 0);

  summeEinnahmenAnzeige.textContent = formatAmount(totalIncome());
  summeAusgabenAnzeige.textContent = formatAmount(totalExpenses());

  const currentBalance = balance();
  saldoAnzeige.textContent = formatAmount(currentBalance);
  saldoAnzeige.classList.toggle("ist-negativ", currentBalance < 0);
  saldoAnzeige.classList.toggle("ist-positiv", currentBalance > 0);

  renderCategories();

  zaehler.textContent = t("bookingCount")(bookings.length);
}

// --- Events ---
formular.addEventListener("submit", (event) => {
  event.preventDefault();
  const added = addBooking(
    beschreibungEingabe.value,
    betragEingabe.value,
    artAuswahl.value,
    kategorieAuswahl.value
  );
  if (added) {
    beschreibungEingabe.value = "";
    betragEingabe.value = "";
    beschreibungEingabe.focus();
  }
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((b) => {
      b.classList.remove("ist-aktiv");
      b.setAttribute("aria-pressed", "false");
    });
    button.classList.add("ist-aktiv");
    button.setAttribute("aria-pressed", "true");
    activeFilter = button.dataset.filter;
    render();
  });
});

languageButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

// --- Start ---
applyLanguage();
render();
