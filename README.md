# Mini-Buchhaltung

Eine kleine Einnahmen-Ausgaben-Rechnung als Web-App, komplett mit deutscher Benutzeroberfläche. Gebaut mit reinem HTML, CSS und JavaScript, ganz ohne Frameworks, Build-Tools oder Server. Alle Daten bleiben im Browser (Local Storage API).

Das Projekt verbindet meinen betriebswirtschaftlichen Hintergrund (International Business, Accounting & Auditing) mit der Softwareentwicklung: Die fachliche Grundlage ist die Einnahmenüberschussrechnung, bei der der Saldo aus der Summe aller Einnahmen minus der Summe aller Ausgaben entsteht.

## Funktionen

- Buchungen erfassen: Beschreibung, Betrag, Art (Einnahme oder Ausgabe) und Kategorie
- Übersicht mit drei Kennzahlen: Einnahmen gesamt, Ausgaben gesamt und Saldo
- Auswertung "Ausgaben nach Kategorie" mit Balkendiagramm und prozentualem Anteil
- Filtern nach: Alle / Einnahmen / Ausgaben
- Einzelne Buchungen löschen, neueste Buchung steht oben
- Deutsche Zahlen- und Datumsformate über die Intl-API (z. B. 1.234,56 €)
- Dauerhafte Speicherung im Browser über die Local Storage API

## Verwendete Technologien

- **HTML5** - semantische Struktur, `lang="de"`, ARIA-Labels für Barrierefreiheit
- **CSS3** - eigenes Design mit CSS Custom Properties, Grid für die Übersichtskarten
- **JavaScript (ES6+)** - DOM-Manipulation, Event Handling, `localStorage`, `Intl.NumberFormat` und `Intl.DateTimeFormat`

## Interessante Details im Code

- **Geldbeträge runden:** JavaScript rechnet intern mit Binärzahlen, daher ergibt `0.1 + 0.2` nicht exakt `0.3`. Alle Beträge werden deshalb beim Speichern und Summieren auf zwei Nachkommastellen gerundet (`runden()` in `app.js`).
- **Eingabeprüfung:** Buchungen ohne Beschreibung oder mit Beträgen kleiner oder gleich null werden abgelehnt. Beim Laden werden beschädigte gespeicherte Daten verworfen, damit die App nicht abstürzt.
- **Trennung von Logik und Anzeige:** Die Rechenfunktionen (`summeEinnahmen`, `summeAusgaben`, `saldo`, `ausgabenNachKategorie`) sind unabhängig von der Anzeige (`rendern`) und dadurch einzeln testbar.

## Starten

Einfach die Datei `index.html` in einem Browser öffnen. Es gibt keinen Build-Schritt und keinen Server.

## Tests

Kleine Regressionstests für die Kernlogik liegen in `tests/app.test.cjs` und laufen mit dem eingebauten Test-Runner von Node.js, ohne zusätzliche Pakete:

```bash
node --test
```

Die Tests prüfen unter anderem das Anlegen und Löschen von Buchungen, die Summen- und Saldo-Berechnung, die Kategorie-Auswertung, die Filter, das Runden von Geldbeträgen und den Umgang mit beschädigten oder blockierten Speicherdaten.

---
---

# Mini Accounting

A small income-and-expense tracker as a web app with a fully German user interface, built with plain HTML, CSS and JavaScript. No frameworks, no build tools, no server. All data stays in the browser (Local Storage API).

The project connects my business background (International Business, Accounting & Auditing) with software development: the domain model is the income surplus calculation (Einnahmenüberschussrechnung), where the balance is the sum of all income minus the sum of all expenses.

## Features

- Record bookings: description, amount, type (income or expense) and category
- Overview with three key figures: total income, total expenses and balance
- "Expenses by category" breakdown with a bar chart and percentage share
- Filter by: All / Income / Expenses
- Delete single bookings, newest booking on top
- German number and date formats via the Intl API (e.g. 1,234.56 €)
- Persistent storage in the browser via the Local Storage API

## Technologies

- **HTML5** - semantic structure, `lang="de"`, ARIA labels for accessibility
- **CSS3** - custom design with CSS custom properties, grid for the overview cards
- **JavaScript (ES6+)** - DOM manipulation, event handling, `localStorage`, `Intl.NumberFormat` and `Intl.DateTimeFormat`

## Notable details in the code

- **Rounding money:** JavaScript calculates with binary numbers, so `0.1 + 0.2` is not exactly `0.3`. All amounts are therefore rounded to two decimal places when saved and summed (`runden()` in `app.js`).
- **Input validation:** Bookings without a description or with amounts less than or equal to zero are rejected. Corrupted stored data is discarded on load so the app never crashes.
- **Separation of logic and display:** The calculation functions (`summeEinnahmen`, `summeAusgaben`, `saldo`, `ausgabenNachKategorie`) are independent of rendering and can be tested individually.

## Getting started

Simply open `index.html` in a browser. There is no build step and no server.

## Tests

Small regression tests for the core logic live in `tests/app.test.cjs` and run with Node.js' built-in test runner, no extra packages needed:

```bash
node --test
```

The tests cover creating and deleting bookings, the totals and balance calculation, the category breakdown, filters, money rounding, and handling corrupted or blocked storage.
