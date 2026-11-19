const familyQuestionPattern = /\b(?:family|father|dad|papa|mother|mom|mum|sister|sibling|brother|parents?|single|married|marriage|marital|wife|spouse|husband|girlfriend|boyfriend|relationship)\b|(?:পরিবার|পারিবারিক|বাবা|পিতা|আব্বা|আব্বু|মা|আম্মু|বোন|ভাই|বিয়ে|বিয়ে|বিবাহ|বউ|স্ত্রী|স্বামী|প্রেমিকা|প্রেমিক)|\b(?:poribar|baba|babar|abbu|abbar|abba|ma|maa|ammu|bon|boner|boro|bhai|biye|biyer|bou|bow|strii)\b/iu;
const nameQuestionPattern = /\b(?:sister|sibling|parents?|father|dad|papa|mother|mom|mum)\b.*\b(?:name|called|identity)\b|\b(?:name|called|identity)\b.*\b(?:sister|sibling|parents?|father|dad|papa|mother|mom|mum)\b|\bwho\s+is\s+(?:his|sadman's|your)?\s*(?:sister|sibling|parents?|father|dad|papa|mother|mom|mum)\b|(?:বোন|বাবা|মা).{0,25}(?:নাম|কে)/iu;
const sisterMaritalPattern = /\b(?:(?:is|was)\s+(?:his|sadman's|your)?\s*(?:older|elder|big)?\s*sisters?\s+married|(?:sisters?|siblings?)\b.*\b(?:married|marriage|marital status)\b|\b(?:married|marriage|marital status)\b.*\b(?:sisters?|siblings?)\b)\b|(?:বোন|বড় বোন|বড় বোন).{0,35}(?:বিয়ে|বিয়ে|বিবাহ)|(?:bon|boner|boro bon).{0,35}(?:biye|biyer|bibah|married)/iu;
const parentsWorkPattern = /\b(?:what\s+do\s+(?:his|sadman's|your)?\s*parents\s+do|parents?(?:'s?)?\s+(?:jobs?|occupations?|professions?|work)|(?:jobs?|occupations?|professions?)\s+of\s+(?:his|sadman's|your)?\s*parents)\b|(?:মা.?বাবা|পিতা.?মাতা).{0,35}(?:কি|কী|করেন|পেশা|কাজ)/iu;
const fatherWorkPattern = /\bwhat\s+(?:does|is)\s+(?:his|sadman's|your)?\s*(?:father|dad|papa)\s+(?:do|job|occupation|profession)\b|\b(?:father|dad|papa)(?:'s)?\b.{0,35}\b(?:job|occupation|profession|work)\b|\b(?:is|does)\s+(?:his|sadman's|your)?\s*(?:father|dad|papa)\s+(?:a\s+)?[\p{L}-]+(?:\s+[\p{L}-]+)?\b|(?:বাবা|পিতা|আব্বা|আব্বু|বাবার).{0,35}(?:কি|কী|করেন|পেশা)|(?:baba|babar|abbu|abbar|abba).{0,35}(?:ki|kore|koren|pesha)\b/iu;
const motherWorkPattern = /\bwhat\s+(?:does|is)\s+(?:his|sadman's|your)?\s*(?:mother|mom|mum)\s+(?:do|job|occupation|profession)\b|\b(?:mother|mom|mum)(?:'s)?\b.{0,35}\b(?:job|occupation|profession|work)\b|\b(?:is|does)\s+(?:his|sadman's|your)?\s*(?:mother|mom|mum)\s+(?:a\s+)?[\p{L}-]+(?:\s+[\p{L}-]+)?\b|(?:মা|মায়ের|মায়ের|আম্মু|আম্মুর).{0,35}(?:কি|কী|করেন|পেশা)|(?:ma|maa|ammu|ammar|mar).{0,35}(?:ki|kore|koren|pesha)\b/iu;
const sisterCountPattern = /\b(?:(?:does|do)\s+(?:he|sadman)\s+have\s+(?:an?\s+)?(?:older|elder|big\s+)?sisters?|how\s+many\s+sisters?|(?:has|have)\s+(?:an?\s+)?(?:older|elder|big\s+)?sister|(?:any|number of)\s+sisters?|siblings)\b|(?:বড়|বড়)\s*বোন.{0,25}(?:আছে|কয়জন|কতজন)|বোন.{0,25}(?:আছে|কয়জন|কতজন)|(?:amar|tar|sadmaner).{0,25}(?:bon|boner).{0,25}(?:ache|ase|koyjon)/iu;
const broadFamilyPattern = /\b(?:family|family background|family members|family details)\b|পরিবার|পারিবারিক|poribar/iu;
const parentPairPattern = /\b(?:father|dad|papa)\b.{0,35}\b(?:mother|mom|mum)\b|\b(?:mother|mom|mum)\b.{0,35}\b(?:father|dad|papa)\b|(?:বাবা|পিতা|আব্বা|আব্বু).{0,35}(?:মা|আম্মু)|(?:মা|আম্মু).{0,35}(?:বাবা|পিতা|আব্বা|আব্বু)|(?:baba|babar|abbu|abbar|abba).{0,35}(?:ma|maa|ammu|ammar)|(?:ma|maa|ammu|ammar).{0,35}(?:baba|babar|abbu|abbar|abba)/iu;

function isBangla(query) {
  return /[\u0980-\u09FF]/u.test(query)
    || /\b(?:amar|apnar|tomar|tar|ke|kemon|kothay|ki|bolo|bolun|porashona|jogajog|biye|biyer|bou|bow|strii|baba|babar|abbu|abbar|abba|ma|maa|ammu|bon|boner|boro|poribar|bebsha|bebosha|byabsha|byabosha|pesha|koren|kore|ache|ase|koyjon|grihini)\b/iu.test(query);
}

function getFact(name, language) {
  const value = process.env[`TOKI_FAMILY_${name}_${language}`];
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function answerFor(query) {
  const bangla = isBangla(query);
  const language = bangla ? 'BN' : 'EN';
  const facts = [];

  if (nameQuestionPattern.test(query)) {
    return {
      reply: bangla
        ? 'পরিবারের সদস্যদের নাম সম্পর্কে আমার কাছে তথ্য নেই।'
        : "I don't have the family members' names."
    };
  }

  const parentsWork = parentsWorkPattern.test(query) || parentPairPattern.test(query);
  const asksFather = parentsWork || fatherWorkPattern.test(query);
  const asksMother = parentsWork || motherWorkPattern.test(query);
  const asksSisterCount = sisterCountPattern.test(query);
  const asksSisterMaritalStatus = sisterMaritalPattern.test(query);

  if (asksFather) facts.push(['FATHER', bangla ? 'সাদমানের বাবা' : "Sadman's father"]);
  if (asksMother) facts.push(['MOTHER', bangla ? 'সাদমানের মা' : "Sadman's mother"]);
  if (asksSisterCount) facts.push(['SISTER_COUNT', bangla ? 'সাদমানের' : 'Sadman']);
  if (asksSisterMaritalStatus) facts.push(['SISTER_MARITAL_STATUS', bangla ? 'বড় বোনের' : "Sadman's older sister"]);

  if (facts.length === 0) {
    return {
      reply: broadFamilyPattern.test(query)
        ? bangla
          ? 'পরিবারের কোন নির্দিষ্ট বিষয়টি জানতে চান—বাবা, মা, নাকি বোন?'
          : 'Which specific family detail would you like to know about—his father, mother, or sister?'
        : bangla
          ? 'এই পারিবারিক তথ্যটি আমার কাছে নেই।'
          : "I don't have that family detail."
    };
  }

  const answers = [];
  for (const [name, subject] of facts) {
    const value = getFact(name, language);
    if (!value) {
      return {
        status: 503,
        error: 'The family FAQ is not configured for this language.'
      };
    }

    answers.push(bangla ? `${subject} ${value}।` : `${subject} ${value}.`);
  }

  return { reply: answers.join(' ') };
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
  if (!familyQuestionPattern.test(query)) {
    return res.status(400).json({ error: 'Ask a family-related question.' });
  }

  const result = answerFor(query.trim());
  if (result.status) {
    return res.status(result.status).json({ error: result.error });
  }
  return res.status(200).json({ reply: result.reply, links: [] });
}

module.exports = handler;
