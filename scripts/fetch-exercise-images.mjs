#!/usr/bin/env node
// scripts/fetch-exercise-images.mjs
//
// One-time setup: queries the ExerciseDB API (free tier on RapidAPI) by exercise
// name and writes GIF URLs back to exercise-images.js.
//
// USAGE:
//   node scripts/fetch-exercise-images.mjs YOUR_RAPIDAPI_KEY
//
// HOW TO GET A FREE API KEY (500 req/month, no credit card):
//   1. Sign up at https://rapidapi.com
//   2. Go to https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
//   3. Click "Subscribe to Test" → choose BASIC (free)
//   4. Copy your key from the Code Snippets panel
//
// This script uses ~35 API requests (one per exercise that has a search term).
// It skips exercises that already have a URL in exercise-images.js.
// Re-run any time to fill gaps or refresh URLs.

import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_FILE = resolve(__dirname, "../exercise-images.js");
const BASE_URL = "https://exercisedb.p.rapidapi.com";

// ─── Name → ExerciseDB search term ───────────────────────────────────────────
// null  = no equivalent in ExerciseDB (breathing protocols, stick exercises, etc.)
// These are approximate — the API returns closest name match
const SEARCH_TERMS = {
  // ── Kinetotherapy ──────────────────────────────────────────────────────────
  kw1: null,                         // Diaphragmatic Breathing (no GIF)
  kw2: "thoracic rotation",          // Seated Thoracic Rotation
  k01: "cat cow",                    // Cat-Cow + Neutral Hold
  k02: null,                         // Towel Roll (no equivalent)
  k03: "bird dog",                   // Bird-Dog
  k04: "dead bug",                   // Dead Bug
  k05: "cobra",                      // Prone Cobra
  k06: "wall angel",                 // Wall Angels
  k07: "hip flexor stretch",         // Hip Flexor Stretch — Kneeling
  k08: "doorway chest stretch",      // Pectoral Doorway Stretch
  k09: "push up plus",               // Serratus Anterior Wall Push-Up Plus
  k10: "foam roller",                // Foam Roller Thoracic
  kc1: "child",                      // Child's Pose
  kc2: "knee to chest",              // Supine Knee-to-Chest
  kc3: null,                         // Postural Reset (no equivalent)
  k11: "superman",                   // Superman / Back Extension
  k12: "glute bridge",               // Glute Bridge
  k13: "clamshell",                  // Side-Lying Clamshell
  k14: "chin tuck",                  // Chin Tucks
  k15: "y raise",                    // Prone Y-T-W Raises
  k16: "thoracic rotation",          // Half-Kneeling Thoracic Rotation
  k17: "single leg glute bridge",    // Single-Leg Glute Bridge
  k18: "side plank",                 // Modified Side Plank
  k19: "bird dog",                   // Bird-Dog + Resistance Band
  k20: "seated row",                 // Seated Rowing with Stick
  k21: null,                         // Single-Leg Balance (no GIF)
  k22: null,                         // Schroth RAB Breathing (no GIF)

  // ── Strength — Day A Push ──────────────────────────────────────────────────
  sw1: null,                         // Joint Circles Warm-Up
  sa1: "incline push up",            // Incline Push-Up
  sa2: "dumbbell shoulder press",    // Dumbbell Shoulder Press
  sa3: "lateral raise",              // Lateral Raise
  sa4: "tricep overhead extension",  // Tricep Overhead Extension
  sa5: null,                         // Stick Chest Pass (no equivalent)
  sa6: "dumbbell floor press",       // Dumbbell Floor Press
  sa7: "push up",                    // Scapular Push-Up Isolation
  sa8: "wide push up",               // Archer Push-Up
  sa9: "close grip push up",         // Slow-Tempo / Diamond Push-Up
  sa10: "dumbbell chest press",      // Single-Arm Floor Press

  // ── Strength — Day B Pull ──────────────────────────────────────────────────
  sb1: "dumbbell one arm row",       // One-Arm Dumbbell Row
  sb2: "dumbbell bicep curl",        // Bicep Curl
  sb3: "dumbbell reverse fly",       // Dumbbell Reverse Fly
  sb4: "face pull",                  // Face Pull
  sb5: null,                         // Stick Pull-Apart (no equivalent)
  sb6: "hammer curl",                // Hammer Curl
  sb7: "external rotation",          // Shoulder External Rotation — Side-Lying
  sb8: "y raise",                    // Prone I-Y-T Raises
  sb9: "inverted row",               // Inverted Row — Table Edge
  sb10: "inverted row",              // Inverted Row — Feet Elevated

  // ── Strength — Day C Legs/Core ─────────────────────────────────────────────
  sc1: "goblet squat",               // Goblet Squat
  sc2: "romanian deadlift",          // Romanian Deadlift — Light
  sc3: "reverse lunge",              // Reverse Lunge
  sc4: "sumo squat",                 // Stick-Assisted Sumo Squat
  sc5: "plank",                      // Plank
  sc5b: "pallof press",              // Pallof Press
  sc6: "glute bridge",               // Glute Bridge — Loaded
  sc7: "walking lunge",              // Walking Lunge with Stick Overhead
  sc8: "bulgarian split squat",      // Bulgarian Split Squat
  sc9: "romanian deadlift",          // Romanian Deadlift — Heavier

  // ── Cardio / Breathing ─────────────────────────────────────────────────────
  ca_z2: null,
  ca_2x4: null,
  ca_3x4: null,
  ca_4x4: null,
  br_d: null,
  br_box: null,
  br_te: null,
  br_478: null,
  br_nasal: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function searchExercise(name, apiKey) {
  const encoded = encodeURIComponent(name.toLowerCase());
  const url = `${BASE_URL}/exercises/name/${encoded}?limit=3&offset=0`;
  const res = await fetch(url, {
    headers: {
      "x-rapidapi-host": "exercisedb.p.rapidapi.com",
      "x-rapidapi-key": apiKey,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 120)}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function parseExistingImages(fileContent) {
  // Extract the object literal from "export default { ... };"
  const match = fileContent.match(/export default\s*\{([^}]*)\}/s);
  if (!match) return {};
  const body = match[1].trim();
  if (!body) return {};
  const result = {};
  // Parse "key": "value" pairs (handles both quoted and unquoted keys)
  const lineRe = /["']?([\w-]+)["']?\s*:\s*["']([^"']+)["']/g;
  let m;
  while ((m = lineRe.exec(body)) !== null) {
    result[m[1]] = m[2];
  }
  return result;
}

function buildFileContent(imageMap) {
  const entries = Object.entries(imageMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `  "${k}": "${v}"`)
    .join(",\n");
  return `// Auto-generated by scripts/fetch-exercise-images.mjs
// To refresh: node scripts/fetch-exercise-images.mjs YOUR_RAPIDAPI_KEY
//
// You can manually add or override any URL here:
//   "k03": "https://v2.exercisedb.io/image/...",       ← ExerciseDB GIF
//   "k03": "https://www.youtube.com/watch?v=...",       ← YouTube embed
//   "k03": "https://example.com/clip.mp4",              ← direct video
//
// Supported types (auto-detected by the app):
//   • Any image/gif URL              → <img>
//   • youtube.com / youtu.be URL     → <iframe> embed
//   • .mp4 / .webm URL               → <video> player

export default {
${entries}
};
`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const apiKey = process.argv[2];
if (!apiKey) {
  console.error(
    "\n  Usage: node scripts/fetch-exercise-images.mjs YOUR_RAPIDAPI_KEY\n\n" +
    "  Get a free key (500 req/month):\n" +
    "    1. Sign up at https://rapidapi.com\n" +
    "    2. Go to https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb\n" +
    "    3. Subscribe to the BASIC (free) plan\n" +
    "    4. Copy your key from the Code Snippets panel\n"
  );
  process.exit(1);
}

// Load existing URLs to avoid burning API requests on already-resolved exercises
let existing = {};
try {
  const fileContent = readFileSync(IMAGES_FILE, "utf8");
  existing = parseExistingImages(fileContent);
} catch {}

const toFetch = Object.entries(SEARCH_TERMS).filter(
  ([id, term]) => term !== null && !existing[id]
);

const skipped  = Object.keys(SEARCH_TERMS).filter(id => SEARCH_TERMS[id] === null);
const alreadyDone = Object.keys(SEARCH_TERMS).filter(
  id => SEARCH_TERMS[id] !== null && existing[id]
);

console.log(`\n  ExerciseDB image fetcher`);
console.log(`  ──────────────────────────────`);
console.log(`  Already resolved : ${alreadyDone.length}`);
console.log(`  Skipped (no term): ${skipped.length}`);
console.log(`  To fetch         : ${toFetch.length}\n`);

if (toFetch.length === 0) {
  console.log("  Nothing to do. All exercises already have URLs. ✅\n");
  process.exit(0);
}

const imageMap = { ...existing };
const found = [];
const missed = [];

for (const [id, searchTerm] of toFetch) {
  process.stdout.write(`  [${id}] searching "${searchTerm}" … `);
  try {
    const results = await searchExercise(searchTerm, apiKey);
    if (results.length > 0) {
      // Pick the first result; prefer exact name match if available
      const best = results.find(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()))
                ?? results[0];
      imageMap[id] = best.gifUrl;
      found.push({ id, name: best.name, url: best.gifUrl });
      console.log(`✅ "${best.name}"`);
    } else {
      missed.push({ id, searchTerm });
      console.log("⚠️  no results");
    }
  } catch (err) {
    missed.push({ id, searchTerm, error: err.message });
    console.log(`❌ ${err.message}`);
  }
  // Be polite — ExerciseDB free tier has no explicit rate limit but 500 req/month
  await new Promise(r => setTimeout(r, 250));
}

// Write updated file
writeFileSync(IMAGES_FILE, buildFileContent(imageMap), "utf8");

console.log(`\n  ──────────────────────────────`);
console.log(`  Found   : ${found.length}`);
console.log(`  Missed  : ${missed.length}`);
if (missed.length > 0) {
  console.log(`\n  Missed exercises (add URLs manually to exercise-images.js):`);
  missed.forEach(m => console.log(`    "${m.id}"  (searched: "${m.searchTerm}")`));
}
console.log(`\n  Updated ${IMAGES_FILE}\n`);
console.log("  Restart the dev server to see the images: npm run dev\n");
