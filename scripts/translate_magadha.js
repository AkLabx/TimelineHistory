
import fs from 'fs';
import path from 'path';

const API_KEY = process.env.Gemini_API_KEY;

if (!API_KEY) {
  console.error("Error: Gemini_API_KEY environment variable is not set.");
  process.exit(1);
}

const FILES_TO_TRANSLATE = [
    'src/content/dynasties/magadha.json',
    // Haryanka
    'src/content/kings/bimbisara.json',
    'src/content/kings/ajatashatru.json',
    'src/content/kings/udayin.json',
    'src/content/kings/nagadashaka.json',
    // Shishunaga
    'src/content/kings/shishunaga.json',
    'src/content/kings/kalashoka.json',
    'src/content/kings/mahanandin.json',
    // Nanda
    'src/content/kings/nanda-intro.json',
    'src/content/kings/mahapadma-nanda.json',
    'src/content/kings/dhanananda.json',
    // Dashboard
    'src/content/parts/dashboard.json'
];

async function translateText(text) {
  if (!text) return "";
  const prompt = `Translate the following Hindi text to English. Maintain the tone and historical context. Return ONLY the translated text, no markdown or explanations.\n\nText: "${text}"`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          contents: [{
              parts: [{ text: prompt }]
          }]
      })
  });

  if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return translated ? translated.trim() : "";
}

async function translateContentHtml(html) {
  if (!html) return "";
  const prompt = `Translate the text content within this HTML from Hindi to English. Keep the HTML structure, classes, and tags EXACTLY as they are. Do not translate class names or ids. Return ONLY the translated HTML string.\n\nHTML: "${html}"`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          contents: [{
              parts: [{ text: prompt }]
          }]
      })
  });

  if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const translated = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  // Clean up any markdown code blocks if the model adds them
  let clean = translated ? translated.trim() : "";
  if (clean.startsWith('```html')) clean = clean.replace('```html', '').replace('```', '');
  else if (clean.startsWith('```')) clean = clean.replace('```', '').replace('```', '');

  return clean.trim();
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function processFile(filepath) {
  console.log(`Processing: ${filepath}`);
  const fullPath = path.resolve(process.cwd(), filepath);

  if (!fs.existsSync(fullPath)) {
      console.error(`File not found: ${fullPath}`);
      return;
  }

  let content;
  try {
      content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
  } catch (e) {
      console.error(`Error parsing JSON: ${filepath}`, e);
      return;
  }

  let changed = false;

  // 1. Translate content (HTML)
  if (content.content && !content.content_en) {
      console.log(`  Translating content...`);
      try {
        content.content_en = await translateContentHtml(content.content);
        changed = true;
        await sleep(12000); // 12 sec pause
      } catch(e) { console.error("Error translating content", e); }
  }

  // 2. Translate summary fields
  if (content.summary) {
      if (content.summary.title && !content.summary.title_en) {
           console.log(`  Translating summary.title...`);
           try {
             content.summary.title_en = await translateText(content.summary.title);
             changed = true;
             await sleep(12000);
           } catch(e) { console.error("Error translating summary.title", e); }
      }
      if (content.summary.founder && !content.summary.founder_en) {
            console.log(`  Translating summary.founder...`);
            try {
                content.summary.founder_en = await translateText(content.summary.founder);
                changed = true;
                await sleep(12000);
            } catch(e) { console.error("Error translating summary.founder", e); }
      }
       if (content.summary.capital && !content.summary.capital_en) {
            console.log(`  Translating summary.capital...`);
            try {
                content.summary.capital_en = await translateText(content.summary.capital);
                changed = true;
                await sleep(12000);
            } catch(e) { console.error("Error translating summary.capital", e); }
      }
      // Note: 'period' usually contains numbers or 'c.', but might have Hindi text.
      // Let's skip period for now unless requested, as it's often language neutral or simple enough.
      // User said "Should I also translate fields like founder and capital... Yes".
      // Let's assume period is fine or I can check if it has Hindi chars.
  }

  // 3. Handle dashboard.json structure (array of items)
  if (content.timelineCards && Array.isArray(content.timelineCards)) {
      for (const card of content.timelineCards) {
          if (card.title && !card.title_en) {
               console.log(`  Translating card.title: ${card.title}`);
               try {
                card.title_en = await translateText(card.title);
                changed = true;
                await sleep(12000);
               } catch(e) { console.error("Error translating card title", e); }
          }
      }
  }

  // 4. Handle dynasty items array (e.g. in magadha.json)
  if (content.items && Array.isArray(content.items)) {
      for (const item of content.items) {
          if (item.summary) {
             if (item.summary.title && !item.summary.title_en) {
                  console.log(`  Translating item.summary.title: ${item.summary.title}`);
                  try {
                    item.summary.title_en = await translateText(item.summary.title);
                    changed = true;
                    await sleep(12000);
                  } catch(e) { console.error("Error translating item summary title", e); }
             }
             if (item.summary.founder && !item.summary.founder_en) {
                  console.log(`  Translating item.summary.founder: ${item.summary.founder}`);
                  try {
                    item.summary.founder_en = await translateText(item.summary.founder);
                    changed = true;
                    await sleep(12000);
                  } catch(e) { console.error("Error translating item summary founder", e); }
             }
             if (item.summary.capital && !item.summary.capital_en) {
                  console.log(`  Translating item.summary.capital: ${item.summary.capital}`);
                  try {
                    item.summary.capital_en = await translateText(item.summary.capital);
                    changed = true;
                    await sleep(12000);
                  } catch(e) { console.error("Error translating item summary capital", e); }
             }
          }
           // event-details type content
          if (item.type === 'event-details' && item.content && !item.content_en) {
              console.log(`  Translating event content...`);
              try {
                item.content_en = await translateContentHtml(item.content);
                changed = true;
                await sleep(12000);
              } catch(e) { console.error("Error translating event content", e); }
          }
      }
  }

  // 5. Root title
  if (content.title && !content.title_en) {
       console.log(`  Translating root title...`);
       try {
        content.title_en = await translateText(content.title);
        changed = true;
        await sleep(12000);
       } catch(e) { console.error("Error translating root title", e); }
  }


  if (changed) {
      fs.writeFileSync(fullPath, JSON.stringify(content, null, 2));
      console.log(`  Saved ${filepath}`);
  } else {
      console.log(`  No changes for ${filepath}`);
  }
}

async function main() {
  for (const file of FILES_TO_TRANSLATE) {
      await processFile(file);
  }
}

main();
