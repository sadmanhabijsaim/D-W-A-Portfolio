import { loadEnv } from 'vite';
import tokiHandler from './api/toki.js';

const maxBodyBytes = 16 * 1024;

function createResponseAdapter(response) {
  const adapter = {
    setHeader(name, value) {
      response.setHeader(name, value);
      return adapter;
    },
    status(statusCode) {
      response.statusCode = statusCode;
      return adapter;
    },
    json(payload) {
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.end(JSON.stringify(payload));
      return adapter;
    }
  };
  return adapter;
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

function localTokiApi(request, response, next) {
  if ((request.url || '').split('?')[0] !== '/api/toki') {
    next();
    return;
  }

  if (request.method !== 'POST') {
    tokiHandler(request, createResponseAdapter(response));
    return;
  }

  let body = '';
  let bodyTooLarge = false;
  request.on('data', (chunk) => {
    if (bodyTooLarge) return;
    body += chunk;
    if (Buffer.byteLength(body, 'utf8') > maxBodyBytes) {
      bodyTooLarge = true;
      sendJson(response, 413, { error: 'Request body is too large.' });
      request.resume();
    }
  });

  request.on('end', () => {
    if (bodyTooLarge) return;

    try {
      request.body = JSON.parse(body || '{}');
    } catch {
      sendJson(response, 400, { error: 'Request body must be valid JSON.' });
      return;
    }

    tokiHandler(request, createResponseAdapter(response));
  });
}

export default function config({ mode }) {
  const env = loadEnv(mode, process.cwd(), '');
  if (process.env.TOKI_FAQ_RESPONSES === undefined && env.TOKI_FAQ_RESPONSES !== undefined) {
    process.env.TOKI_FAQ_RESPONSES = env.TOKI_FAQ_RESPONSES;
  }

  return {
    plugins: [{
      name: 'local-toki-api',
      configureServer(server) {
        server.middlewares.use(localTokiApi);
      },
      configurePreviewServer(server) {
        server.middlewares.use(localTokiApi);
      }
    }]
  };
}
