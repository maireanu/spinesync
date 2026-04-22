// exercises-data.js
// Diagnosis: Cifoscolioza dorso-lombara + sechele Morbus Scheuermann
// Equipment : dumbbells 4–24 kg (1.5 kg steps: 4, 5.5, 7, 8.5, 10, 11.5, 13, …) · stick
//             Domyos elastic bands (Decathlon) — 3 bands: 7 kg / 10 kg / 15 kg
// Categories: physical_therapy | muscle | cardio | breathing | mobility
//
// Phase 1 = Foundation  (Months 1–2, Apr–Jun 2026)
// Phase 2 = Progression (Months 3–4, Jun–Aug 2026)
// Phase 3 = Advanced    (Months 5–6, Aug–Oct 2026)
//
// ─── 4-Active + 3-Light schedule ──────────────────────────────────────────────
// Mon = Kinetotherapy — Spine & Posture                  ~35 min
// Tue = Breathwork morning reset (light)                 ~10 min
// Wed = Strength — Upper Body Push + Pull + Zone 2       ~50 min
// Thu = Mobility & Recovery (light)                      ~20 min
// Fri = Kinetotherapy + Core & Stability                 ~40 min
// Sat = Active Recovery / Yoga (light)                   ~20 min
// Sun = Cardio / HIIT (Norwegian)                        ~30 min
// Session 7 = Sunday → Cardio/HIIT — NOT Strength ✓
//
// Garmin activity types: Functional Fitness | Strength Training
//   Cardio | HIIT | Yoga | Breathing
// ──────────────────────────────────────────────────────────────────────────────

// ─── PHYSICAL THERAPY (Kinetotherapy) ────────────────────────────────────────
// Scheuermann's / dorsal-lumbar kyphoscoliosis specific protocol
// McGill Big 3 + Schroth method + thoracic mobility
// kw1–kw2 = Warm-Up | k01–k10 = Phase 1 | kc1–kc3 = Cool-Down
// ks1–ks3 = Scheuermann-specific additions
// k11–k16 = Phase 2 | k17–k22 = Phase 3
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
  // ── Scheuermann-Specific Additions (Phase 1+) ────────────────────────────────
  {
    id: "ks1", name: "McKenzie Press-Up (Prone Extension)", image: "",
    muscles: ["Thoracic Extensors", "Lumbar Extensors", "Erector Spinae"],
    duration: "2×10 (1–2 sec hold top)", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+ · McKenzie Method · Lumbar-thoracic extension mobilisation",
    tips: "Lie face down, hands under shoulders (push-up position). Slowly press UP with arms only — hips stay on floor, lower back extends. Go to comfortable range — mild discomfort OK, pain = stop. Lower slowly. The McKenzie Press-Up is the cornerstone of spinal extension therapy for Scheuermann's disc changes.",
  },
  {
    id: "ks2", name: "Modified Curl-Up (McGill Method)", image: "",
    muscles: ["Rectus Abdominis", "Transversus Abdominis"],
    duration: "3×8–10 (8 sec hold)", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+ · McGill Big 3 · Safe abdominal work without spine flexion stress",
    tips: "Lie on back. One knee bent, other leg straight, hand under lumbar curve. Other hand on chest. Lift ONLY head and shoulders slightly — do NOT crunch all the way. Hold 8–10 sec breathing normally. Activates rectus abdominis without disc compression — safe for Scheuermann's discs unlike traditional sit-ups.",
  },
  {
    id: "ks3", name: "Cervical Retraction on Wall", image: "",
    muscles: ["Deep Cervical Flexors", "Suboccipitals", "Upper Trapezius"],
    duration: "3×10 (5 sec hold)", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+ · Corrects forward head posture — secondary to Scheuermann's kyphosis",
    tips: "Stand with back to wall, head touching. Tuck chin to create 'double chin' — head glides straight back along wall. Do NOT tilt up or down. Hold 5 sec. Forward head posture adds ~4 kg of load per cm of forward displacement on the cervical spine. Correcting this is critical alongside thoracic work.",
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
    tips: "Lie on side, knees bent 45°. Stack hips and shoulders. Keeping feet together, open top knee like a clamshell (30–40°). Lower slowly. Progression: place Domyos 7 kg band just above the knees once 15 reps feel easy.",
  },
  {
    id: "k13b", name: "Banded Clamshell (Domyos 7 kg)", image: "",
    muscles: ["Glute Medius", "Hip Abductors", "Glute Minimus"],
    duration: "3×15/side", difficulty: "Medium", weight: "7", weightUnit: "band",
    notes: "Phase 2+ · Domyos 7 kg band above knees · Glute medius weakness = main scoliosis gait compensation",
    tips: "Same position as clamshell but with Domyos 7 kg band looped just above knees. The band adds constant tension through the full arc — the muscle must work concentrically AND eccentrically. Move slowly: 2 sec open, 2 sec return. Glute medius weakness forces the lumbar to compensate during every step — strengthening it is a priority for dorso-lumbar scoliosis.",
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
    duration: "2×10/side (10 sec hold)", difficulty: "Hard", weight: "7", weightUnit: "band",
    notes: "Phase 3 · Domyos 7 kg band around ankles",
    tips: "Same as Bird-Dog but hold each rep for 10 seconds. Loop the Domyos 7 kg band around both ankles for the leg extension. The band pulls the extending leg down and challenges the glutes and multifidus simultaneously.",
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
    duration: "3×12", difficulty: "Easy", weight: "4", weightUnit: "kg",
    notes: "Day A · Phase 1",
    tips: "Standing or seated, slight bend at elbow. Raise arms out to sides until HORIZONTAL only — no higher. Thumbs slightly down (like pouring a glass). Lower 3 sec. Start with 4 kg (lightest available) and use very strict, slow form — this is enough load for Phase 1. Progress to 5.5 kg when 12 reps feel effortless.",
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
    duration: "3×10/side", difficulty: "Medium", weight: "5.5", weightUnit: "kg",
    notes: "Day B · Phase 1 · Supported",
    tips: "Left knee and hand on chair for support. Spine flat as a table — not rounded. Hold dumbbell in right hand, arm hanging. Pull to your HIP (not shoulder), leading with the elbow. Lower slowly. CRITICAL: flat spine throughout.",
  },
  {
    id: "sb2", name: "Bicep Curl", image: "",
    muscles: ["Biceps", "Forearms"],
    duration: "3×12", difficulty: "Easy", weight: "5.5", weightUnit: "kg",
    notes: "Day B · Phase 1",
    tips: "Stand upright, palms facing forward. Curl both/alternating dumbbells. Lower 3 sec. No torso swing — elbows stay at sides. Isolation exercise — stay controlled.",
  },
  {
    id: "sb3", name: "Dumbbell Reverse Fly", image: "",
    muscles: ["Posterior Deltoid", "Rhomboids", "Middle Trapezius"],
    duration: "3×12", difficulty: "Easy", weight: "4", weightUnit: "kg",
    notes: "Day B · Phase 1",
    tips: "Sit on chair edge, lean forward so chest nearly touches thighs (spine neutral, not rounded). Dumbbells hanging below, palms facing each other. Raise arms out to HORIZONTAL, squeeze shoulder blades. Lower slowly. 4 kg (lightest available) — this exercise demands extreme control; reduce reps rather than reducing weight.",
  },
  {
    id: "sb4", name: "Face Pull (Domyos 7 kg band)", image: "",
    muscles: ["Posterior Deltoid", "Infraspinatus", "Rhomboids", "Middle Trapezius"],
    duration: "3×15", difficulty: "Easy", weight: "7", weightUnit: "band",
    notes: "Day B · Phase 1 · Start 7 kg, progress to 10 kg",
    tips: "Anchor Domyos 7 kg band at head height (door handle, bar). Pull toward face while flaring elbows outward and externally rotating wrists (palms face ceiling at end range). Squeeze shoulder blades at end. The most important postural exercise for forward-rounded shoulders. Do every pull day. When 15 reps are easy, switch to the 10 kg band.",
  },
  {
    id: "sb5", name: "Band / Stick Pull-Apart", image: "",
    muscles: ["Rhomboids", "Posterior Deltoid", "Middle Trapezius"],
    duration: "3×12", difficulty: "Easy", weight: "7", weightUnit: "band",
    notes: "Day B · Phase 1 · Domyos 7 kg band preferred over stick",
    tips: "Hold Domyos 7 kg band (or stick) at chest height, arms extended, hands shoulder-width. Pull ends apart until band touches chest — arms stay straight. Return slowly under control. Band provides accommodating resistance (harder at full stretch) which activates rhomboids more effectively than the stick at end range. Neutral spine — no lower back arch.",
  },
  {
    id: "sb6", name: "Hammer Curl", image: "",
    muscles: ["Biceps", "Brachialis", "Forearms"],
    duration: "2×12", difficulty: "Easy", weight: "5.5", weightUnit: "kg",
    notes: "Day B · Phase 1",
    tips: "Same as bicep curl but palms face each other (neutral grip, like holding a hammer) throughout the entire movement.",
  },
  {
    id: "sb7", name: "Shoulder External Rotation — Side-Lying", image: "",
    muscles: ["Infraspinatus", "Teres Minor", "Rotator Cuff"],
    duration: "2×15/side", difficulty: "Easy", weight: "4", weightUnit: "kg",
    notes: "Day B · Phase 1+ · Medical corrective — never skip",
    tips: "Lie on side. Hold 4 kg dumbbell (lightest available — use extra-slow control: 3 sec up, 3 sec down). Upper arm PINNED against ribs, elbow at 90°, forearm across waist. Rotate forearm UPWARD until vertical. Upper arm must NOT move. If 4 kg causes shoulder strain, perform without weight until rotator cuff strengthens. This corrects the internal rotation dominance that reinforces kyphotic curve. Treat as medical, not strength.",
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
    duration: "3×12", difficulty: "Easy", weight: "7", weightUnit: "kg",
    notes: "Day C · Phase 1",
    tips: "Hold dumbbell vertically at chest. Feet shoulder-width, toes slightly out. Descend slowly — chest up, heels on floor, knees tracking over toes. Lower to parallel. Drive up through heels. Safer for kyphosis than barbell squats (dumbbell at front keeps thoracic upright).",
  },
  {
    id: "sc2", name: "Romanian Deadlift — Light", image: "",
    muscles: ["Hamstrings", "Glutes", "Erector Spinae"],
    duration: "3×10", difficulty: "Medium", weight: "7", weightUnit: "kg",
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
    duration: "2×10/side", difficulty: "Medium", weight: "7", weightUnit: "band",
    notes: "Day C · Phase 1+ · Anti-rotation · 7 kg → 10 kg → 15 kg progression",
    tips: "Anchor Domyos 7 kg band at waist height (door handle). Stand sideways ~1 m from anchor. Hands clasped at chest. Press straight out until arms fully extended — RESIST the rotational pull from the band. Hold 3–5 sec. Return slowly under control. Anti-rotation core training: safest core exercise for spinal pathologies. Progress bands: 7 kg (Phase 1) → 10 kg (Phase 2) → 15 kg (Phase 3).",
  },
  {
    id: "sc_blw", name: "Banded Lateral Walk (Domyos 7 kg)", image: "",
    muscles: ["Glute Medius", "TFL", "Hip Abductors", "Vastus Lateralis"],
    duration: "3×10 steps/direction", difficulty: "Easy", weight: "7", weightUnit: "band",
    notes: "Phase 1+ · Domyos 7 kg band above knees · Key for scoliosis hip stability",
    tips: "Loop Domyos 7 kg band around legs just above knees. Feet shoulder-width, quarter-squat position (slight bend). Step sideways 10 steps left, 10 steps right = 1 set. Keep band taut at all times — do NOT let feet come closer than shoulder-width. Toes point slightly outward. Glute medius is the primary stabiliser of the pelvis during walking; weakness creates a Trendelenburg gait pattern that amplifies the scoliotic curve with every step. Progress to 10 kg band when 10 steps feel easy.",
  },
  {
    id: "sc6", name: "Glute Bridge — Loaded", image: "",
    muscles: ["Glutes", "Hamstrings", "Core"],
    duration: "3×15", difficulty: "Easy", weight: "7", weightUnit: "kg",
    notes: "Day C · Phase 1",
    tips: "Lie on back, dumbbell on lower abdomen/hip crease. Press through heels, lift hips. Squeeze glutes hard at top. Lower 3 sec.",
  },
  // ── Phase 2 Additions ───────────────────────────────────────────────────────
  {
    id: "sa6", name: "Dumbbell Floor Press", image: "",
    muscles: ["Pectorals", "Triceps", "Anterior Deltoid"],
    duration: "4×10", difficulty: "Medium", weight: "7", weightUnit: "kg",
    notes: "Day A · Phase 2 · Replaces Incline Push-Up",
    tips: "Lie on back, knees bent. Dumbbells at lower chest, elbows at 45°. Press both up until fully extended, pause 1 sec. Lower 3 sec. Floor prevents shoulder hyperextension — intentional and safe for kyphosis. Start 7 kg → 8.5 kg → 10 kg as strength builds.",
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
    duration: "3×10/arm", difficulty: "Hard", weight: "8.5", weightUnit: "kg",
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
    duration: "3×8/leg", difficulty: "Hard", weight: "8.5", weightUnit: "kg",
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
  {
    id: "br_sigh", name: "Physiological Double Sigh", image: "",
    muscles: ["Diaphragm", "Autonomic Nervous System"],
    duration: "1–5 cycles", difficulty: "Easy", weight: "", weightUnit: "",
    notes: "All sessions · Garmin: Breathing · Huberman: fastest real-time stress tool",
    tips: "Inhale fully through nose → at the top, sniff a SECOND short inhale to fully inflate lungs → long slow exhale through mouth. The double inhale re-inflates collapsed alveoli and triggers the strongest parasympathetic response possible. 1–3 cycles drops acute stress within 20–30 seconds. Huberman Lab: \"the only real-time technique that works within 1–2 breaths.\"",
  },
  {
    id: "br_nsdr", name: "NSDR — Non-Sleep Deep Rest (10 min)", image: "",
    muscles: ["Autonomic Nervous System", "Dopamine System"],
    duration: "10–20 min", difficulty: "Easy", weight: "", weightUnit: "",
    notes: "Recovery days · Garmin: Yoga · Huberman: restores dopamine + cognitive performance",
    tips: "Lie flat, eyes closed. Follow a Yoga Nidra or NSDR body-scan audio (YouTube: 'Huberman NSDR 10 min' is free). Systematically relax each body part feet → head. Huberman research: 20-min NSDR after sleep deprivation restores performance close to a full night's sleep. Activates the default mode network and dopamine restoration. Perfect for Tue/Sat light sessions.",
  },
  {
    id: "br_co2", name: "BOLT Score — CO₂ Tolerance Test", image: "",
    muscles: ["Diaphragm", "Respiratory Control"],
    duration: "~2 min (assessment)", difficulty: "Easy", weight: "", weightUnit: "",
    notes: "Monthly assessment · Track respiratory progress · BOLT > 25 = good",
    tips: "Breathe normally 2 min. Take a normal exhale through nose. Pinch nose and TIME until FIRST urge to breathe (not until gasping). Record score. < 10 sec = poor. 10–25 = average. > 25 = good. > 40 = athletic. Improves ~2–3 sec/week with consistent nasal + box breathing. Correlates with exercise performance and spinal pain management.",
  },
];

// ─── MOBILITY / YOGA ─────────────────────────────────────────────────────────
// Recovery + cool-down. Garmin type: Yoga
const mobility = [
  {
    id: "mob1", name: "Open Book — Thoracic Rotation", image: "",
    muscles: ["Thoracic Rotators", "Intercostals", "Obliques"],
    duration: "10 reps/side", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+ · Garmin: Yoga · Best single mobility drill for Scheuermann's",
    tips: "Lie on side, knees stacked bent 90° (pillow between optional). Both arms extended forward. Slowly open top arm in a big arc overhead — follow with eyes, let thoracic spine rotate open. Hips stay stacked. Return slowly. This is the most targeted exercise for the thoracic cage tightness of Scheuermann's disease.",
  },
  {
    id: "mob2", name: "World's Greatest Stretch", image: "",
    muscles: ["Hip Flexors", "Thoracic Spine", "Hamstrings", "Groin", "Shoulders"],
    duration: "5 reps/side", difficulty: "Medium", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+ · Garmin: Yoga · Full-body mobility in one movement",
    tips: "Push-up position. Step right foot to right hand (lunge). Drop left knee. Rotate right arm to ceiling, follow with eyes. Return arm. Push hips back for hamstring. Return to start = 1 rep. Perfect for general health and warm-up alternative. Covers all the hip + thoracic restrictions of kyphoscoliosis in a single sequence.",
  },
  {
    id: "mob3", name: "Hip 90/90 Mobility", image: "",
    muscles: ["Hip External Rotators", "Piriformis", "Glute Medius", "Hip Capsule"],
    duration: "90 sec/side", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+ · Garmin: Yoga · Hip restriction = lumbar compensation",
    tips: "Sit on floor, one shin forward, one shin to side (both bent 90°). Shift weight toward back leg (internal rotation) 30 sec → forward leg (external rotation) 30 sec → hold deepest position. Limited hip rotation forces lumbar to compensate during gait — fixing this directly reduces low-back pain in kyphoscoliosis.",
  },
  {
    id: "mob4", name: "Thoracic Spine CARs", image: "",
    muscles: ["Thoracic Rotators", "Erector Spinae", "Intercostals"],
    duration: "5 circles/direction", difficulty: "Medium", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+ · FRC — Controlled Articular Rotations · Maintains joint health",
    tips: "Sit on chair edge, arms crossed. SLOWLY rotate thoracic: forward flex → side bend → extension → other side → return. Only T4–T10 moves — lumbar stays neutral. 1 full revolution = 1 rep. 5 each direction. CARs (Functional Range Conditioning) are specifically recommended for Scheuermann's disc degeneration to maintain costovertebral joint mobility.",
  },
  {
    id: "mob5", name: "Thread the Needle", image: "",
    muscles: ["Thoracic Rotators", "Rhomboids", "Posterior Shoulder"],
    duration: "8 reps/side (3 sec hold)", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+ · Garmin: Yoga · Active thoracic rotation",
    tips: "Hands and knees. Slide right hand under body rotating thoracic — right shoulder toward floor. Extend left arm overhead. Hold 3 sec, breathe into the rotation. Return. The threading motion exaggerates thoracic rotation beyond passive range. Ideal after foam roller to maximise the mobility window.",
  },
  {
    id: "mob6", name: "Doorframe Lat & Thoracic Hang", image: "",
    muscles: ["Latissimus Dorsi", "Thoracic Extensors", "Shoulder Girdle", "Spine"],
    duration: "3×30 sec", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+ · Spinal decompression + lat stretch",
    tips: "Grip sturdy doorframe overhead (or a chin-up bar). Keep feet on floor (partial hang). Let gravity decompress spine. Breathe deeply laterally. The latissimus dorsi is an internal rotator of the shoulder and spinal flexor — tightness directly contributes to kyphosis. Hanging also provides gentle intervertebral traction. Progress: gradually take more weight off feet.",
  },
  {
    id: "mob7", name: "Figure-4 Hip Stretch (Supine)", image: "",
    muscles: ["Piriformis", "Glute Medius", "Hip External Rotators"],
    duration: "60 sec/side", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Phase 1+ · Garmin: Yoga · Piriformis tightness → sciatic-type pain in scoliosis",
    tips: "Lie on back, knees bent. Cross right ankle over left thigh (number-4 shape). Flex right foot. Hug left thigh toward chest or keep left foot on floor. Hold 60 sec minimum per side. The piriformis shares proximity with the sciatic nerve and is commonly tight in dorsal-lumbar scoliosis. Long holds (60 sec+) are needed for fascia.",
  },
];

// ─── IMAGES ──────────────────────────────────────────────────────────────────
// Populated by: node scripts/fetch-exercise-images.mjs YOUR_RAPIDAPI_KEY
import EXERCISE_IMAGES from "./exercise-images.js";

function applyImages(list) {
  return list.map(ex => ({ ...ex, image: EXERCISE_IMAGES[ex.id] || ex.image || "" }));
}

// ─── CARDIO additions ────────────────────────────────────────────────────────
const cardio_extra = [
  {
    id: "ca_walk", name: "Morning Sunlight Walk", image: "",
    muscles: ["Cardiovascular System", "Circadian Rhythm"],
    duration: "10–20 min", difficulty: "Easy", weight: "", weightUnit: "bodyweight",
    notes: "Daily habit · Garmin: Walk · Huberman Protocol #1",
    tips: "Walk outside within 30–60 min of waking. Eyes open toward sky (not at the sun). Even overcast sky works — 10× more photons than indoors. Sets circadian clock, boosts dopamine and serotonin, improves night sleep. Huberman: \"the single most impactful daily habit for long-term health.\"",
  },
  {
    id: "ca_tabata", name: "Tabata Protocol (4 min)", image: "",
    muscles: ["Cardiovascular System", "Full Body", "Anaerobic Capacity"],
    duration: "4 min (8 × 20+10 sec)", difficulty: "Hard", weight: "", weightUnit: "bodyweight",
    notes: "Phase 2+ · Garmin: HIIT · Alternative when time is short",
    tips: "Choose: step-ups, jumping jacks, shadow boxing, or high knees. 20 sec MAX effort → 10 sec rest × 8 rounds = 4 min total. Tabata 1996: improves both aerobic AND anaerobic capacity simultaneously. On Garmin: log as HIIT. Use on days with only 10–15 min available.",
  },
];

// ─── EXERCISES ────────────────────────────────────────────────────────────────
function mergeById(base, extras) {
  const ids = new Set(base.map(e => e.id));
  return [...base, ...extras.filter(e => !ids.has(e.id))];
}

export const EXERCISES = {
  physical_therapy: applyImages(physical_therapy),
  muscle:           applyImages(muscle),
  cardio:           applyImages(mergeById(cardio, cardio_extra)),
  breathing:        applyImages(breathing),
  mobility:         applyImages(mobility),
};

// ─── SCHEDULE ─────────────────────────────────────────────────────────────────
// 4 Active (Mon/Wed/Fri/Sun) + 3 Light recovery (Tue/Thu/Sat)
// Session pattern: S1=Mon S2=Tue S3=Wed S4=Thu S5=Fri S6=Sat S7=Sun
// Session 7 = Sunday = Cardio/HIIT — NOT Strength ✓
export const SCHEDULE = {
  // ── Monday: Kinetotherapy — Spine & Posture (~35 min) ─────────────────────
  Mon: [
    {
      id: "mon_kw", name: "Kineto · Warm-Up", color: "#3b82f6",
      garminType: "Functional Fitness",
      exercises: [
        { category: "physical_therapy", exerciseId: "kw1" },
        { category: "physical_therapy", exerciseId: "kw2" },
      ],
    },
    {
      id: "mon_km", name: "Kineto · Spine & Posture", color: "#3b82f6",
      garminType: "Functional Fitness",
      exercises: [
        { category: "physical_therapy", exerciseId: "k02" }, // Towel Roll — MOST IMPORTANT
        { category: "physical_therapy", exerciseId: "k01" }, // Cat-Cow
        { category: "physical_therapy", exerciseId: "k05" }, // Prone Cobra
        { category: "physical_therapy", exerciseId: "k06" }, // Wall Angels
        { category: "physical_therapy", exerciseId: "k07" }, // Hip Flexor Stretch
        { category: "physical_therapy", exerciseId: "k08" }, // Pectoral Stretch
        { category: "physical_therapy", exerciseId: "k09" }, // Serratus Wall Push
        { category: "physical_therapy", exerciseId: "ks1" }, // McKenzie Press-Up
        { category: "physical_therapy", exerciseId: "ks3" }, // Cervical Retraction
      ],
    },
    {
      id: "mon_kcd", name: "Kineto · Cool-Down", color: "#3b82f6",
      garminType: "Yoga",
      exercises: [
        { category: "physical_therapy", exerciseId: "kc1" },
        { category: "physical_therapy", exerciseId: "kc2" },
        { category: "physical_therapy", exerciseId: "kc3" },
      ],
    },
  ],

  // ── Tuesday: Breathwork — Morning Reset (~10 min, light day) ─────────────
  Tue: [
    {
      id: "tue_br", name: "Breathwork · Morning Reset", color: "#8b5cf6",
      garminType: "Breathing",
      exercises: [
        { category: "breathing", exerciseId: "br_sigh" },
        { category: "breathing", exerciseId: "br_d"    },
        { category: "breathing", exerciseId: "br_box"  },
        { category: "breathing", exerciseId: "br_478"  },
      ],
    },
  ],

  // ── Wednesday: Strength — Upper Body Push + Pull + Zone 2 (~50 min) ──────
  Wed: [
    {
      id: "wed_sw", name: "Strength · Warm-Up", color: "#f59e0b",
      garminType: "Strength Training",
      exercises: [
        { category: "muscle", exerciseId: "sw1" },
      ],
    },
    {
      id: "wed_sp", name: "Strength · Push", color: "#ef4444",
      garminType: "Strength Training",
      exercises: [
        { category: "muscle", exerciseId: "sa1" }, // Incline Push-Up
        { category: "muscle", exerciseId: "sa2" }, // Shoulder Press
        { category: "muscle", exerciseId: "sa3" }, // Lateral Raise
        { category: "muscle", exerciseId: "sa4" }, // Tricep Extension
      ],
    },
    {
      id: "wed_spl", name: "Strength · Pull (2× push volume for kyphosis)", color: "#ef4444",
      garminType: "Strength Training",
      exercises: [
        { category: "muscle", exerciseId: "sb8" }, // I-Y-T (scapular warm-up)
        { category: "muscle", exerciseId: "sb1" }, // One-Arm Row
        { category: "muscle", exerciseId: "sb4" }, // Face Pull (band)
        { category: "muscle", exerciseId: "sb5" }, // Band Pull-Apart
        { category: "muscle", exerciseId: "sb3" }, // Reverse Fly
        { category: "muscle", exerciseId: "sb7" }, // Shoulder External Rotation
      ],
    },
    {
      id: "wed_cd", name: "Cardio · Zone 2 Finish", color: "#0d9488",
      garminType: "Cardio",
      exercises: [
        { category: "cardio", exerciseId: "ca_z2" },
      ],
    },
  ],

  // ── Thursday: Mobility & Recovery (~20 min, light day) ───────────────────
  Thu: [
    {
      id: "thu_mob", name: "Yoga · Mobility & Recovery", color: "#f59e0b",
      garminType: "Yoga",
      exercises: [
        { category: "mobility", exerciseId: "mob5" }, // Thread the Needle
        { category: "mobility", exerciseId: "mob1" }, // Open Book
        { category: "mobility", exerciseId: "mob4" }, // Thoracic CARs
        { category: "mobility", exerciseId: "mob3" }, // Hip 90/90
        { category: "mobility", exerciseId: "mob7" }, // Figure-4
      ],
    },
  ],

  // ── Friday: Kinetotherapy + Core & Stability (~40 min) ───────────────────
  Fri: [
    {
      id: "fri_kw", name: "Kineto · Warm-Up", color: "#3b82f6",
      garminType: "Functional Fitness",
      exercises: [
        { category: "physical_therapy", exerciseId: "kw1" },
        { category: "physical_therapy", exerciseId: "kw2" },
      ],
    },
    {
      id: "fri_km", name: "Kineto · Core & Stability (McGill Big 3)", color: "#3b82f6",
      garminType: "Functional Fitness",
      exercises: [
        { category: "physical_therapy", exerciseId: "k03" },  // Bird-Dog (McGill)
        { category: "physical_therapy", exerciseId: "k04" },  // Dead Bug
        { category: "physical_therapy", exerciseId: "ks2" },  // Modified Curl-Up (McGill)
        { category: "physical_therapy", exerciseId: "k09" },  // Serratus Push
        { category: "physical_therapy", exerciseId: "k10" },  // Foam Roller
        { category: "physical_therapy", exerciseId: "k12" },  // Glute Bridge
        { category: "physical_therapy", exerciseId: "k13" },  // Clamshell (bodyweight → 7kg band)
        { category: "physical_therapy", exerciseId: "k14" },  // Chin Tucks
        { category: "muscle",           exerciseId: "sc_blw" }, // Banded Lateral Walk
      ],
    },
    {
      id: "fri_kcd", name: "Kineto · Cool-Down", color: "#3b82f6",
      garminType: "Yoga",
      exercises: [
        { category: "physical_therapy", exerciseId: "kc1" },
        { category: "physical_therapy", exerciseId: "kc2" },
        { category: "physical_therapy", exerciseId: "kc3" },
      ],
    },
  ],

  // ── Saturday: Active Recovery / Yoga (~20 min, light day) ────────────────
  Sat: [
    {
      id: "sat_mob", name: "Yoga · Active Recovery", color: "#f59e0b",
      garminType: "Yoga",
      exercises: [
        { category: "mobility", exerciseId: "mob2" }, // World's Greatest Stretch
        { category: "mobility", exerciseId: "mob6" }, // Doorframe Hang
        { category: "mobility", exerciseId: "mob1" }, // Open Book
        { category: "mobility", exerciseId: "mob3" }, // Hip 90/90
      ],
    },
    {
      id: "sat_nsdr", name: "Breathwork · NSDR Recovery", color: "#8b5cf6",
      garminType: "Breathing",
      exercises: [
        { category: "breathing", exerciseId: "br_nsdr" },
        { category: "breathing", exerciseId: "br_d"    },
      ],
    },
  ],

  // ── Sunday: Cardio / HIIT (~30 min) — SESSION 7, NOT STRENGTH ✓ ──────────
  Sun: [
    {
      id: "sun_wu", name: "Cardio · Easy Warm-Up (Zone 2)", color: "#0d9488",
      garminType: "Cardio",
      exercises: [
        { category: "cardio", exerciseId: "ca_z2" },
      ],
    },
    {
      id: "sun_hiit", name: "HIIT · Norwegian 2×4 Intervals", color: "#0d9488",
      garminType: "HIIT",
      exercises: [
        { category: "cardio", exerciseId: "ca_2x4" },
      ],
    },
    {
      id: "sun_cd", name: "Breathwork · Post-HIIT Recovery", color: "#8b5cf6",
      garminType: "Breathing",
      exercises: [
        { category: "breathing", exerciseId: "br_sigh" },
        { category: "breathing", exerciseId: "br_box"  },
        { category: "breathing", exerciseId: "br_478"  },
      ],
    },
  ],
};
