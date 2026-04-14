// exercises-data.js
// All exercises extracted from:
//   1_kinetotherapy/exercises.md     → physical_therapy category
//   2_strength_body_shape/exercises.md → muscle category
//   3_cardio_breathing/exercises.md  → cardio + breathing categories
//
// Usage in spinesync-app.jsx:
//   import { EXERCISES, SCHEDULE } from "./exercises-data.js";
//   Replace DEFAULT_EXERCISES and DEFAULT_SCHEDULE with these.
//
// Phase notes stored in the `notes` field:
//   Phase 1 = Foundation (Months 1–2, Apr–Jun 2026)
//   Phase 2 = Progression (Months 3–4, Jun–Aug 2026)
//   Phase 3 = Advanced (Months 5–6, Aug–Oct 2026)

// ─── PHYSICAL THERAPY (Kinetotherapy) ────────────────────────────────────────
// Warm-up IDs: kw1–kw2 | Main P1: k01–k10 | Cool-down: kc1–kc3
// Main P2: k11–k16 | Main P3: k17–k22
const physical_therapy = [
  // ── Warm-Up (All phases) ────────────────────────────────────────────────────
  {
    id: "kw1", name: "Diaphragmatic Breathing", image: "",
    muscles: ["Diaphragm", "Transversus Abdominis", "Pelvic Floor"],
    duration: "8–10 breaths", difficulty: "Easy", weight: "", weightUnit: "",
    notes: "Phase 1+ · Warm-up",
    tips: "Lie on back, knees bent. One hand on chest, one on belly. Inhale through nose — belly rises, chest stays still. Exhale through pursed lips. Before exhaling, gently draw navel toward spine (activate TA). Hold abdominal contraction through all subsequent exercises.",
  },
  {
    id: "kw2", name: "Seated Thoracic Rotation", image: "",
    muscles: ["Thoracic Spine", "Intercostals"],
    duration: "10/side", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+ · Warm-up",
    tips: "Sit on chair edge, feet flat, arms crossed on chest. Slowly rotate torso to each side (5 sec). Return to centre. Movement comes from the thoracic spine, NOT the neck. Do not force past pain.",
  },
  // ── Main Exercises — Phase 1 ────────────────────────────────────────────────
  {
    id: "k01", name: "Cat-Cow + Neutral Hold", image: "",
    muscles: ["Spinal Extensors", "Multifidus", "Transversus Abdominis"],
    duration: "2×10 cycles", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+",
    tips: "Hands and knees. Cow: inhale, belly drops, lift head and tailbone (thoracic extends). Cat: exhale, round entire spine up. Neutral Hold: find the middle — neutral spine, hold 5 sec. Movement should be segmental — feel each vertebra unlocking.",
  },
  {
    id: "k02", name: "Thoracic Extension — Towel Roll", image: "",
    muscles: ["Thoracic Extensors", "Intercostals"],
    duration: "4–5 positions × 30 sec", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+ · Most important exercise for kyphosis",
    tips: "Roll a bath towel tightly (~10 cm). Lie back so towel sits at the apex of your kyphosis. Support your head. Let gravity gently extend your thoracic spine — do NOT force. Hold 20–30 sec, breathe slowly. Move towel one vertebra up/down each time. NEVER place under lumbar. Stop if sharp pain, dizziness, or arm tingling.",
  },
  {
    id: "k03", name: "Bird-Dog", image: "",
    muscles: ["Multifidus", "Transversus Abdominis", "Glutes", "Deltoid"],
    duration: "2×10/side", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+",
    tips: "Hands and knees, core braced. Slowly extend opposite arm and leg simultaneously. Keep hips level — no rotation. Hold 5 sec. Return slowly. Imagine balancing a glass of water on your lower back. Neck neutral, gaze at floor.",
  },
  {
    id: "k04", name: "Dead Bug", image: "",
    muscles: ["Transversus Abdominis", "Core", "Hip Flexors"],
    duration: "2×8/side", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+",
    tips: "On back, press lumbar to floor. Arms reach to ceiling, hips and knees at 90°. Lower opposite arm overhead and extend opposite leg simultaneously — keep low back pressed to floor. Return. Breathe out as you lower limbs. If back lifts, reduce range of motion.",
  },
  {
    id: "k05", name: "Prone Cobra", image: "",
    muscles: ["Thoracic Extensors", "Rhomboids", "Posterior Deltoid"],
    duration: "2×10", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+",
    tips: "Face down, arms along sides, palms facing ceiling. Squeeze shoulder blades together, then slowly lift chest 5–8 cm. Keep neck neutral (look at floor 20 cm ahead). Hold 3–5 sec, lower slowly. Do NOT push up with hands — pure muscle activation only.",
  },
  {
    id: "k06", name: "Wall Angels", image: "",
    muscles: ["Lower Trapezius", "Serratus Anterior", "Rhomboids"],
    duration: "2×10", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+",
    tips: "Back against wall, heels 10 cm out, lumbar flat, head touching wall. Arms bent 90° at elbows pressed against wall (goal-post). Slowly slide arms up to full overhead reach, then back down. Both wrists AND elbows must maintain wall contact throughout. Reduce range if needed — limited range is normal with tight pectorals.",
  },
  {
    id: "k07", name: "Hip Flexor Stretch — Kneeling", image: "",
    muscles: ["Hip Flexors", "Iliopsoas", "Rectus Femoris"],
    duration: "2×30 sec/side", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+",
    tips: "Kneel on right knee (use padding), left foot forward. Maintain tall, upright posture. Shift hips forward until stretch at front of right hip. Do NOT lean forward. Hold 30 sec, switch sides. Stretch felt in front of hip/groin, not the knee.",
  },
  {
    id: "k08", name: "Pectoral Doorway Stretch", image: "",
    muscles: ["Pectorals", "Anterior Deltoid"],
    duration: "2×30 sec", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+",
    tips: "Stand in doorframe, forearms on the sides, elbows at 90°. Gently lean forward until stretch across chest and front of shoulders. Hold 30 sec. Tight pectorals pull shoulders forward and dramatically worsen kyphotic posture.",
  },
  {
    id: "k09", name: "Serratus Anterior — Wall Push-Up Plus", image: "",
    muscles: ["Serratus Anterior", "Subscapularis"],
    duration: "2×10–15", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+",
    tips: "Stand facing wall, palms flat at shoulder height, elbows LOCKED straight. Push hands INTO wall — shoulder blades spread apart (protract), hold 3 sec. Allow blades to gently pinch together. Elbows do NOT bend. The ONLY movement is the shoulder blades. Stop if shoulder blade grinding or neck tension.",
  },
  {
    id: "k10", name: "Foam Roller Thoracic Mobilization", image: "",
    muscles: ["Thoracic Extensors", "Intercostals"],
    duration: "2 passes (~5 positions)", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+ · Start from Week 3",
    tips: "Foam roller horizontal on floor. Sit in front, lie back so roller contacts T7 (lower shoulder blade edge). Arms crossed on chest or hands behind neck. Let gravity create extension — do NOT press into it. Work T7 up to T4 (~5 positions). Do NOT use on lumbar spine. Stop if sharp pain or arm tingling.",
  },
  // ── Cool-Down (All phases) ──────────────────────────────────────────────────
  {
    id: "kc1", name: "Child's Pose", image: "",
    muscles: ["Lumbar Extensors", "Lats", "Hips"],
    duration: "30–60 sec", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+ · Cool-down",
    tips: "Kneel, sit back toward heels (if comfortable), arms extended forward. Hold and breathe slowly. Feel lumbar spine gently decompress.",
  },
  {
    id: "kc2", name: "Supine Knee-to-Chest", image: "",
    muscles: ["Lumbar Extensors", "Glutes"],
    duration: "30 sec", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+ · Cool-down",
    tips: "Lie on back. Gently draw both knees to chest. Rock gently side to side. Hold 30 sec.",
  },
  {
    id: "kc3", name: "Postural Reset Standing", image: "",
    muscles: ["Rhomboids", "Erector Spinae", "Deep Core"],
    duration: "30 sec", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+ · Cool-down",
    tips: "Stand feet hip-width. Gently squeeze shoulder blades together. Make yourself tall — imagine a string pulling the crown of your head toward the ceiling. Hold 30 sec while breathing normally. This is the posture you are training to become automatic.",
  },
  // ── Phase 2 Additions ───────────────────────────────────────────────────────
  {
    id: "k11", name: "Superman / Back Extension", image: "",
    muscles: ["Spinal Extensors", "Glutes", "Posterior Chain"],
    duration: "2×10", difficulty: "Medium", weight: "", weightUnit: "bodyweight",
    notes: "Phase 2+",
    tips: "Face down, arms extended overhead. Simultaneously lift arms, chest, and legs off the floor. Hold 5 sec. Begin with just arms lifted, then just legs, then both together. Squeeze glutes throughout.",
  },
  {
    id: "k12", name: "Glute Bridge", image: "",
    muscles: ["Glutes", "Hamstrings", "Core"],
    duration: "2×15", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 2+",
    tips: "On back, knees bent, feet flat hip-width. Press through heels, lift hips to straight line from knees to shoulders. Squeeze glutes at top, hold 3 sec. Lower slowly.",
  },
  {
    id: "k13", name: "Side-Lying Clamshell", image: "",
    muscles: ["Glute Medius", "Hip Abductors"],
    duration: "2×15/side", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 2+",
    tips: "Lie on side, knees bent 45°. Stack hips and shoulders. Keeping feet together, open top knee like a clamshell (30–40°). Lower slowly.",
  },
  {
    id: "k14", name: "Chin Tucks", image: "",
    muscles: ["Deep Cervical Flexors", "Cervical Extensors"],
    duration: "2×15", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 2+",
    tips: "Sit or stand tall. Without tilting head, gently pull chin straight backward (creating a 'double chin'). Hold 5 sec. Release. Corrects forward head posture caused by kyphosis. Does NOT involve looking up.",
  },
  {
    id: "k15", name: "Prone Y-T-W Raises", image: "",
    muscles: ["Lower Trapezius", "Middle Trapezius", "Rhomboids", "Infraspinatus"],
    duration: "8–10/letter × 1 set", difficulty: "Medium", weight: "", weightUnit: "bodyweight",
    notes: "Phase 2+ · No weight initially",
    tips: "Face down. Y: arms overhead in narrow V (thumbs up). T: arms horizontal at 90°. W: elbows bent, forearms angled down. Each position: lift 5–8 cm, squeeze below shoulder blades, hold 3 sec, lower. Small, controlled — neuromuscular activation, NOT strength. Neck neutral, nose toward floor.",
  },
  {
    id: "k16", name: "Half-Kneeling Thoracic Rotation", image: "",
    muscles: ["Thoracic Rotators", "Obliques", "Intercostals"],
    duration: "2×5/side", difficulty: "Medium", weight: "", weightUnit: "bodyweight",
    notes: "Phase 2+",
    tips: "Half-kneeling. Hands behind head or arms crossed. Slowly rotate thoracic spine toward front knee, leading with the shoulder. Hold 3 sec, breathe IN at end range — let breath expand the rotation. Return to centre. Pelvis must stay square.",
  },
  // ── Phase 3 Additions ───────────────────────────────────────────────────────
  {
    id: "k17", name: "Single-Leg Glute Bridge", image: "",
    muscles: ["Glutes", "Hamstrings", "Core"],
    duration: "2×10/leg", difficulty: "Medium", weight: "", weightUnit: "bodyweight",
    notes: "Phase 3",
    tips: "Same as glute bridge but extend one leg straight out. Lift hips. Hold 5 sec at top.",
  },
  {
    id: "k18", name: "Modified Side Plank", image: "",
    muscles: ["Obliques", "Glute Medius", "Quadratus Lumborum"],
    duration: "3×30 sec/side", difficulty: "Medium", weight: "", weightUnit: "bodyweight",
    notes: "Phase 3",
    tips: "Side-lying on forearm and bent knees. Lift hips to form a straight line. Hold 20–30 sec, build to 45 sec over weeks.",
  },
  {
    id: "k19", name: "Bird-Dog + Resistance Band", image: "",
    muscles: ["Multifidus", "Glutes", "Deltoid", "Core"],
    duration: "2×10/side (10 sec hold)", difficulty: "Hard", weight: "", weightUnit: "band",
    notes: "Phase 3",
    tips: "Same as Bird-Dog but hold each rep for 10 seconds. Light resistance band around ankles for the leg extension.",
  },
  {
    id: "k20", name: "Seated Rowing with Stick", image: "",
    muscles: ["Rhomboids", "Middle Trapezius", "Biceps"],
    duration: "2×15", difficulty: "Medium", weight: "", weightUnit: "bodyweight",
    notes: "Phase 3",
    tips: "Sit tall on chair. Hold stick shoulder-width, arms extended in front. Pull stick toward chest (rowing motion), squeezing shoulder blades together. Extend slowly back out.",
  },
  {
    id: "k21", name: "Single-Leg Balance", image: "",
    muscles: ["Core", "Ankle Stabilizers", "Proprioception System"],
    duration: "3×30 sec/leg", difficulty: "Hard", weight: "", weightUnit: "bodyweight",
    notes: "Phase 3",
    tips: "Stand on one foot, light touch on wall for safety. Maintain tall posture. Progress 1: remove hand. Progress 2: close eyes 10–15 sec. Progress 3: hold stick horizontally overhead while balancing. Stop if dizzy.",
  },
  {
    id: "k22", name: "Schroth RAB Breathing", image: "",
    muscles: ["Diaphragm", "Intercostals", "Thoracic Rotators"],
    duration: "8–10 breaths", difficulty: "Hard", weight: "", weightUnit: "",
    notes: "Phase 3 · Schroth Method",
    tips: "Sit tall. Hand on concave (sunken) side of ribcage. Inhale slowly directing breath toward that hand — expand that side outward. As you inhale, gently elongate spine and rotate upper back in the corrective direction. Hold 3 sec, exhale completely. Consult physio to confirm your curve direction first.",
  },
];

// ─── MUSCLE (Strength & Body Shape) ──────────────────────────────────────────
// Day A = Push (Tue Wk1) | Day B = Pull (Thu Wk1) | Day C = Legs/Core (Sun Wk1)
// Rotation: (week_number − 1) mod 3 → 0=A/B/C, 1=B/C/A, 2=C/A/B
const muscle = [
  // ── Warm-Up (All days) ──────────────────────────────────────────────────────
  {
    id: "sw1", name: "Joint Circles Warm-Up", image: "",
    muscles: ["Full Body", "Joints"],
    duration: "5 min", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "All days · Warm-up",
    tips: "30 sec each: wrist circles, elbow circles, shoulder circles (forward + backward). 30 sec hip circles. 30 sec ankle circles. 10 × neck semi-circles (ear to shoulder, chin to chest — NO full backward circles). 10 × thoracic rotation each side.",
  },
  // ── Day A — Upper Body Push ─────────────────────────────────────────────────
  {
    id: "sa1", name: "Incline Push-Up", image: "",
    muscles: ["Pectorals", "Deltoid", "Triceps", "Serratus Anterior"],
    duration: "3×10–12", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Day A · Phase 1",
    tips: "Hands on table edge or windowsill. Elbows 45° from body (not flared wide). Lower chest to surface. Body straight as a plank — no sagging hips. Push back to straight arms. Progress to floor push-ups when 12 reps feel easy.",
  },
  {
    id: "sa2", name: "Dumbbell Shoulder Press", image: "",
    muscles: ["Deltoid", "Triceps", "Upper Trapezius"],
    duration: "3×10", difficulty: "Medium", weight: "4", weightUnit: "kg",
    notes: "Day A · Phase 1 · Seated",
    tips: "Sit upright, spine neutral, feet flat. Dumbbells at shoulder height, palms forward, elbows 90°. Press straight up until arms extended (don't lock). Lower 3 sec. Do NOT arch lower back to press heavier — reduce weight instead.",
  },
  {
    id: "sa3", name: "Lateral Raise", image: "",
    muscles: ["Lateral Deltoid", "Supraspinatus"],
    duration: "3×12", difficulty: "Easy", weight: "2", weightUnit: "kg",
    notes: "Day A · Phase 1",
    tips: "Standing or seated, slight bend at elbow. Raise arms out to sides until HORIZONTAL only — no higher. Thumbs slightly down (like pouring a glass). Lower 3 sec. Very light weight — 2–3 kg max initially.",
  },
  {
    id: "sa4", name: "Tricep Overhead Extension", image: "",
    muscles: ["Triceps"],
    duration: "3×12", difficulty: "Easy", weight: "4", weightUnit: "kg",
    notes: "Day A · Phase 1",
    tips: "Seated. Hold one dumbbell with both hands overhead, arms extended. Bend at elbows — lower dumbbell behind head. Upper arms stay vertical, pointing straight up. Elbows do not flare wide. Core engaged.",
  },
  {
    id: "sa5", name: "Stick Chest Pass", image: "",
    muscles: ["Pectorals", "Serratus Anterior", "Triceps"],
    duration: "1×15", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Day A · Phase 1",
    tips: "Stand, hold stick horizontally, arms extended at chest height. Slowly push stick forward (extending elbows), then pull back. Variation: push at 45° upward angle to mimic incline press.",
  },
  // ── Day B — Upper Body Pull ─────────────────────────────────────────────────
  {
    id: "sb1", name: "One-Arm Dumbbell Row", image: "",
    muscles: ["Rhomboids", "Middle Trapezius", "Lats", "Biceps"],
    duration: "3×10/side", difficulty: "Medium", weight: "6", weightUnit: "kg",
    notes: "Day B · Phase 1 · Supported",
    tips: "Left knee and hand on chair for support. Spine flat as a table — not rounded. Hold dumbbell in right hand, arm hanging. Pull to your HIP (not shoulder), leading with the elbow. Lower slowly. CRITICAL: flat spine throughout.",
  },
  {
    id: "sb2", name: "Bicep Curl", image: "",
    muscles: ["Biceps", "Forearms"],
    duration: "3×12", difficulty: "Easy", weight: "6", weightUnit: "kg",
    notes: "Day B · Phase 1",
    tips: "Stand upright, palms facing forward. Curl both/alternating dumbbells. Lower 3 sec. No torso swing — elbows stay at sides. Isolation exercise — stay controlled.",
  },
  {
    id: "sb3", name: "Dumbbell Reverse Fly", image: "",
    muscles: ["Posterior Deltoid", "Rhomboids", "Middle Trapezius"],
    duration: "3×12", difficulty: "Easy", weight: "2", weightUnit: "kg",
    notes: "Day B · Phase 1",
    tips: "Sit on chair edge, lean forward so chest nearly touches thighs (spine neutral, not rounded). Dumbbells hanging below, palms facing each other. Raise arms out to HORIZONTAL, squeeze shoulder blades. Lower slowly. 2–3 kg only.",
  },
  {
    id: "sb4", name: "Face Pull with Stick", image: "",
    muscles: ["Posterior Deltoid", "Infraspinatus", "Rhomboids", "Middle Trapezius"],
    duration: "3×15", difficulty: "Easy", weight: "", weightUnit: "band",
    notes: "Day B · Phase 1",
    tips: "Band at head height; or stick held isometrically. Pull toward face while flaring elbows outward. Squeeze shoulder blades at end range. The most important postural exercise for forward-rounded shoulders. Do every pull day.",
  },
  {
    id: "sb5", name: "Stick Pull-Apart", image: "",
    muscles: ["Rhomboids", "Posterior Deltoid", "Middle Trapezius"],
    duration: "3×12", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Day B · Phase 1",
    tips: "Hold stick at chest height, arms extended. Pull ends apart (as if breaking it) — arms move out to sides until stick touches chest. Keep arms straight. Return slowly. Neutral spine — no lower back arch.",
  },
  {
    id: "sb6", name: "Hammer Curl", image: "",
    muscles: ["Biceps", "Brachialis", "Forearms"],
    duration: "2×12", difficulty: "Easy", weight: "6", weightUnit: "kg",
    notes: "Day B · Phase 1",
    tips: "Same as bicep curl but palms face each other (neutral grip, like holding a hammer) throughout the entire movement.",
  },
  {
    id: "sb7", name: "Shoulder External Rotation — Side-Lying", image: "",
    muscles: ["Infraspinatus", "Teres Minor", "Rotator Cuff"],
    duration: "2×15/side", difficulty: "Easy", weight: "1", weightUnit: "kg",
    notes: "Day B · Phase 1+ · Medical corrective — never skip",
    tips: "Lie on side. Hold very light dumbbell (1–2 kg). Upper arm PINNED against ribs, elbow at 90°, forearm across waist. Rotate forearm UPWARD until vertical. Lower 3 sec. Upper arm must NOT move. This corrects the internal rotation dominance that reinforces kyphotic curve. Treat as medical, not strength.",
  },
  {
    id: "sb8", name: "Prone I-Y-T Raises", image: "",
    muscles: ["Lower Trapezius", "Middle Trapezius", "Rhomboids"],
    duration: "1×8/position", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Day B · Phase 1 · Scapular warm-up before pulling",
    tips: "Face down. I: arms overhead. Y: arms in narrow V. T: arms horizontal at 90°. Lift 5–8 cm, hold briefly. No weight or ≤1 kg. 1 set per position before pulling exercises. Cross-reference with K-15 for detailed cues.",
  },
  // ── Day C — Legs, Glutes & Core ─────────────────────────────────────────────
  {
    id: "sc1", name: "Goblet Squat", image: "",
    muscles: ["Quadriceps", "Glutes", "Hamstrings", "Core"],
    duration: "3×12", difficulty: "Easy", weight: "6", weightUnit: "kg",
    notes: "Day C · Phase 1",
    tips: "Hold dumbbell vertically at chest. Feet shoulder-width, toes slightly out. Descend slowly — chest up, heels on floor, knees tracking over toes. Lower to parallel. Drive up through heels. Safer for kyphosis than barbell squats (dumbbell at front keeps thoracic upright).",
  },
  {
    id: "sc2", name: "Romanian Deadlift — Light", image: "",
    muscles: ["Hamstrings", "Glutes", "Erector Spinae"],
    duration: "3×10", difficulty: "Medium", weight: "6", weightUnit: "kg",
    notes: "Day C · Phase 1",
    tips: "Slight knee bend, neutral spine. Hinge at hips — push hips back, lower dumbbells along shins. Stop at hamstring stretch (shin level). Drive hips forward to return. CRITICAL: spine must stay neutral throughout. If thoracic rounds = set is over. Feel the hinge in the hips, not the back.",
  },
  {
    id: "sc3", name: "Reverse Lunge", image: "",
    muscles: ["Quadriceps", "Glutes", "Hamstrings"],
    duration: "3×10/leg", difficulty: "Easy", weight: "4", weightUnit: "kg",
    notes: "Day C · Phase 1",
    tips: "Dumbbells at sides. Step one foot backward, lower back knee toward floor (not touching). Front knee stays above ankle. Torso upright. Push through front heel to return. Step back far enough so front shin stays vertical.",
  },
  {
    id: "sc4", name: "Stick-Assisted Sumo Squat", image: "",
    muscles: ["Quadriceps", "Glutes", "Hip Adductors", "Inner Thighs"],
    duration: "3×15", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Day C · Phase 1",
    tips: "Hold stick vertically in front for balance. Feet wider than shoulders, toes turned out 45°. Squat down slowly, keeping stick vertical and back straight.",
  },
  {
    id: "sc5", name: "Plank", image: "",
    muscles: ["Core", "Transversus Abdominis", "Glutes"],
    duration: "3×20–45 sec", difficulty: "Medium", weight: "", weightUnit: "bodyweight",
    notes: "Day C · Phase 1",
    tips: "Forearm plank: elbows under shoulders, body straight from head to heels. No hip droop or pike. Gaze at the floor. Squeeze glutes and brace core gently. Breathe normally — NEVER hold your breath. Build from 20 sec to 45 sec over weeks.",
  },
  {
    id: "sc5b", name: "Pallof Press", image: "",
    muscles: ["Transversus Abdominis", "Obliques", "Core"],
    duration: "2×10/side", difficulty: "Medium", weight: "", weightUnit: "band",
    notes: "Day C · Phase 1+ · Anti-rotation",
    tips: "Band or cable at waist height. Stand sideways ~1 m from anchor. Hands clasped at chest. Press straight out until arms extended — RESIST the rotational pull. Hold 3–5 sec. Return slowly. Anti-rotation core training: safest core exercise for spinal pathologies. Increase band resistance to progress.",
  },
  {
    id: "sc6", name: "Glute Bridge — Loaded", image: "",
    muscles: ["Glutes", "Hamstrings", "Core"],
    duration: "3×15", difficulty: "Easy", weight: "6", weightUnit: "kg",
    notes: "Day C · Phase 1",
    tips: "Lie on back, dumbbell on lower abdomen/hip crease. Press through heels, lift hips. Squeeze glutes hard at top. Lower 3 sec.",
  },
  // ── Phase 2 Additions ───────────────────────────────────────────────────────
  {
    id: "sa6", name: "Dumbbell Floor Press", image: "",
    muscles: ["Pectorals", "Triceps", "Anterior Deltoid"],
    duration: "4×10", difficulty: "Medium", weight: "6", weightUnit: "kg",
    notes: "Day A · Phase 2 · Replaces Incline Push-Up",
    tips: "Lie on back, knees bent. Dumbbells at lower chest, elbows at 45°. Press both up until fully extended, pause 1 sec. Lower 3 sec. Floor prevents shoulder hyperextension — intentional and safe for kyphosis. Start 5–8 kg.",
  },
  {
    id: "sa7", name: "Scapular Push-Up Isolation", image: "",
    muscles: ["Serratus Anterior", "Subscapularis"],
    duration: "3×15", difficulty: "Medium", weight: "", weightUnit: "bodyweight",
    notes: "Day A · Phase 2",
    tips: "Push-up position, elbows LOCKED straight throughout. Push floor away — shoulder blades spread apart (protract), hold 3 sec. Allow to pinch together. Tiny, precise movement — NOT a push-up. Continues serratus anterior work from kinetotherapy in a loaded position.",
  },
  {
    id: "sb9", name: "Inverted Row — Table Edge", image: "",
    muscles: ["Rhomboids", "Middle Trapezius", "Biceps", "Lower Trapezius"],
    duration: "4×12", difficulty: "Medium", weight: "", weightUnit: "bodyweight",
    notes: "Day B · Phase 2",
    tips: "Lie under sturdy table. Grip far edge, slightly wider than shoulder-width. Body completely straight (reverse plank). Pull chest up toward table, leading with elbows back, shoulder blades squeezing. Lower 3 sec. More horizontal = harder. Builds the primary anti-kyphosis muscles.",
  },
  {
    id: "sc7", name: "Walking Lunge with Stick Overhead", image: "",
    muscles: ["Quadriceps", "Glutes", "Core", "Thoracic Extensors"],
    duration: "3×10/leg", difficulty: "Medium", weight: "", weightUnit: "bodyweight",
    notes: "Day C · Phase 2",
    tips: "Hold stick horizontally overhead, arms fully extended (wider than shoulder-width). Alternate legs forward in lunges. Resist any forward lean. Push through front heel to standing. Overhead stick forces thoracic extension and immediately reveals compensation.",
  },
  // ── Phase 3 Additions ───────────────────────────────────────────────────────
  {
    id: "sa8", name: "Archer Push-Up", image: "",
    muscles: ["Pectorals", "Triceps", "Serratus Anterior"],
    duration: "4×6/side", difficulty: "Hard", weight: "", weightUnit: "bodyweight",
    notes: "Day A · Phase 3",
    tips: "Wide push-up. As you lower, shift weight to one side — that arm bends, opposite arm stays nearly straight (like drawing a bow). Develops unilateral pushing strength and scapular control.",
  },
  {
    id: "sa9", name: "Slow-Tempo Push-Up", image: "",
    muscles: ["Pectorals", "Triceps", "Serratus Anterior"],
    duration: "4×8–12", difficulty: "Hard", weight: "", weightUnit: "bodyweight",
    notes: "Day A · Phase 3 · Mandatory tempo",
    tips: "Standard or diamond push-up (index/thumb touching for tricep emphasis). Mandatory tempo: 3 sec down → 1 sec hold at bottom → 1 sec up. No bouncing out of the bottom.",
  },
  {
    id: "sa10", name: "Single-Arm Floor Press", image: "",
    muscles: ["Pectorals", "Triceps", "Core", "Obliques"],
    duration: "3×10/arm", difficulty: "Hard", weight: "8", weightUnit: "kg",
    notes: "Day A · Phase 3",
    tips: "Same position as floor press but one arm at a time. Non-pressing arm rests at side. Single-arm press requires core and obliques to resist rotation — doubles as anti-rotation core work.",
  },
  {
    id: "sb10", name: "Inverted Row — Feet Elevated", image: "",
    muscles: ["Rhomboids", "Middle Trapezius", "Biceps", "Rear Deltoid"],
    duration: "4×10", difficulty: "Hard", weight: "", weightUnit: "bodyweight",
    notes: "Day B · Phase 3 · Replaces table row",
    tips: "Same as inverted row but elevate feet on a chair, making body fully horizontal. Dramatically increases the percentage of bodyweight lifted.",
  },
  {
    id: "sc8", name: "Bulgarian Split Squat", image: "",
    muscles: ["Quadriceps", "Glutes", "Hamstrings", "Hip Flexors"],
    duration: "3×8/leg", difficulty: "Hard", weight: "8", weightUnit: "kg",
    notes: "Day C · Phase 3 · Replaces Reverse Lunge",
    tips: "Stand in front of chair. Rear foot elevated on chair. Lower back knee straight down (3 sec descent). Push through front heel. Front knee above ankle, upper body upright. Start without weight, progress to dumbbells at sides.",
  },
  {
    id: "sc9", name: "Romanian Deadlift — Heavier", image: "",
    muscles: ["Hamstrings", "Glutes", "Erector Spinae"],
    duration: "3×10", difficulty: "Hard", weight: "10", weightUnit: "kg",
    notes: "Day C · Phase 3 · Only after Phase 2 mastered",
    tips: "Hip-hinge, NOT a back-rounding exercise. Lower to mid-shin, back FLAT. If lower back rounds — reduce range. Do NOT perform until Phase 2 Glute Bridge with dumbbell and half-kneeling thoracic extension are solid.",
  },
];

// ─── CARDIO ───────────────────────────────────────────────────────────────────
// Norwegian-method based. Performed at end of Strength sessions (10–15 min block).
// Progression: Zone 2 → 2×4 intervals (Wk 5) → 3×4 (Wk 14) → 4×4 (Wk 22)
const cardio = [
  {
    id: "ca_z2", name: "Zone 2 — Brisk Walk / Cycle", image: "",
    muscles: ["Cardiovascular System", "Full Body"],
    duration: "10–12 min", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+ · End of every strength session",
    tips: "Walk, cycle, or dance at easy pace. You must be able to speak in full sentences. Try nasal-only breathing — if you can't, slow down. 80% of all sessions should be Zone 2. Builds aerobic base, mitochondrial density, fat oxidation.",
  },
  {
    id: "ca_2x4", name: "Norwegian 2×4 Intervals", image: "",
    muscles: ["Cardiovascular System", "Full Body"],
    duration: "~15 min", difficulty: "Medium", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1 · From Week 5",
    tips: "2 min Zone 1 warm-up → 4 min Zone 4 (~80% max HR) → 3 min Zone 1 recovery → 4 min Zone 4 → 2 min cool-down. Activities: hill walking, stationary bike, stairs, elliptical. Max HR ≈ 220 − age.",
  },
  {
    id: "ca_3x4", name: "Norwegian 3×4 Intervals", image: "",
    muscles: ["Cardiovascular System", "Full Body"],
    duration: "~22 min", difficulty: "Hard", weight: "", weightUnit: "bodyweight",
    notes: "Phase 2 · From Week 14",
    tips: "2 min warm-up → 3 × (4 min Zone 4 + 3 min Zone 1 recovery) → 2 min cool-down. May need to shorten the strength block to fit. Total combined session ~40 min.",
  },
  {
    id: "ca_4x4", name: "Norwegian 4×4 Full Protocol", image: "",
    muscles: ["Cardiovascular System", "Full Body"],
    duration: "~30 min", difficulty: "Hard", weight: "", weightUnit: "bodyweight",
    notes: "Phase 3 · From Week 22",
    tips: "2 min warm-up → 4 × (4 min Zone 4 + 3 min Zone 1 recovery) → 2 min cool-down. 85–95% max HR during intervals. Combine with shorter 15 min strength circuit.",
  },
];

// ─── BREATHING ────────────────────────────────────────────────────────────────
// Performed as 5-min cool-down block at end of every combined (strength) session.
// Steps 1→2→3→4 in sequence. Each step flows into the next.
const breathing = [
  {
    id: "br_d", name: "Diaphragmatic Breathing Retraining", image: "",
    muscles: ["Diaphragm", "Intercostals", "Pelvic Floor"],
    duration: "90 sec / 6 breaths", difficulty: "Easy", weight: "", weightUnit: "",
    notes: "All sessions · Cool-down Step 1",
    tips: "On back, knees bent. Hand on belly, hand on chest. Inhale 4 sec — belly rises, chest stays still. Exhale 6 sec. Goal: 6 breaths/min. Activates parasympathetic recovery mode. Foundation for all other breathing work.",
  },
  {
    id: "br_box", name: "Box Breathing (4-4-4-4)", image: "",
    muscles: ["Diaphragm", "Nervous System"],
    duration: "90 sec / 4–6 cycles", difficulty: "Easy", weight: "", weightUnit: "",
    notes: "All sessions · Cool-down Step 2",
    tips: "Inhale 4 sec → Hold 4 sec → Exhale 4 sec → Hold 4 sec. CO₂ tolerance and nervous system regulation. Used by Norwegian athletes and military. Improves breath control capacity.",
  },
  {
    id: "br_te", name: "Thoracic Expansion Breathing", image: "",
    muscles: ["Intercostals", "Diaphragm", "Thoracic Cage"],
    duration: "60 sec / 8–10 breaths", difficulty: "Easy", weight: "", weightUnit: "",
    notes: "All sessions · Cool-down Step 3",
    tips: "Sit tall, hands on sides of ribcage. Inhale slowly, push hands outward — breathe into the sides of your chest (lateral costal breathing). Exhale completely. Works directly against the thoracic restriction caused by kyphosis.",
  },
  {
    id: "br_478", name: "4-7-8 Recovery Breathing", image: "",
    muscles: ["Diaphragm", "Autonomic Nervous System"],
    duration: "60 sec / 4 cycles", difficulty: "Easy", weight: "", weightUnit: "",
    notes: "All sessions · Cool-down Step 4",
    tips: "Inhale through nose 4 sec → Hold 7 sec → Exhale through mouth 8 sec. Post-exercise recovery technique. Activates vagus nerve. Accelerates heart rate return to baseline.",
  },
  {
    id: "br_nasal", name: "Nasal Breathing Training", image: "",
    muscles: ["Diaphragm", "Respiratory Musculature"],
    duration: "During Zone 2 cardio", difficulty: "Easy", weight: "", weightUnit: "",
    notes: "Zone 2 only · Norwegian cornerstone",
    tips: "Breathe ONLY through the nose during all Zone 2 cardio. If you cannot, you are going too fast. Nasal breathing produces nitric oxide, filters and humidifies air, and enforces correct training intensity. Takes 2–4 weeks to adapt. Measure progress monthly with the BOLT score.",
  },
];

// ─── IMAGES ──────────────────────────────────────────────────────────────────
// Populated by: node scripts/fetch-exercise-images.mjs YOUR_RAPIDAPI_KEY
import EXERCISE_IMAGES from "./exercise-images.js";

function applyImages(list) {
  return list.map(ex => ({ ...ex, image: EXERCISE_IMAGES[ex.id] || ex.image || "" }));
}

// ─── EXERCISES ────────────────────────────────────────────────────────────────
export const EXERCISES = {
  physical_therapy: applyImages(physical_therapy),
  muscle: applyImages(muscle),
  cardio: applyImages(cardio),
  breathing: applyImages(breathing),
};

// ─── DEFAULT SCHEDULE ─────────────────────────────────────────────────────────
// Phase 1 — Week 1 — Pattern 0 (Tue=Day A Push, Thu=Day B Pull, Sun=Day C Legs)
// Schedule follows SCHEDULE.md:
//   Mon/Wed/Fri/Sat = Kinetotherapy (30–35 min)
//   Tue/Thu/Sun     = Strength + Cardio (40–45 min)
export const SCHEDULE = {
  Mon: [
    {
      id: "kg_warmup", name: "K — Warm-Up", color: "#4f9cf9",
      exercises: [
        { category: "physical_therapy", exerciseId: "kw1" },
        { category: "physical_therapy", exerciseId: "kw2" },
      ],
    },
    {
      id: "kg_main1", name: "K — Main (Phase 1)", color: "#4f9cf9",
      exercises: [
        { category: "physical_therapy", exerciseId: "k01" },
        { category: "physical_therapy", exerciseId: "k02" },
        { category: "physical_therapy", exerciseId: "k03" },
        { category: "physical_therapy", exerciseId: "k04" },
        { category: "physical_therapy", exerciseId: "k05" },
        { category: "physical_therapy", exerciseId: "k06" },
        { category: "physical_therapy", exerciseId: "k07" },
        { category: "physical_therapy", exerciseId: "k08" },
        { category: "physical_therapy", exerciseId: "k09" },
        { category: "physical_therapy", exerciseId: "k10" },
      ],
    },
    {
      id: "kg_cooldown", name: "K — Cool-Down", color: "#4f9cf9",
      exercises: [
        { category: "physical_therapy", exerciseId: "kc1" },
        { category: "physical_therapy", exerciseId: "kc2" },
        { category: "physical_therapy", exerciseId: "kc3" },
      ],
    },
  ],
  Tue: [
    {
      id: "st_warmup", name: "Warm-Up", color: "#f9c74f",
      exercises: [
        { category: "muscle", exerciseId: "sw1" },
      ],
    },
    {
      id: "st_dayA", name: "Day A — Push", color: "#f97b4f",
      exercises: [
        { category: "muscle", exerciseId: "sa1" },
        { category: "muscle", exerciseId: "sa2" },
        { category: "muscle", exerciseId: "sa3" },
        { category: "muscle", exerciseId: "sa4" },
        { category: "muscle", exerciseId: "sa5" },
      ],
    },
    {
      id: "st_cardioA", name: "Cardio + Breathing", color: "#4fdb91",
      exercises: [
        { category: "cardio",    exerciseId: "ca_z2" },
        { category: "breathing", exerciseId: "br_d" },
        { category: "breathing", exerciseId: "br_box" },
        { category: "breathing", exerciseId: "br_te" },
        { category: "breathing", exerciseId: "br_478" },
      ],
    },
  ],
  Wed: [
    {
      id: "kg_warmup_w", name: "K — Warm-Up", color: "#4f9cf9",
      exercises: [
        { category: "physical_therapy", exerciseId: "kw1" },
        { category: "physical_therapy", exerciseId: "kw2" },
      ],
    },
    {
      id: "kg_main_w", name: "K — Main (Phase 1)", color: "#4f9cf9",
      exercises: [
        { category: "physical_therapy", exerciseId: "k01" },
        { category: "physical_therapy", exerciseId: "k02" },
        { category: "physical_therapy", exerciseId: "k03" },
        { category: "physical_therapy", exerciseId: "k04" },
        { category: "physical_therapy", exerciseId: "k05" },
        { category: "physical_therapy", exerciseId: "k06" },
        { category: "physical_therapy", exerciseId: "k07" },
        { category: "physical_therapy", exerciseId: "k08" },
        { category: "physical_therapy", exerciseId: "k09" },
        { category: "physical_therapy", exerciseId: "k10" },
      ],
    },
    {
      id: "kg_cooldown_w", name: "K — Cool-Down", color: "#4f9cf9",
      exercises: [
        { category: "physical_therapy", exerciseId: "kc1" },
        { category: "physical_therapy", exerciseId: "kc2" },
        { category: "physical_therapy", exerciseId: "kc3" },
      ],
    },
  ],
  Thu: [
    {
      id: "st_warmup_t", name: "Warm-Up", color: "#f9c74f",
      exercises: [
        { category: "muscle", exerciseId: "sw1" },
      ],
    },
    {
      id: "st_dayB", name: "Day B — Pull", color: "#f97b4f",
      exercises: [
        { category: "muscle", exerciseId: "sb8" },
        { category: "muscle", exerciseId: "sb1" },
        { category: "muscle", exerciseId: "sb3" },
        { category: "muscle", exerciseId: "sb4" },
        { category: "muscle", exerciseId: "sb5" },
        { category: "muscle", exerciseId: "sb2" },
        { category: "muscle", exerciseId: "sb6" },
        { category: "muscle", exerciseId: "sb7" },
      ],
    },
    {
      id: "st_cardioB", name: "Cardio + Breathing", color: "#4fdb91",
      exercises: [
        { category: "cardio",    exerciseId: "ca_z2" },
        { category: "breathing", exerciseId: "br_d" },
        { category: "breathing", exerciseId: "br_box" },
        { category: "breathing", exerciseId: "br_te" },
        { category: "breathing", exerciseId: "br_478" },
      ],
    },
  ],
  Fri: [
    {
      id: "kg_warmup_f", name: "K — Warm-Up", color: "#4f9cf9",
      exercises: [
        { category: "physical_therapy", exerciseId: "kw1" },
        { category: "physical_therapy", exerciseId: "kw2" },
      ],
    },
    {
      id: "kg_main_f", name: "K — Main (Phase 1)", color: "#4f9cf9",
      exercises: [
        { category: "physical_therapy", exerciseId: "k01" },
        { category: "physical_therapy", exerciseId: "k02" },
        { category: "physical_therapy", exerciseId: "k03" },
        { category: "physical_therapy", exerciseId: "k04" },
        { category: "physical_therapy", exerciseId: "k05" },
        { category: "physical_therapy", exerciseId: "k06" },
        { category: "physical_therapy", exerciseId: "k07" },
        { category: "physical_therapy", exerciseId: "k08" },
        { category: "physical_therapy", exerciseId: "k09" },
        { category: "physical_therapy", exerciseId: "k10" },
      ],
    },
    {
      id: "kg_cooldown_f", name: "K — Cool-Down", color: "#4f9cf9",
      exercises: [
        { category: "physical_therapy", exerciseId: "kc1" },
        { category: "physical_therapy", exerciseId: "kc2" },
        { category: "physical_therapy", exerciseId: "kc3" },
      ],
    },
  ],
  Sat: [
    {
      id: "kg_warmup_s", name: "K — Warm-Up", color: "#4f9cf9",
      exercises: [
        { category: "physical_therapy", exerciseId: "kw1" },
        { category: "physical_therapy", exerciseId: "kw2" },
      ],
    },
    {
      id: "kg_main_s", name: "K — Main (Phase 1)", color: "#4f9cf9",
      exercises: [
        { category: "physical_therapy", exerciseId: "k01" },
        { category: "physical_therapy", exerciseId: "k02" },
        { category: "physical_therapy", exerciseId: "k03" },
        { category: "physical_therapy", exerciseId: "k04" },
        { category: "physical_therapy", exerciseId: "k05" },
        { category: "physical_therapy", exerciseId: "k06" },
        { category: "physical_therapy", exerciseId: "k07" },
        { category: "physical_therapy", exerciseId: "k08" },
        { category: "physical_therapy", exerciseId: "k09" },
        { category: "physical_therapy", exerciseId: "k10" },
      ],
    },
    {
      id: "kg_cooldown_s", name: "K — Cool-Down", color: "#4f9cf9",
      exercises: [
        { category: "physical_therapy", exerciseId: "kc1" },
        { category: "physical_therapy", exerciseId: "kc2" },
        { category: "physical_therapy", exerciseId: "kc3" },
      ],
    },
  ],
  Sun: [
    {
      id: "st_warmup_su", name: "Warm-Up", color: "#f9c74f",
      exercises: [
        { category: "muscle", exerciseId: "sw1" },
      ],
    },
    {
      id: "st_dayC", name: "Day C — Legs & Core", color: "#f97b4f",
      exercises: [
        { category: "muscle", exerciseId: "sc1" },
        { category: "muscle", exerciseId: "sc3" },
        { category: "muscle", exerciseId: "sc4" },
        { category: "muscle", exerciseId: "sc2" },
        { category: "muscle", exerciseId: "sc5" },
        { category: "muscle", exerciseId: "sc5b" },
        { category: "muscle", exerciseId: "sc6" },
      ],
    },
    {
      id: "st_cardioC", name: "Cardio + Breathing", color: "#4fdb91",
      exercises: [
        { category: "cardio",    exerciseId: "ca_z2" },
        { category: "breathing", exerciseId: "br_d" },
        { category: "breathing", exerciseId: "br_box" },
        { category: "breathing", exerciseId: "br_te" },
        { category: "breathing", exerciseId: "br_478" },
      ],
    },
  ],
};
