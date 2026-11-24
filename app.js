/**
 * Mini-Buchhaltung
 * Eine einfache Einnahmen-Ausgaben-Rechnung mit Local Storage.
 * Alle Daten bleiben im Browser, es gibt keinen Server.
 *
 * Fachliche Grundlage: die Einnahmenueberschussrechnung.
 * Saldo = Summe aller Einnahmen - Summe aller Ausgaben.
 */

"use strict";

// --- Schlüssel für den Local Storage ---
const SPEICHER_SCHLUESSEL = "mini-buchhaltung:buchungen";

// --- Feste Kategorien für Buchungen ---
const KATEGORIEN = ["Gehalt", "Lebensmittel", "Miete", "Transport", "Freizeit", "Sonstiges"];

// --- DOM-Elemente ---
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

// --- Zustand der Anwendung ---
let buchungen = laden();
let aktiverFilter = "alle";

/** Lädt die gespeicherten Buchungen aus dem Local Storage. */
function laden() {
  try {
    const rohdaten = localStorage.getItem(SPEICHER_SCHLUESSEL);
    const daten = rohdaten ? JSON.parse(rohdaten) : [];
    if (!Array.isArray(daten)) return [];
    return daten.filter((b) => b && typeof b.id === "string" &&
      typeof b.text === "string" && b.text.trim().length > 0 &&
      typeof b.betrag === "number" && isFinite(b.betrag) && b.betrag > 0 &&
      ["einnahme", "ausgabe"].includes(b.art) &&
      KATEGORIEN.includes(b.kategorie) &&
      typeof b.datum === "string");
  } catch (fehler) {
    console.error("Buchungen konnten nicht geladen werden:", fehler);
    return [];
  }
}

/** Speichert alle Buchungen im Local Storage. */
function speichern() {
  try {
    localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(buchungen));
    document.getElementById("speicher-status").textContent = "";
  } catch {
    document.getElementById("speicher-status").textContent =
      "Speichern nicht möglich. Änderungen bleiben nur bis zum Schließen dieser Seite erhalten.";
  }
}

/** Erzeugt eine eindeutige ID für eine neue Buchung. */
function neueId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Rundet einen Geldbetrag auf zwei Nachkommastellen.
 * Wichtig, weil JavaScript intern mit Binärzahlen rechnet
 * und 0.1 + 0.2 sonst 0.30000000000000004 ergibt.
 */
function runden(betrag) {
  return Math.round(betrag * 100) / 100;
}

/** Fügt eine neue Buchung hinzu. Betrag muss größer als 0 sein. */
function buchungHinzufuegen(text, betrag, art, kategorie) {
  const betragZahl = runden(Number(betrag));
  if (!isFinite(betragZahl) || betragZahl <= 0) return false;
  if (!text || !text.trim()) return false;
  buchungen.push({
    id: neueId(),
    text: text.trim(),
    betrag: betragZahl,
    art: art,
    kategorie: kategorie,
    datum: new Date().toISOString(),
  });
  speichern();
  rendern();
  return true;
}

/** Löscht eine einzelne Buchung. */
function buchungLoeschen(id) {
  buchungen = buchungen.filter((b) => b.id !== id);
  speichern();
  rendern();
}

/** Summe aller Einnahmen. */
function summeEinnahmen() {
  return runden(buchungen
    .filter((b) => b.art === "einnahme")
    .reduce((summe, b) => summe + b.betrag, 0));
}

/** Summe aller Ausgaben. */
function summeAusgaben() {
  return runden(buchungen
    .filter((b) => b.art === "ausgabe")
    .reduce((summe, b) => summe + b.betrag, 0));
}

/** Saldo = Einnahmen minus Ausgaben. */
function saldo() {
  return runden(summeEinnahmen() - summeAusgaben());
}

/** Ausgaben summiert pro Kategorie, für die Auswertung. */
function ausgabenNachKategorie() {
  const ergebnis = {};
  for (const buchung of buchungen) {
    if (buchung.art !== "ausgabe") continue;
    ergebnis[buchung.kategorie] = runden((ergebnis[buchung.kategorie] || 0) + buchung.betrag);
  }
  return ergebnis;
}

/** Gibt die Buchungen passend zum aktiven Filter zurück, neueste zuerst. */
function gefilterteBuchungen() {
  let sichtbar = buchungen;
  if (aktiverFilter !== "alle") {
    sichtbar = buchungen.filter((b) => b.art === aktiverFilter);
  }
  return sichtbar.slice().reverse();
}

/** Formatiert einen Geldbetrag deutsch, z. B. 1.234,56 €. */
function betragFormatieren(wert) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(wert);
}

/** Formatiert das Datum einer Buchung deutsch, z. B. 24.11.2026. */
function datumFormatieren(isoDatum) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(isoDatum));
}

/** Baut ein Listenelement für eine Buchung. */
function buchungsElementErstellen(buchung) {
  const element = document.createElement("li");
  element.className = "buchung buchung--" + buchung.art;

  const info = document.createElement("div");
  info.className = "buchung__info";

  const text = document.createElement("span");
  text.className = "buchung__text";
  text.textContent = buchung.text;

  const meta = document.createElement("span");
  meta.className = "buchung__meta";
  meta.textContent = buchung.kategorie + " · " + datumFormatieren(buchung.datum);

  info.append(text, meta);

  const betrag = document.createElement("span");
  betrag.className = "buchung__betrag buchung__betrag--" + buchung.art;
  const vorzeichen = buchung.art === "einnahme" ? "+" : "−";
  betrag.textContent = vorzeichen + betragFormatieren(buchung.betrag);

  const loeschenButton = document.createElement("button");
  loeschenButton.className = "buchung__loeschen";
  loeschenButton.textContent = "×";
  loeschenButton.setAttribute("aria-label", buchung.text + ": Buchung löschen");
  loeschenButton.addEventListener("click", () => buchungLoeschen(buchung.id));

  element.append(info, betrag, loeschenButton);
  return element;
}

/** Baut die Auswertung "Ausgaben nach Kategorie" mit Balken. */
function kategorienRendern() {
  kategorienListe.innerHTML = "";
  const nachKategorie = ausgabenNachKategorie();
  const namen = Object.keys(nachKategorie);
  kategorienLeer.classList.toggle("ist-sichtbar", namen.length === 0);

  const gesamtAusgaben = summeAusgaben();
  for (const name of namen) {
    const summe = nachKategorie[name];
    const anteil = gesamtAusgaben > 0 ? (summe / gesamtAusgaben) * 100 : 0;

    const zeile = document.createElement("li");
    zeile.className = "kategorie";

    const kopf = document.createElement("div");
    kopf.className = "kategorie__kopf";

    const titel = document.createElement("span");
    titel.textContent = name;

    const wert = document.createElement("span");
    wert.textContent = betragFormatieren(summe) + " (" + Math.round(anteil) + " %)";

    kopf.append(titel, wert);

    const balken = document.createElement("div");
    balken.className = "kategorie__balken";

    const fuellung = document.createElement("div");
    fuellung.className = "kategorie__fuellung";
    fuellung.style.width = anteil + "%";

    balken.appendChild(fuellung);
    zeile.append(kopf, balken);
    kategorienListe.appendChild(zeile);
  }
}

/** Aktualisiert die komplette Anzeige. */
function rendern() {
  liste.innerHTML = "";
  const sichtbar = gefilterteBuchungen();

  for (const buchung of sichtbar) {
    liste.appendChild(buchungsElementErstellen(buchung));
  }

  leerHinweis.textContent = aktiverFilter === "alle"
    ? "Noch keine Buchungen. Erfasse deine erste Buchung!"
    : "Keine Buchungen für diesen Filter vorhanden.";
  leerHinweis.classList.toggle("ist-sichtbar", sichtbar.length === 0);

  summeEinnahmenAnzeige.textContent = betragFormatieren(summeEinnahmen());
  summeAusgabenAnzeige.textContent = betragFormatieren(summeAusgaben());

  const aktuellerSaldo = saldo();
  saldoAnzeige.textContent = betragFormatieren(aktuellerSaldo);
  saldoAnzeige.classList.toggle("ist-negativ", aktuellerSaldo < 0);
  saldoAnzeige.classList.toggle("ist-positiv", aktuellerSaldo > 0);

  kategorienRendern();

  zaehler.textContent =
    buchungen.length === 1 ? "1 Buchung" : buchungen.length + " Buchungen";
}

// --- Ereignisse ---
formular.addEventListener("submit", (ereignis) => {
  ereignis.preventDefault();
  const hinzugefuegt = buchungHinzufuegen(
    beschreibungEingabe.value,
    betragEingabe.value,
    artAuswahl.value,
    kategorieAuswahl.value
  );
  if (hinzugefuegt) {
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
    aktiverFilter = button.dataset.filter;
    rendern();
  });
});

// --- Start ---
rendern();
