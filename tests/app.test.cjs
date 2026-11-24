// Kleine Regressionstests ohne zusätzliche Pakete.
// Small regression tests with no extra packages.
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');
function start(saved = null, blocked = false) {
  const elements = new Map();
  const element = () => ({
    classList: { toggle() {}, add() {}, remove() {} },
    dataset: {},
    style: {},
    append() {}, appendChild() {}, setAttribute() {},
    addEventListener() {}, focus() {},
  });
  const store = {};
  const context = vm.createContext({
    document: {
      documentElement: { lang: '', dir: '' },
      title: '',
      getElementById(id) {
        if (!elements.has(id)) elements.set(id, element());
        return elements.get(id);
      },
      querySelectorAll: () => [], createElement: element,
    },
    localStorage: {
      getItem: (k) => (k === 'mini-accounting:bookings' ? saved : store[k] ?? null),
      setItem(k, value) { if (blocked) throw Error('blocked'); if (k === 'mini-accounting:bookings') saved = value; else store[k] = value; },
    },
    console: { error() {} },
  });
  vm.runInContext(source, context);
  return { run: (s) => vm.runInContext(s, context), elements, context };
}
test('Add bookings, check balance and persistence', () => {
  const app = start();
  app.run('addBooking("Salary", 2500, "income", "salary")');
  app.run('addBooking("Rent", 800, "expense", "rent")');
  app.run('addBooking("Groceries", 150.55, "expense", "groceries")');
  assert.equal(app.run('totalIncome()'), 2500);
  assert.equal(app.run('totalExpenses()'), 950.55);
  assert.equal(app.run('balance()'), 1549.45);
  assert.equal(app.run('load().length'), 3);
});
test('Filter: show only income or expenses', () => {
  const app = start();
  app.run('addBooking("Salary", 2500, "income", "salary")');
  app.run('addBooking("Ticket", 30, "expense", "transport")');
  assert.equal(app.run('activeFilter="income"; filteredBookings().length'), 1);
  assert.equal(app.run('activeFilter="expense"; filteredBookings()[0].text'), 'Ticket');
});
test('Expenses summed per category', () => {
  const app = start();
  app.run('addBooking("Rent", 800, "expense", "rent")');
  app.run('addBooking("Bread", 4.5, "expense", "groceries")');
  app.run('addBooking("Rice", 5.5, "expense", "groceries")');
  assert.equal(app.run('expensesByCategory()["groceries"]'), 10);
  assert.equal(app.run('expensesByCategory()["rent"]'), 800);
});
test('Invalid bookings are rejected', () => {
  const app = start();
  assert.equal(app.run('addBooking("", 100, "income", "salary")'), false);
  assert.equal(app.run('addBooking("Test", 0, "income", "salary")'), false);
  assert.equal(app.run('addBooking("Test", -50, "expense", "rent")'), false);
  assert.equal(app.run('addBooking("Test", "abc", "income", "salary")'), false);
  assert.equal(app.run('addBooking("Test", 10, "income", "unknown-category")'), false);
  assert.equal(app.run('bookings.length'), 0);
});
test('Rounding prevents floating point errors', () => {
  const app = start();
  app.run('addBooking("A", 0.1, "income", "other")');
  app.run('addBooking("B", 0.2, "income", "other")');
  assert.equal(app.run('totalIncome()'), 0.3);
});
test('Delete a single booking', () => {
  const app = start();
  app.run('addBooking("Test", 10, "income", "other"); deleteBooking(bookings[0].id)');
  assert.equal(app.run('bookings.length'), 0);
});
test('Corrupted or wrong data is discarded', () => {
  for (const value of ['{', '{}', '[null,{},42]', '[{"id":"x","text":" ","amount":-1,"type":"expense","category":"rent","date":"d"}]']) {
    assert.equal(start(value).run('bookings.length'), 0);
  }
});
test('Blocked storage is shown, app stays usable', () => {
  const app = start(null, true);
  app.run('addBooking("Test", 10, "income", "other")');
  assert.equal(app.run('bookings.length'), 1);
  assert.match(app.elements.get('speicher-status').textContent, /Saving not possible/);
});
test('Language switch: German and Arabic with RTL', () => {
  const app = start();
  assert.equal(app.run('language'), 'en');
  app.run('setLanguage("de")');
  assert.equal(app.run('t("appTitle")'), 'Mini-Buchhaltung');
  assert.equal(app.context.document.documentElement.dir, 'ltr');
  app.run('setLanguage("ar")');
  assert.equal(app.context.document.documentElement.dir, 'rtl');
  assert.equal(app.run('t("cat.rent")'), 'إيجار');
  assert.equal(app.run('loadLanguage()'), 'ar');
  app.run('setLanguage("xx")');
  assert.equal(app.run('language'), 'ar');
});
test('Amounts and dates format per language', () => {
  const app = start();
  assert.match(app.run('formatAmount(1234.5)'), /1,234\.50|1\.234,50|١/);
  app.run('setLanguage("de")');
  assert.match(app.run('formatAmount(1234.5)'), /1\.234,50/);
});
