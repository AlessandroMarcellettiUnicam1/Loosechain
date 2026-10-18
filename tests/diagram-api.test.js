const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { after, before, test } = require('node:test');
const Database = require('better-sqlite3');
const { createDiagramApiHandler } = require('../server/diagram-api');

let directory;
let database;
let server;
let baseUrl;

before(async () => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'loosechain-diagrams-'));
  const databasePath = path.join(directory, 'diagrams.sqlite');
  database = new Database(databasePath);
  database.exec(`
    CREATE TABLE diagrams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      xml TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      revision INTEGER NOT NULL DEFAULT 1
    )
  `);
  server = http.createServer(createDiagramApiHandler(database));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server && server.listening) {
    await new Promise(resolve => server.close(resolve));
  }
  if (database && database.open) {
    database.close();
  }
  if (directory && fs.existsSync(directory)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('shared diagram API creates, updates, and rejects stale saves', async () => {
  const listResponse = await fetch(`${baseUrl}/api/diagrams`);
  assert.equal(listResponse.status, 200);
  assert.deepEqual(await listResponse.json(), []);

  const createResponse = await fetch(`${baseUrl}/api/diagrams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Process', xml: '<definitions />' })
  });
  assert.equal(createResponse.status, 201);
  const created = await createResponse.json();
  assert.equal(created.name, 'Process');
  assert.equal(created.xml, '<definitions />');
  assert.equal(created.revision, 1);

  const updateResponse = await fetch(`${baseUrl}/api/diagrams/${created.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Updated process',
      xml: '<definitions id="updated" />',
      expectedRevision: created.revision
    })
  });
  assert.equal(updateResponse.status, 200);
  const updated = await updateResponse.json();
  assert.equal(updated.name, 'Updated process');
  assert.equal(updated.revision, 2);

  const staleResponse = await fetch(`${baseUrl}/api/diagrams/${created.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Stale write',
      xml: '<definitions id="stale" />',
      expectedRevision: created.revision
    })
  });
  assert.equal(staleResponse.status, 409);
  assert.match((await staleResponse.json()).message, /changed by another client/);

  const latestResponse = await fetch(`${baseUrl}/api/diagrams/${created.id}`);
  assert.equal(latestResponse.status, 200);
  assert.equal((await latestResponse.json()).xml, '<definitions id="updated" />');
});
