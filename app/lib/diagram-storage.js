async function request(path, options) {
  let response;
  try {
    response = await fetch(`/api/diagrams${path}`, options);
  } catch (error) {
    throw new Error(`Could not reach shared diagram storage: ${error.message}`);
  }

  const result = await response.json();
  if (!response.ok) {
    const requestError = new Error(result.message || 'The shared diagram request failed.');
    requestError.status = response.status;
    throw requestError;
  }

  return result;
}

export function getDiagrams() {
  return request('', { method: 'GET' });
}

export function getDiagram(id) {
  return request(`/${encodeURIComponent(id)}`, { method: 'GET' });
}

export function saveDiagram(name, xml, existingDiagram) {
  const method = existingDiagram ? 'PUT' : 'POST';
  const path = existingDiagram ? `/${encodeURIComponent(existingDiagram.id)}` : '';
  const body = {
    name,
    xml
  };

  if (existingDiagram) {
    body.expectedRevision = existingDiagram.revision;
  }

  return request(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}
