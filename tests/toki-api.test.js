const assert = require('node:assert/strict');
const test = require('node:test');
const handler = require('../api/toki');

const envKeys = [
  'TOKI_FAMILY_FATHER_BN',
  'TOKI_FAMILY_FATHER_EN',
  'TOKI_FAMILY_MOTHER_BN',
  'TOKI_FAMILY_MOTHER_EN',
  'TOKI_FAMILY_SISTER_COUNT_BN',
  'TOKI_FAMILY_SISTER_COUNT_EN',
  'TOKI_FAMILY_SISTER_MARITAL_STATUS_BN',
  'TOKI_FAMILY_SISTER_MARITAL_STATUS_EN'
];

function invokeHandler({ method = 'POST', body, env = {} }) {
  const previousEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  envKeys.forEach((key) => {
    if (Object.hasOwn(env, key)) process.env[key] = env[key];
    else delete process.env[key];
  });

  const res = {
    headers: {},
    statusCode: 200,
    setHeader(name, value) {
      this.headers[name] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    }
  };

  try {
    handler({ method, body }, res);
    return res;
  } finally {
    envKeys.forEach((key) => {
      if (previousEnv[key] === undefined) delete process.env[key];
      else process.env[key] = previousEnv[key];
    });
  }
}

test('answers only the family detail that was asked', () => {
  const response = invokeHandler({
    body: { query: 'What does his father do?' },
    env: { TOKI_FAMILY_FATHER_EN: 'TEST-FATHER-FACT' }
  });

  assert.equal(response.statusCode, 200);
  assert.match(response.payload.reply, /TEST-FATHER-FACT/);
  assert.doesNotMatch(response.payload.reply, /mother|sister/i);
  assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('answers Bangla questions in Bangla without including unrelated facts', () => {
  const response = invokeHandler({
    body: { query: 'বাবার পেশা কী?' },
    env: { TOKI_FAMILY_FATHER_BN: 'TEST-BN-FACT' }
  });

  assert.equal(response.statusCode, 200);
  assert.match(response.payload.reply, /সাদমানের বাবা TEST-BN-FACT/);
  assert.doesNotMatch(response.payload.reply, /TEST-(?:MOTHER|SISTER)/);
});

test('asks for a specific topic instead of disclosing all details', () => {
  const response = invokeHandler({
    body: { query: 'Tell me about his family' },
    env: {
      TOKI_FAMILY_FATHER_EN: 'TEST-FATHER-FACT',
      TOKI_FAMILY_MOTHER_EN: 'TEST-MOTHER-FACT'
    }
  });

  assert.equal(response.statusCode, 200);
  assert.match(response.payload.reply, /specific family detail/i);
  assert.doesNotMatch(response.payload.reply, /TEST-(?:FATHER|MOTHER)-FACT/);
});

test('answers both sister questions only when both are asked', () => {
  const response = invokeHandler({
    body: { query: 'How many sisters does he have and are they married?' },
    env: {
      TOKI_FAMILY_SISTER_COUNT_EN: 'TEST-SISTER-COUNT',
      TOKI_FAMILY_SISTER_MARITAL_STATUS_EN: 'TEST-SISTER-STATUS'
    }
  });

  assert.equal(response.statusCode, 200);
  assert.match(response.payload.reply, /TEST-SISTER-COUNT/);
  assert.match(response.payload.reply, /TEST-SISTER-STATUS/);
});

test('returns a clear configuration error when a requested fact is missing', () => {
  const response = invokeHandler({
    body: { query: 'What does his father do?' }
  });

  assert.equal(response.statusCode, 503);
  assert.match(response.payload.error, /not configured/i);
});

test('does not make up Sadman’s relationship status', () => {
  const response = invokeHandler({
    body: { query: 'Is Sadman married?' }
  });

  assert.equal(response.statusCode, 200);
  assert.match(response.payload.reply, /don't have that family detail/i);
  assert.doesNotMatch(response.payload.reply, /\bsingle\b/i);
});

test('rejects unsupported methods and malformed questions explicitly', () => {
  const methodResponse = invokeHandler({ method: 'GET' });
  const inputResponse = invokeHandler({ body: { query: '   ' } });

  assert.equal(methodResponse.statusCode, 405);
  assert.equal(methodResponse.headers.Allow, 'POST');
  assert.equal(inputResponse.statusCode, 400);
});
