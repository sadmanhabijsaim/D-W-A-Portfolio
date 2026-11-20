const familyNamePattern = /\b(?:sister|sibling|parents?|father|dad|papa|mother|mom|mum)\b.*\b(?:name|called|identity)\b|\b(?:name|called|identity)\b.*\b(?:sister|sibling|parents?|father|dad|papa|mother|mom|mum)\b|\bwho\s+is\s+(?:his|sadman's|your)?\s*(?:sister|sibling|parents?|father|dad|papa|mother|mom|mum)\b|(?:বোন|বাবা|মা).{0,25}(?:নাম|কে)/iu;
const sisterMaritalPattern = /\b(?:(?:is|was)\s+(?:his|sadman's|your)?\s*(?:older|elder|big)?\s*sisters?\s+married|(?:sisters?|siblings?)\b.*\b(?:married|marriage|marital status)\b|\b(?:married|marriage|marital status)\b.*\b(?:sisters?|siblings?)\b)\b|(?:বোন|বড় বোন|বড় বোন).{0,35}(?:বিয়ে|বিয়ে|বিবাহ)|(?:bon|boner|boro bon).{0,35}(?:biye|biyer|bibah|married)/iu;
const parentsWorkPattern = /\b(?:what\s+do\s+(?:his|sadman's|your)?\s*parents\s+do|parents?(?:'s?)?\s+(?:jobs?|occupations?|professions?|work)|(?:jobs?|occupations?|professions?)\s+of\s+(?:his|sadman's|your)?\s*parents)\b|(?:মা.?বাবা|পিতা.?মাতা).{0,35}(?:কি|কী|করেন|পেশা|কাজ)/iu;
const parentPairPattern = /\b(?:father|dad|papa)\b.{0,35}\b(?:mother|mom|mum)\b|\b(?:mother|mom|mum)\b.{0,35}\b(?:father|dad|papa)\b|(?:বাবা|পিতা|আব্বা|আব্বু).{0,35}(?:মা|আম্মু)|(?:মা|আম্মু).{0,35}(?:বাবা|পিতা|আব্বা|আব্বু)|\b(?:baba|babar|abbu|abbar|abba)\b.{0,35}\b(?:ma|maa|ammu|ammar)\b|\b(?:ma|maa|ammu|ammar)\b.{0,35}\b(?:baba|babar|abbu|abbar|abba)\b/iu;
const combinedParentsWorkPattern = new RegExp(`(?:${parentsWorkPattern.source})|(?:${parentPairPattern.source})`, 'iu');
const fatherWorkPattern = /\bwhat\s+(?:does|is)\s+(?:his|sadman's|your)?\s*(?:father|dad|papa)\s+(?:do|job|occupation|profession)\b|\b(?:father|dad|papa)(?:'s)?\b.{0,35}\b(?:job|occupation|profession|work)\b|\b(?:is|does)\s+(?:his|sadman's|your)?\s*(?:father|dad|papa)\s+(?:a\s+)?[\p{L}-]+(?:\s+[\p{L}-]+)?\b|(?:বাবা|পিতা|আব্বা|আব্বু|বাবার).{0,35}(?:কি|কী|করেন|পেশা)|(?:baba|babar|abbu|abbar|abba).{0,35}(?:ki|kore|koren|pesha)\b/iu;
const motherWorkPattern = /\bwhat\s+(?:does|is)\s+(?:his|sadman's|your)?\s*(?:mother|mom|mum)\s+(?:do|job|occupation|profession)\b|\b(?:mother|mom|mum)(?:'s)?\b.{0,35}\b(?:job|occupation|profession|work)\b|\b(?:is|does)\s+(?:his|sadman's|your)?\s*(?:mother|mom|mum)\s+(?:a\s+)?[\p{L}-]+(?:\s+[\p{L}-]+)?\b|(?:মা|মায়ের|মায়ের|আম্মু|আম্মুর).{0,35}(?:কি|কী|করেন|পেশা)|(?:ma|maa|ammu|ammar|mar).{0,35}(?:ki|kore|koren|pesha)\b/iu;
const sisterCountPattern = /\b(?:(?:does|do)\s+(?:he|sadman)\s+have\s+(?:an?\s+)?(?:older|elder|big\s+)?sisters?|how\s+many\s+sisters?|(?:has|have)\s+(?:an?\s+)?(?:older|elder|big\s+)?sister|(?:any|number of)\s+sisters?|siblings)\b|(?:বড়|বড়)\s*বোন.{0,25}(?:আছে|কয়জন|কতজন)|বোন.{0,25}(?:আছে|কয়জন|কতজন)|(?:amar|tar|sadmaner).{0,25}(?:bon|boner).{0,25}(?:ache|ase|koyjon)/iu;
const fatherAboutPattern = /\b(?:tell me about|describe|information about|details about|about)\s+(?:(?:his|sadman's|your)\s+)?(?:father|dad|papa)\b|\b(?:father|dad|papa|baba|babar|abbu|abbar|abba)\b|\b(?:baba|babar|abbu|abbar|abba)(?:\s+er)?\s+(?:somporke|shomporke|bepar[e]?|bisoye)\b|(?:বাবা|বাবার|পিতা|পিতার|আব্বা|আব্বার).{0,20}(?:সম্পর্কে|সম্বন্ধে|বিষয়ে|বিষয়ে)|(?:বাবা|পিতা|আব্বা|আব্বু)/iu;
const motherAboutPattern = /\b(?:tell me about|describe|information about|details about|about)\s+(?:(?:his|sadman's|your)\s+)?(?:mother|mom|mum)\b|\b(?:mother|mom|mum|ma|maa|mar|maer|mayer|ammu|ammar|ammur)\b|\b(?:ma|maa|mar|maer|mayer|ammu|ammar|ammur)(?:\s+er)?\s+(?:somporke|shomporke|bepar[e]?|bisoye)\b|(?:মা|মায়ের|মায়ের|আম্মু|আম্মুর).{0,20}(?:সম্পর্কে|সম্বন্ধে|বিষয়ে|বিষয়ে)|(?:মা|আম্মু)/iu;
const sisterAboutPattern = /\b(?:tell me about|describe|information about|details about|about)\s+(?:(?:his|sadman's|your)\s+)?(?:older\s+|elder\s+)?sister\b|\b(?:sisters?|(?:boro\s+)?bon(?:er)?)\b|\b(?:boro\s+)?bon(?:er|\s+er)?\s+(?:somporke|shomporke|bepar[e]?|bisoye)\b|(?:বড়?\s*)?বোন(?:ের)?\s*.{0,20}(?:সম্পর্কে|সম্বন্ধে|বিষয়ে|বিষয়ে)|(?:বড়?\s*)?বোন/iu;
const broadFamilyPattern = /\b(?:family|family background|family members|family details)\b|পরিবার|পারিবারিক|poribar/iu;
const familyUnknownPattern = /\b(?:father|dad|papa|mother|mom|mum|sister|sibling|brother|parents?)\b|(?:বাবা|পিতা|আব্বা|আব্বু|মা|আম্মু|বোন|ভাই)|\b(?:baba|babar|abbu|abbar|abba|ma|maa|ammu|bon|boner|bhai|poribar)\b/iu;
const relationshipStatusPattern = /\b(?:single|singel|married|marriage|marital status|biye|biyer|bibah|obibahito)\b|বিয়ে|বিয়ে|বিবাহ|সিঙ্গেল|অবিবাহিত/iu;
const notListedPattern = /\b(?:age|old|birthday|birth date|salary|religion|favorite|favourite|wife|spouse|husband|girlfriend|boyfriend|relationship)\b|বয়স|বয়স|জন্মদিন|জন্মতারিখ|ধর্ম|প্রিয়|প্রিয়|বউ|স্ত্রী|স্বামী|প্রেমিকা|প্রেমিক/iu;
const faqRules = [
  { id: 'familyName', pattern: familyNamePattern },
  { id: 'familySisterMarital', pattern: sisterMaritalPattern },
  { id: 'parentsWork', pattern: combinedParentsWorkPattern },
  { id: 'fatherWork', pattern: fatherWorkPattern },
  { id: 'motherWork', pattern: motherWorkPattern },
  { id: 'sisterCount', pattern: sisterCountPattern },
  { id: 'fatherWork', pattern: fatherAboutPattern },
  { id: 'motherWork', pattern: motherAboutPattern },
  { id: 'familySisterMarital', pattern: sisterAboutPattern },
  { id: 'familyBroad', pattern: broadFamilyPattern },
  { id: 'familyUnknown', pattern: familyUnknownPattern },
  { id: 'relationshipStatus', pattern: relationshipStatusPattern },
  { id: 'notListed', pattern: notListedPattern },
  { id: 'location', pattern: /\b(?:location|live|lives|from|hometown|kothay)\b|কোথায়|কোথায়|থাকে|ঠিকানা/iu },
  { id: 'experience', pattern: /\b(?:experience|years? of experience|oviggota)\b|অভিজ্ঞতা|বছর/iu },
  { id: 'education', pattern: /\b(?:education|stud(?:y|ies)|university|degree|batch|class rep(?:resentative)?)\b|পড়াশোনা|পড়াশোনা|শিক্ষা|বিশ্ববিদ্যালয়|বিশ্ববিদ্যালয়|ব্যাচ|সিআর|porashona|shikkha|bishwobidyaloy/iu },
  { id: 'skills', pattern: /\b(?:skills?|tech stack|technologies|technology|expertise|programming languages?|linux|cyber\s?security|command line|terminal)\b|স্কিল|দক্ষতা|টেকনোলজি|প্রযুক্তি|সাইবার সিকিউরিটি|লিনাক্স|dokkota|projukti/iu },
  { id: 'projects', pattern: /\b(?:projects?|work samples?|jam|meal\s?master(?:\s?pro)?|meal\s?hishab|job application tracker|jobtracker)\b|প্রজেক্ট|প্রকল্প|prokolpo/iu },
  { id: 'certificates', pattern: /\b(?:certificates?|certifications?|cs301|computer architecture|saylor university|intellipaat)\b|সার্টিফিকেট|সনদ|sonod/iu },
  { id: 'cv', pattern: /\b(?:cv|resume|résumé)\b|সিভি/iu },
  { id: 'contact', pattern: /\b(?:contact|email|e-mail|phone|reach(?: out)?|jogajog|numbar)\b|যোগাযোগ|ইমেইল|ইমেল|ফোন|নম্বর/iu },
  { id: 'social', pattern: /\b(?:github|git hub|linkedin|social links?)\b|গিটহাব|লিংকডইন/iu },
  { id: 'profile', pattern: /\b(?:profile|about|who is|who's|what does (?:sadman|he) do|full name|name|student|developer|job|occupation|profession|role)\b|পরিচয়|পরিচয়|নাম|কে|porichoy|nam|ke/iu },
  { id: 'portfolio', pattern: /\b(?:portfolio|website|site|links?|urls?)\b|পোর্টফোলিও|ওয়েবসাইট|ওয়েবসাইট|লিংক/iu }
];
const requiredResponseIds = [
  ...faqRules.map(({ id }) => id),
  'sisterCountAndMarital',
  'fallback'
];

function isValidResponse(response) {
  return response
    && typeof response.bn === 'string'
    && typeof response.en === 'string'
    && Array.isArray(response.links)
    && response.links.every((link) => typeof link === 'string');
}

function loadResponses() {
  const rawResponses = process.env.TOKI_FAQ_RESPONSES;
  if (!rawResponses) {
    console.error('Toki FAQ response configuration is missing from the server environment.');
    return null;
  }

  let config;
  try {
    config = JSON.parse(rawResponses);
  } catch (error) {
    console.error('Toki FAQ response configuration is not valid JSON:', error);
    return null;
  }

  if (
    !config
    || typeof config !== 'object'
    || Array.isArray(config)
    || typeof config.banglaPattern !== 'string'
    || !config.answers
    || typeof config.answers !== 'object'
    || Array.isArray(config.answers)
  ) {
    console.error('Toki FAQ response configuration must include a language pattern and answer map.');
    return null;
  }

  try {
    new RegExp(config.banglaPattern, 'iu');
  } catch (error) {
    console.error('Toki FAQ language pattern is invalid:', error);
    return null;
  }

  if (!requiredResponseIds.every((id) => isValidResponse(config.answers[id]))) {
    console.error('Toki FAQ response configuration is missing required or valid answers.');
    return null;
  }
  return config;
}

function getResponseId(query) {
  const asksSisterCount = sisterCountPattern.test(query);
  const asksSisterMarital = sisterMaritalPattern.test(query);
  if (asksSisterCount && asksSisterMarital) return 'sisterCountAndMarital';

  return faqRules.find(({ pattern }) => pattern.test(query))?.id || 'fallback';
}

function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const query = req.body?.query;
  if (typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'A question is required.' });
  }
  if (query.length > 1000) {
    return res.status(413).json({ error: 'The question is too long.' });
  }

  const config = loadResponses();
  if (!config) {
    return res.status(503).json({ error: 'Toki FAQ is not configured.' });
  }

  const normalizedQuery = query.trim();
  const bangla = /[\u0980-\u09FF]/u.test(normalizedQuery)
    || new RegExp(config.banglaPattern, 'iu').test(normalizedQuery);
  const response = config.answers[getResponseId(normalizedQuery)];
  return res.status(200).json({
    reply: bangla ? response.bn : response.en,
    links: response.links
  });
}

module.exports = handler;
