const assert = require('node:assert/strict');
const test = require('node:test');
const handler = require('../api/toki');

const responseIds = [
  'familyName',
  'familySisterMarital',
  'parentsWork',
  'fatherWork',
  'motherWork',
  'sisterCount',
  'familyBroad',
  'familyUnknown',
  'relationshipStatus',
  'notListed',
  'location',
  'experience',
  'education',
  'skills',
  'projects',
  'certificates',
  'cv',
  'contact',
  'social',
  'profile',
  'portfolio',
  'sisterCountAndMarital',
  'fallback'
];

function createConfig() {
  const answers = Object.fromEntries(responseIds.map((id) => [
    id,
    {
      bn: `TEST-BN-${id}`,
      en: `TEST-EN-${id}`,
      links: id === 'skills' ? ['skills'] : []
    }
  ]));

  return {
    banglaPattern: '\\b(?:baba|babar|ma|maa|bon|biye|poribar)\\b',
    answers
  };
}

function invokeHandler({ method = 'POST', body, config = createConfig() }) {
  const previousConfig = process.env.TOKI_FAQ_RESPONSES;
  if (config === null) delete process.env.TOKI_FAQ_RESPONSES;
  else process.env.TOKI_FAQ_RESPONSES = JSON.stringify(config);

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
    if (previousConfig === undefined) delete process.env.TOKI_FAQ_RESPONSES;
    else process.env.TOKI_FAQ_RESPONSES = previousConfig;
  }
}

test('matches family questions server-side and returns only the requested answer', () => {
  const response = invokeHandler({
    body: { query: 'What does his father do?' }
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.reply, 'TEST-EN-fatherWork');
  assert.deepEqual(response.payload.links, []);
  assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('answers father, mother, and sister questions with only that relative’s FAQ', () => {
  const father = invokeHandler({ body: { query: 'sadman er baba' } });
  const mother = invokeHandler({ body: { query: 'sadman er ma' } });
  const sister = invokeHandler({ body: { query: 'sadman er bon' } });

  assert.equal(father.payload.reply, 'TEST-BN-fatherWork');
  assert.equal(mother.payload.reply, 'TEST-BN-motherWork');
  assert.equal(sister.payload.reply, 'TEST-BN-familySisterMarital');
});

test('only combines parents when both are mentioned', () => {
  const fatherOnly = invokeHandler({ body: { query: 'sadman er baba' } });
  const bothParents = invokeHandler({ body: { query: 'baba ma ki kore?' } });

  assert.equal(fatherOnly.payload.reply, 'TEST-BN-fatherWork');
  assert.equal(bothParents.payload.reply, 'TEST-BN-parentsWork');
});

test('detects Bengali questions and returns the Bengali response', () => {
  const response = invokeHandler({
    body: { query: 'বাবার পেশা কী?' }
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.reply, 'TEST-BN-fatherWork');
});

test('broad family questions do not disclose the individual answers', () => {
  const response = invokeHandler({
    body: { query: 'Tell me about his family' }
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.reply, 'TEST-EN-familyBroad');
  assert.doesNotMatch(response.payload.reply, /fatherWork|motherWork|sisterCount/);
});

test('combines sister facts only when both count and marital status are requested', () => {
  const response = invokeHandler({
    body: { query: 'How many sisters does he have and are they married?' }
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.reply, 'TEST-EN-sisterCountAndMarital');
});

test('answers non-family portfolio questions through the same endpoint', () => {
  const response = invokeHandler({
    body: { query: 'What are his skills?' }
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.reply, 'TEST-EN-skills');
  assert.deepEqual(response.payload.links, ['skills']);
});

test('answers marital-status questions with the configured relationship FAQ', () => {
  const response = invokeHandler({
    body: { query: 'Is Sadman married?' }
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.payload.reply, 'TEST-EN-relationshipStatus');
});

test('answers relationship-status questions with the configured relationship FAQ', () => {
  const single = invokeHandler({ body: { query: 'sadman singel' } });
  const married = invokeHandler({ body: { query: 'sadman single' } });
  const bangla = invokeHandler({ body: { query: 'sadman er biye hoiche?' } });

  assert.equal(single.payload.reply, 'TEST-EN-relationshipStatus');
  assert.equal(married.payload.reply, 'TEST-EN-relationshipStatus');
  assert.equal(bangla.payload.reply, 'TEST-BN-relationshipStatus');
});

test('reports missing FAQ configuration and invalid requests explicitly', () => {
  const missingConfig = invokeHandler({
    body: { query: 'What does his father do?' },
    config: null
  });
  const methodResponse = invokeHandler({ method: 'GET' });
  const inputResponse = invokeHandler({ body: { query: '   ' } });
  const lengthResponse = invokeHandler({ body: { query: 'x'.repeat(1001) } });

  assert.equal(missingConfig.statusCode, 503);
  assert.match(missingConfig.payload.error, /not configured/i);
  assert.equal(methodResponse.statusCode, 405);
  assert.equal(methodResponse.headers.Allow, 'POST');
  assert.equal(inputResponse.statusCode, 400);
  assert.equal(lengthResponse.statusCode, 413);
});
