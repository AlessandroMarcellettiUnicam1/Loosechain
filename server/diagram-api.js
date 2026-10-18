const MAX_BODY_SIZE = 10 * 1024 * 1024;
const MAX_XML_LENGTH = 5 * 1024 * 1024;
const MAX_NAME_LENGTH = 200;

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function sendJson(response, status, value) {
  const body = JSON.stringify(value);
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store'
  });
  response.end(body);
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    let bodyBytes = 0;
    let bodyTooLarge = false;

    request.setEncoding('utf8');
    request.on('data', chunk => {
      if (bodyTooLarge) {
        return;
      }
      bodyBytes += Buffer.byteLength(chunk);
      if (bodyBytes > MAX_BODY_SIZE) {
        bodyTooLarge = true;
        body = '';
        return;
      }
      body += chunk;
    });
    request.on('error', reject);
    request.on('end', () => {
      if (bodyTooLarge) {
        reject(new ApiError(413, 'The request body is too large.'));
        return;
      }
      if (!request.headers['content-type'] || !request.headers['content-type'].includes('application/json')) {
        reject(new ApiError(415, 'Content-Type must be application/json.'));
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new ApiError(400, 'The request body must contain valid JSON.'));
      }
    });
  });
}

function validateDiagram(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new ApiError(400, 'A diagram object is required.');
  }
  if (typeof data.name !== 'string' || !data.name.trim() || data.name.trim().length > MAX_NAME_LENGTH) {
    throw new ApiError(400, `Diagram name must contain 1 to ${MAX_NAME_LENGTH} characters.`);
  }
  if (typeof data.xml !== 'string' || !data.xml.trim() || data.xml.length > MAX_XML_LENGTH) {
    throw new ApiError(400, `Diagram XML must contain 1 to ${MAX_XML_LENGTH} characters.`);
  }
  return { name: data.name.trim(), xml: data.xml };
}

function publicDiagram(row, includeXml) {
  const diagram = {
    id: row.id,
    name: row.name,
    updatedAt: row.updated_at,
    revision: row.revision
  };
  if (includeXml) {
    diagram.xml = row.xml;
  }
  return diagram;
}

function parseDiagramId(value) {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new ApiError(400, 'Diagram ID must be a positive integer.');
  }
  const id = Number(value);
  if (!Number.isSafeInteger(id)) {
    throw new ApiError(400, 'Diagram ID is outside the supported range.');
  }
  return id;
}

function createDiagramApiHandler(database) {
  const listDiagrams = database.prepare(
    'SELECT id, name, updated_at, revision FROM diagrams ORDER BY updated_at DESC, id DESC'
  );
  const getDiagram = database.prepare(
    'SELECT id, name, xml, updated_at, revision FROM diagrams WHERE id = ?'
  );
  const insertDiagram = database.prepare(
    'INSERT INTO diagrams (name, xml, updated_at, revision) VALUES (?, ?, ?, 1)'
  );
  const updateDiagram = database.prepare(
    'UPDATE diagrams SET name = ?, xml = ?, updated_at = ?, revision = revision + 1 WHERE id = ? AND revision = ?'
  );

  return function handleDiagramApi(request, response) {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (!pathname.startsWith('/api/')) {
      return false;
    }

    Promise.resolve().then(async () => {
      if (pathname === '/api/health' && request.method === 'GET') {
        sendJson(response, 200, { status: 'ok' });
        return;
      }

      if (pathname === '/api/diagrams' && request.method === 'GET') {
        sendJson(response, 200, listDiagrams.all().map(row => publicDiagram(row, false)));
        return;
      }

      if (pathname === '/api/diagrams' && request.method === 'POST') {
        const diagram = validateDiagram(await readJson(request));
        const updatedAt = new Date().toISOString();
        const result = insertDiagram.run(diagram.name, diagram.xml, updatedAt);
        sendJson(response, 201, publicDiagram(getDiagram.get(result.lastInsertRowid), true));
        return;
      }

      const match = pathname.match(/^\/api\/diagrams\/([^/]+)$/);
      if (match) {
        const id = parseDiagramId(match[1]);
        if (request.method === 'GET') {
          const diagram = getDiagram.get(id);
          if (!diagram) {
            throw new ApiError(404, 'The requested diagram was not found.');
          }
          sendJson(response, 200, publicDiagram(diagram, true));
          return;
        }
        if (request.method === 'PUT') {
          const data = await readJson(request);
          const diagram = validateDiagram(data);
          if (!Number.isSafeInteger(data.expectedRevision) || data.expectedRevision < 1) {
            throw new ApiError(400, 'A positive expectedRevision is required when saving an existing diagram.');
          }
          const updatedAt = new Date().toISOString();
          const result = updateDiagram.run(
            diagram.name,
            diagram.xml,
            updatedAt,
            id,
            data.expectedRevision
          );
          if (result.changes === 0) {
            if (!getDiagram.get(id)) {
              throw new ApiError(404, 'The requested diagram was not found.');
            }
            throw new ApiError(409, 'This diagram was changed by another client. Reload it before saving to avoid overwriting their changes.');
          }
          sendJson(response, 200, publicDiagram(getDiagram.get(id), true));
          return;
        }
      }

      sendJson(response, 404, { message: 'The requested API endpoint was not found.' });
    }).catch(error => {
      if (response.headersSent) {
        response.destroy(error);
        return;
      }
      if (error instanceof ApiError) {
        sendJson(response, error.status, { message: error.message });
        return;
      }
      console.error('Shared diagram API request failed.', error);
      sendJson(response, 500, { message: 'The shared diagram request failed unexpectedly.' });
    });

    return true;
  };
}

module.exports = { createDiagramApiHandler };
