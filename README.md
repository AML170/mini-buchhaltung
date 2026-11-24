# Mini-Buchhaltung

Eine kleine Einnahmen-Ausgaben-Rechnung als Web-App. Gebaut mit reinem HTML, CSS und JavaScript, ganz ohne Frameworks, Build-Tools oder Server. Alle Daten bleiben im Browser (Local Storage API).

Die Oberfläche startet auf Englisch und lässt sich in der App umschalten: **English, Deutsch und العربية** (mit Rechts-nach-links-Darstellung für Arabisch). Die Sprachwahl wird gespeichert.

Das Projekt verbindet meinen betriebswirtschaftlichen Hintergrund (International Business, Accounting & Auditing) mit der Softwareentwicklung: Die fachliche Grundlage ist die Einnahmenüberschussrechnung, bei der der Saldo aus der Summe aller Einnahmen minus der Summe aller Ausgaben entsteht.

## Funktionen

- Buchungen erfassen: Beschreibung, Betrag, Art (Einnahme oder Ausgabe) und Kategorie
- Übersicht mit drei Kennzahlen: Einnahmen gesamt, Ausgaben gesamt und Saldo
- Auswertung "Ausgaben nach Kategorie" mit Balkendiagramm und prozentualem Anteil
- Sprachumschalter in der App: English, Deutsch, العربية (inklusive RTL-Layout und passenden Zahlen- und Datumsformaten)
- Filtern nach: Alle / Einnahmen / Ausgaben
- Einzelne Buchungen löschen, neueste Buchung steht oben
- Dauerhafte Speicherung im Browser über die Local Storage API

## Verwendete Technologien

- **HTML5** - semantische Struktur, ARIA-Labels für Barrierefreiheit, `lang`- und `dir`-Attribute für Mehrsprachigkeit
- **CSS3** - eigenes Design mit CSS Custom Properties, Grid für die Übersichtskarten, RTL-Unterstützung
- **JavaScript (ES6+)** - DOM-Manipulation, Event Handling, `localStorage`, `Intl.NumberFormat` und `Intl.DateTimeFormat`

## Interessante Details im Code

- **Mehrsprachigkeit ohne Framework:** Alle Texte liegen in einem Übersetzungsobjekt (`TRANSLATIONS` in `app.js`). Elemente tragen `data-i18n`-Attribute, und `applyLanguage()` setzt Texte, Platzhalter, `lang` und die Schreibrichtung (`dir="rtl"` für Arabisch) in einem Schritt.
- **Sprachunabhängige Daten:** Buchungen speichern nur Kategorie-Schlüssel (z. B. `rent`), nie sichtbaren Text. Deshalb bleibt eine Buchung korrekt, wenn die Sprache wechselt.
- **Geldbeträge runden:** JavaScript rechnet intern mit Binärzahlen, daher ergibt `0.1 + 0.2` nicht exakt `0.3`. Alle Beträge werden beim Speichern und Summieren auf zwei Nachkommastellen gerundet (`round()` in `app.js`).
- **Eingabeprüfung:** Buchungen ohne Beschreibung, mit Beträgen kleiner oder gleich null oder mit unbekannter Kategorie werden abgelehnt. Beschädigte gespeicherte Daten werden beim Laden verworfen.
- **Trennung von Logik und Anzeige:** Die Rechenfunktionen (`totalIncome`, `totalExpenses`, `balance`, `expensesByCategory`) sind unabhängig von der Anzeige (`render`) und dadurch einzeln testbar.

## Starten

Einfach die Datei `index.html` in einem Browser öffnen. Es gibt keinen Build-Schritt und keinen Server.

## Tests

Kleine Regressionstests für die Kernlogik liegen in `tests/app.test.cjs` und laufen mit dem eingebauten Test-Runner von Node.js, ohne zusätzliche Pakete:

```bash
node --test
```

Die Tests prüfen unter anderem das Anlegen und Löschen von Buchungen, die Summen- und Saldo-Berechnung, die Kategorie-Auswertung, die Filter, das Runden von Geldbeträgen, den Sprachwechsel inklusive RTL und den Umgang mit beschädigten oder blockierten Speicherdaten.

---
---

# Mini Accounting

A small income-and-expense tracker as a web app, built with plain HTML, CSS and JavaScript. No frameworks, no build tools, no server. All data stays in the browser (Local Storage API).

The UI starts in English and can be switched inside the app: **English, German and Arabic** (with right-to-left layout for Arabic). The language choice is remembered.

The project connects my business background (International Business, Accounting & Auditing) with software development: the domain model is the income surplus calculation (Einnahmenüberschussrechnung), where the balance is the sum of all income minus the sum of all expenses.

## Features

- Record bookings: description, amount, type (income or expense) and category
- Overview with three key figures: total income, total expenses and balance
- "Expenses by category" breakdown with a bar chart and percentage share
- In-app language switcher: English, German, Arabic (including RTL layout and matching number and date formats)
- Filter by: All / Income / Expenses
- Delete single bookings, newest booking on top
- Persistent storage in the browser via the Local Storage API

## Technologies

- **HTML5** - semantic structure, ARIA labels for accessibility, `lang` and `dir` attributes for multilingual support
- **CSS3** - custom design with CSS custom properties, grid for the overview cards, RTL support
- **JavaScript (ES6+)** - DOM manipulation, event handling, `localStorage`, `Intl.NumberFormat` and `Intl.DateTimeFormat`

## Notable details in the code

- **Multilingual without a framework:** All texts live in one translation object (`TRANSLATIONS` in `app.js`). Elements carry `data-i18n` attributes, and `applyLanguage()` updates texts, placeholders, `lang` and the writing direction (`dir="rtl"` for Arabic) in one pass.
- **Language-independent data:** Bookings store only category keys (e.g. `rent`), never visible text, so a booking stays correct when the language changes.
- **Rounding money:** JavaScript calculates with binary numbers, so `0.1 + 0.2` is not exactly `0.3`. All amounts are rounded to two decimals when saved and summed (`round()` in `app.js`).
- **Input validation:** Bookings without a description, with amounts less than or equal to zero or with an unknown category are rejected. Corrupted stored data is discarded on load.
- **Separation of logic and display:** The calculation functions (`totalIncome`, `totalExpenses`, `balance`, `expensesByCategory`) are independent of rendering and can be tested individually.

## Getting started

Simply open `index.html` in a browser. There is no build step and no server.

## Tests

Small regression tests for the core logic live in `tests/app.test.cjs` and run with Node.js' built-in test runner, no extra packages needed:

```bash
node --test
```

The tests cover creating and deleting bookings, the totals and balance calculation, the category breakdown, filters, money rounding, the language switch including RTL, and handling corrupted or blocked storage.
