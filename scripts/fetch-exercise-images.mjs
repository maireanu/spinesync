#!/usr/bin/env node
// scripts/fetch-exercise-images.mjs
//
// Matches exercises to images from the free yuhonas/free-exercise-db dataset
// (https://github.com/yuhonas/free-exercise-db) and writes URLs to exercise-images.js.
//
// No API key required — downloads the full dataset once (~2MB) and does local matching.
//
// USAGE:
//   node scripts/fetch-exercise-images.mjs
//
// The script skips exercises that already have a URL saved, so re-running is safe.
// To manually add or override a URL, just edit exercise-images.js directly.

import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_FILE = resolve(__dirname, "../exercise-images.js");

// yuhonas/free-exercise-db — completely free, no auth, ~870 exercises with JPG images
const DB_JSON = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const IMG_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

// ─── Name → ExerciseDB search term ───────────────────────────────────────────
// null  = no equivalent in ExerciseDB (breathing protocols, stick exercises, etc.)
// These are approximate — the API returns closest name match
const SEARCH_TERMS = {
  // ── Kinetotherapy ──────────────────────────────────────────────────────────
  kw1: null,                         // Diaphragmatic Breathing (no GIF)
  kw2: "cable internal rotation",     // Seated Thoracic Rotation
  k01: "cat stretch",                // Cat-Cow + Neutral Hold
  k02: null,                         // Towel Roll (no equivalent)
  k03: "hyperextensions back extensions", // Bird-Dog
  k04: "dead bug",                   // Dead Bug
  k05: "hyperextensions back",       // Prone Cobra
  k06: null,                         // Wall Angels (no dataset match)
  k07: "hip flexor stretch",         // Hip Flexor Stretch — Kneeling
  k08: "behind head chest stretch",  // Pectoral Doorway Stretch
  k09: null,                         // Serratus Anterior Wall Push-Up Plus (no dataset match)
  k10: null,                         // Foam Roller (no dataset match)
  kc1: "child",                      // Child's Pose
  kc2: "knee to chest",              // Supine Knee-to-Chest
  kc3: null,                         // Postural Reset (no equivalent)
  k11: "superman",                   // Superman / Back Extension
  k12: "glute bridge",               // Glute Bridge
  k13: "external rotation",          // Side-Lying Clamshell
  k14: null,                         // Chin Tucks (no dataset match)
  k15: "y raise",                    // Prone Y-T-W Raises
  k16: "cable internal rotation",    // Half-Kneeling Thoracic Rotation
  k17: "single leg glute bridge",    // Single-Leg Glute Bridge
  k18: "side plank",                 // Modified Side Plank
  k19: "hyperextensions back extensions", // Bird-Dog + Resistance Band
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
  sa10: "one arm dumbbell bench press", // Single-Arm Floor Press

  // ── Strength — Day B Pull ──────────────────────────────────────────────────
  sb1: "dumbbell one arm row",       // One-Arm Dumbbell Row
  sb2: "dumbbell bicep curl",        // Bicep Curl
  sb3: "reverse fly",                // Dumbbell Reverse Fly
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
  sc4: "wide stance barbell squat",  // Stick-Assisted Sumo Squat
  sc5: "plank",                      // Plank
  sc5b: "pallof press",              // Pallof Press
  sc6: "glute bridge",               // Glute Bridge — Loaded
  sc7: "walking lunge",              // Walking Lunge with Stick Overhead
  sc8: "split squat with dumbbells", // Bulgarian Split Squat
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

/** Find the best matching exercise from the dataset by name. */
function findBest(searchTerm, allExercises) {
  const term = searchTerm.toLowerCase();
  const words = term.split(/\s+/);
  // Exact substring match first
  const exact = allExercises.find(e => e.name.toLowerCase().includes(term));
  if (exact) return exact;
  // All words present
  return allExercises.find(e => {
    const n = e.name.toLowerCase();
    return words.every(w => n.includes(w));
  }) ?? null;
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
// To refresh: node scripts/fetch-exercise-images.mjs
//
// You can manually add or override any URL here:
//   "k03": "https://example.com/exercise.jpg",          ← image/gif
//   "k03": "https://www.youtube.com/watch?v=...",        ← YouTube embed
//   "k03": "https://example.com/clip.mp4",               ← direct video
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

// Load existing URLs to avoid overwriting manually-set entries
let existing = {};
try {
  const fileContent = readFileSync(IMAGES_FILE, "utf8");
  existing = parseExistingImages(fileContent);
} catch {}

const toMatch = Object.entries(SEARCH_TERMS).filter(
  ([id, term]) => term !== null && !existing[id]
);
const skipped     = Object.keys(SEARCH_TERMS).filter(id => SEARCH_TERMS[id] === null);
const alreadyDone = Object.keys(SEARCH_TERMS).filter(
  id => SEARCH_TERMS[id] !== null && existing[id]
);

console.log(`\n  yuhonas/free-exercise-db image matcher`);
console.log(`  ──────────────────────────────────────`);
console.log(`  Already resolved : ${alreadyDone.length}`);
console.log(`  Skipped (no term): ${skipped.length}`);
console.log(`  To match         : ${toMatch.length}\n`);

if (toMatch.length === 0) {
  console.log("  Nothing to do. All exercises already have URLs. ✅\n");
  process.exit(0);
}

// Download the full dataset once (no auth required)
console.log("  Downloading exercise dataset…");
const res = await fetch(DB_JSON);
if (!res.ok) throw new Error(`Failed to fetch dataset: HTTP ${res.status}`);
const allExercises = await res.json();
console.log(`  Loaded ${allExercises.length} exercises from dataset.\n`);

const imageMap = { ...existing };
const found  = [];
const missed = [];

for (const [id, searchTerm] of toMatch) {
  process.stdout.write(`  [${id}] matching "${searchTerm}" … `);
  const match = findBest(searchTerm, allExercises);
  if (match) {
    imageMap[id] = `${IMG_BASE}/${match.id}/0.jpg`;
    found.push({ id, name: match.name, url: imageMap[id] });
    console.log(`✅ "${match.name}"`);
  } else {
    missed.push({ id, searchTerm });
    console.log("⚠️  no match");
  }
}

// Write updated file
writeFileSync(IMAGES_FILE, buildFileContent(imageMap), "utf8");

console.log(`\n  ──────────────────────────────────────`);
console.log(`  Matched : ${found.length}`);
console.log(`  Missed  : ${missed.length}`);
if (missed.length > 0) {
  console.log(`\n  Missed exercises (add URLs manually to exercise-images.js):`);
  missed.forEach(m => console.log(`    "${m.id}"  (searched: "${m.searchTerm}")`));
}
console.log(`\n  Updated ${IMAGES_FILE}`);
console.log(`  Restart the dev server to see the images: npm run dev\n`);
console.log(`  Tip: for missed exercises, add a YouTube URL manually:`);
console.log(`    "k02": "https://www.youtube.com/watch?v=XXXXX"\n`);
