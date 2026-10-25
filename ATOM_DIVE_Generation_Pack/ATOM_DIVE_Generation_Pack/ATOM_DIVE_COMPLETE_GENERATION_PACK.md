# ATOM DIVE: Lost in the Invisible
## Complete production prompt pack for Perspective X

This archive contains TEXT PROMPTS and JSON production manifests. It does not contain newly generated images, videos or speech.

**Generation outputs:** 4 character-reference images + 8 story images + 12 video keyframe images = 24 images; exactly 6 videos, each at most 5 seconds; 5 distinct voice profiles and 61 separate dialogue recordings. Optional original music/effect prompts are separate.

## What to do first
1. Use the latest ATOM DIVE concept image as the visual reference, not the rejected ECHO mock-up. It establishes Hamad in a white kandura and ghutra, Alya in a teal hijab, Rashid with dark curls and a light technical jacket, and ORBIT's white/cyan silhouette. Do not mix costumes from previous missions. If you already have approved individual references, reuse them rather than regenerating them.
2. Generate/approve the character portraits in `01_character_references/` one at a time.
3. Generate the eight scenes in `02_story_images/`, attaching the approved character references and earlier environment view as needed. Each TXT already includes the shared art direction; it is self-contained.
4. For each video, generate its START frame, then EDIT that same image to make the END frame using `03_video_keyframes/`. Do not create endpoints independently with different cameras. All pairs intentionally have different narrative states, but matching identities, props and geometry.
5. Generate one video per prompt in `04_five_second_videos/`, using the matching pair. Choose 5 seconds when the interface provides a duration setting. Verify actual output duration: prose alone does not enforce an exact clip length. Reuse a seed only for reproducibility when supported; it does not guarantee identical characters.
6. Select one stable ElevenLabs voice per speaker using `05_voiceover/voice_profiles/`. Paste only the contents of each `dialogue_lines/` TXT into speech generation. Its filename is the intended MP3 name. Do not read stage directions. Keep recordings separate and save your original voice settings privately.
7. Use `05_voiceover/audio_manifest.json` for exact text, speaker, order and conditional branches. Do not play every file in folder order. The ending is a common successful recovery; incorrect scientific choices return to the activity after feedback.
8. Read the Codex handoff and story manifest before integration. No repository or deployment changes were made by generating this pack.

## Format and scientific controls
- Landscape 16:9 illustrated visual novel, consistent refined 2D design, not glossy 3D.
- Text, scientific symbols, UI, speech panels and learning diagrams are not generated into the scene images.
- Exact particle diagrams must be generated in application code. Cinematic atomic environments are clearly labelled conceptual simulations when shown.
- No actual human shrinking or real trapped drone. ORBIT is the virtual explorer, and recovery means restoring its simulation route.
- Only metallic bonding formation and comparison with ionic formation/structure. No lessons on conductivity, bending, hardness, melting or alloys.
- Both types involve electrostatic attraction; the components and arrangements differ. Metallic electrons remain in the material, and ion cores are not bare nuclei. Ionic formation in the simplified Na/Cl example transfers electrons, not protons; the ionic attraction is not synonymous with the transfer event.
- Do not bake any inaccurate scientific labels from the concept artwork into new assets.
- The research studio and incident are fictional. Masdar City is the real setting, with no implied endorsement. Avoid fabricated official venue signs or copying unrelated landmarks.
- Keep voiceover separate. A five-second video may end before its speech. Hold the last frame or supplied END image instead of extending, looping, accelerating speech or cutting words.
- Original PNG image masters may be converted into actual optimized WebP derivatives. Never merely rename a file extension.

## File naming for delivered assets
Story outputs: AD_I01_lab.png ... AD_I08_homecoming.png.
Character outputs: C_HAMAD.png, C_ALYA.png, C_RASHID.png, C_ORBIT.png.
Keyframes: AD_V01_START.png / AD_V01_END.png through AD_V06_START.png / AD_V06_END.png.
Videos: retain the exact six names in the video prompts.
Audio: retain each dialogue TXT stem and export as .mp3 or .wav; update the manifest to match the actual format.

## Asset destinations for a future implementation
`public/images/scenarios/atom_dive/story/` - actual optimized scene files.
`public/images/scenarios/atom_dive/characters/` - approved portraits if used by the UI.
`public/videos/scenarios/atom_dive/` - six verified five-second clips.
`public/audio/scenarios/atom_dive/S01/` ... `S12/` - approved speech files.
Keyframe masters, rejected takes and private voice settings stay in the local production backup, not the deployed public directory.

TARGET LEARNER FLOW

0:00-1:15  Research room, incomplete message, accept the mission (I01-I03; V01).
1:15-4:15  Metallic investigation: enter, inspect, reconstruct, explain (I04; V02 and V03).
4:15-7:15  Ionic investigation: electron transfer, charges, attraction, extended lattice (I05; V04).
7:15-9:15  Compare grayscale models, attach evidence, match formation to structure (I06).
9:15-10:00 Recover ORBIT and return to the studio (I07-I08; V05-V06).
10:00-10:30 Brief reflection.
10:30-13:00 Five-question exit ticket.

Students may complete the two investigations in reverse order. The script avoids requiring the metallic branch to be first. No compulsory countdown or response timeout. Mistakes use the same still and a condition-specific spoken hint; they do not require new generated videos. This keeps the video total exactly SIX.




# MASTER STYLE


PROJECT: ATOM DIVE: Lost in the Invisible. Perspective X.
OUTPUT: One clean 16:9 landscape cinematic still, not a poster or storyboard.
STYLE REFERENCE: Use the latest supplied ATOM DIVE concept image for the cast and atmosphere, and the approved illustrated visual-novel screenshot for refined 2D linework. They are visual references, not scientific diagram references.
ART DIRECTION: Premium hand-drawn 2D animated-adventure illustration; expressive semi-realistic faces, fine dark-brown outlines, soft cel shading, painterly architectural detail, natural proportions, rich depth and restrained cinematic lighting. Not photorealism, glossy 3D, plastic characters, exaggerated anime or a childish cartoon. Elegance and readable composition take priority over glowing decoration.
CONTINUITY: Reuse approved character reference images. Match their exact faces, outfits, proportions and accessories. The fictional studio has terracotta screening, shaded glazing, an oval charcoal research table and warm amber practical lighting. Do not import unrelated landmarks, a Louvre-like dome or official logos.
COMPOSITION: Wide film frame. Keep important faces and props inside the middle 80% of the image. Reserve the bottom 20% for a website dialogue panel. Keep scientific interaction areas uncluttered. No baked-in captions, letters, logos, numbers, charge signs, formulas, speech bubbles, buttons or UI.
SIMULATION RULE: The atomic worlds are explicitly artistic environments inside a fictional educational simulation. No actual shrinking, physical human rescue, chemical reaction in a real lab, or material transformation occurs. Narrative route lights are navigation overlays, not chemical bonds or electron trajectories. Exact scientific models, charges and electron counts will be rendered by the website, not by this illustration.
NEGATIVE CONSTRAINTS: No altered faces, extra people, duplicate ORBIT drones, extra fingers, broken perspective, crowded HUD, readable text, arbitrary bonds, planetary electron orbits, fluid made of literal electrons, lightning, melting, explosions or damaged real materials.



# CHARACTER REFERENCE PROMPTS


## C_HAMAD
Create ONE full-body, three-quarter reference portrait of Hamad Al Zaabi, using the male adult on the LEFT of the latest ATOM DIVE concept image as the identity reference. He is a fictional Emirati science mentor, approximately 27, with warm medium-olive skin, dark expressive eyes, the same neat short beard and facial proportions. For this production he wears the approved white kandura, white ghutra and black agal shown in that concept image. He holds a slim dark tablet, with a calm, encouraging expression. Neutral soft-grey background, natural balanced stance, clearly visible face, no labels, no alternate costumes and no multi-view collage. This outfit is locked for ATOM DIVE; do not silently switch to the navy vest from earlier missions.

## C_ALYA
Create ONE full-body, three-quarter reference portrait of Alya, the fictional Emirati teenage explorer in the latest ATOM DIVE concept image. Preserve her exact face and warm olive complexion. Dark teal hijab, modest light-grey exploration jacket, navy trousers, practical shoes and a small backpack. Dark brown eyes, curious determined expression, one hand resting on a slim tablet. Age-appropriate, natural anatomy. Neutral soft-grey background. Do not redesign her hijab, change her complexion or give her blonde hair. No text, logos, alternate outfits or collage.

## C_RASHID
Create ONE full-body, three-quarter reference portrait of Rashid, the fictional teenage explorer with curly dark hair from the latest ATOM DIVE concept image. Preserve his face, warm medium complexion, expressive brown eyes and distinctive dark curls. Wear the same light-grey technical jacket, muted light scarf, teal inner layer, dark trousers and backpack. Friendly, observant, energetic but not comical. Neutral soft-grey background. Distinguish his face clearly from Hamad's. No alternative outfits, logos, text or collage.

## C_ORBIT
Create ONE isolated three-quarter reference portrait of ORBIT, the simulation's small exploration drone, based on the latest ATOM DIVE concept image. Preserve its compact pearl-white oval body, dark faceplate, two simple cyan oval lights, two short swept side fins and small central underside light. Polished hand-drawn 2D rendering, not a 3D toy. Intelligent and appealing but not babyish; no human mouth, arms or large new accessories. Keep the exact silhouette and fin design consistent. Neutral dark-grey background, no text. ORBIT is a virtual explorer inside the educational simulation, not a physically trapped robot.


# STORY IMAGE PROMPTS


## AD_I01_lab - The ordinary specimens
Create the fictional Masdar City research studio at dusk. Hamad stands to the left of an elegant oval table; Alya and Rashid stand together on the right, curious and attentive. On the table sit only two small ordinary specimens: an unlabelled silver-coloured metal sample and a separate colourless salt crystal, on identical dark dishes. A small blank communications screen is dim. No live or fully restored ORBIT is present. Outside, show restrained terracotta screened facades and shaded urban architecture rather than invented famous landmarks. Use warm amber light, muted teal accents and a broad cinematic composition. The important contrast is between ordinary materials and the extraordinary unknown world they conceal.

## AD_I02_lost_signal - The incomplete message
Create a closer view of the SAME research table and cast. Hamad and Alya examine one wide communications screen angled naturally toward them. Show ORBIT only as a dim, prerecorded image within this screen; the drone is not physically in the room. Rashid is secondary at the right edge. Their expressions show curiosity and concern, never panic. Two material specimens remain in their established positions. Leave a clear dark area around the recorded drone so the website can later place the message accurately. No warning words, waveform labels or chemical diagrams. Retain amber-and-navy cinematic lighting and elegant negative space.

## AD_I03_launch - Enter the simulation
Create a first-person view toward the studio's virtual-exploration entrance: a single clean oval simulation aperture, broad enough to dominate the composition without filling it with UI. Inside it, an abstract amber-toned metallic-world vista is faintly visible. Hamad stands beside the control position and makes a small welcoming gesture; Alya and Rashid remain in the studio. They are not shrinking or entering a real specimen. Preserve the original architecture and lighting. The aperture is clearly fictional display technology, not a machine causing a chemical reaction. Keep the centre open and uncluttered. No title, action button or scientific labels.

## AD_I04_metallic_world - The metallic world
Create a breathtaking first-person artistic environment inside the metallic-structure simulation. Vast, softly illuminated, identical metal-core-inspired forms recede in an orderly three-dimensional arrangement at the edges and in the distance. A faint continuous cool-blue atmospheric volume threads the space; it symbolizes the region of delocalized electrons but is NOT water, a flowing river or discrete orbit paths. Use restrained amber highlights, midnight-blue shadows and great depth. Leave the central 45% spacious for a scientifically exact interactive model rendered later. No plus/minus signs, counted electrons, alternating negative metal ions or bonds drawn as rods. No characters or ORBIT in this establishing view. This is a conceptual visualization, not an atom-scale photograph.

## AD_I05_ionic_world - A different arrangement
Create a spectacular first-person environment inside the ionic-crystal simulation, using the same visual-novel drawing technique as the metallic environment. At the edges, distant, softly focused forms suggest a regular extended arrangement of two distinct particle populations. Use restrained violet, teal and pearl light, with deep navy distance. Keep the central 45% clear for the accurate sodium/chloride lattice and electron-transfer interface to be drawn by the website. Do not create an electron sea, a row of isolated molecules, covalent bond rods, chemical symbols or exact scientific diagrams in the background. No literal gems as evidence and no character inside an atom. The mood is surprising, ordered and mysterious.

## AD_I06_evidence_gate - The final comparison
Create a calm, cinematic simulation command space with a broad empty comparison surface, seen from the student's first-person perspective. Two neutral charcoal presentation areas sit side by side at equal scale. They are blank: the website will place unfamiliar monochrome structures here for the final reasoning challenge. The setting combines the restrained amber and violet ambience of both worlds without using colour to indicate a correct answer. In the distance, an unresolved route signal fades into darkness. No ORBIT rescue yet. No headings, diagrams, answers, checkmarks or buttons. Keep the entire central region usable for a comparison activity and the lower region clear for dialogue.

## AD_I07_orbit_found - ORBIT recovered
Create the successful discovery moment inside the SAME metallic-world simulation as AD_I04. The exact approved ORBIT drone floats low beside one immense softly illuminated core-inspired form, outside it, with its cyan eyes gently bright and its fins unchanged. ORBIT is about one fifth of the frame width. A delicate navigation trace is visible as a separate floating simulation overlay, not a physical bond, electron or track on which particles travel. The distant metal-core-inspired arrangement and faint atmospheric electron-region metaphor remain unchanged. Warm-cool cinematic contrast, relief and wonder. No humans, text, scientific labels or new mechanical parts.

## AD_I08_homecoming - Back to the ordinary world
Recreate the exact research table and camera geometry from AD_I01 for the closing scene. Hamad, Alya and Rashid are relieved and quietly proud. The metal specimen and salt crystal remain unchanged in the same dishes. ORBIT is now restored as a small clearly translucent simulation projection above its communication pad, not a physical drone emerging from matter. Hamad looks toward the student with a warm, respectful expression. The amber evening light is gently brighter. Clean premium composition, restrained celebration, no trophy, confetti, sparks, signs, readable screens or claims that a real material has changed.


# VIDEO KEYFRAME PROMPTS


## AD_V01_START
Reference: AD_I02_lost_signal.png
Keep the exact AD_I02 camera, table, cast and lighting. The prerecorded ORBIT image is clearly visible inside the communications screen, cyan eyes moderately bright. Characters watch attentively. The room and material samples are still. This is the first frame of a failing recorded transmission, not a live drone in the room.

## AD_V01_END
Reference: AD_V01_START.png
Edit the supplied START image; do not regenerate the composition. Keep camera, faces, hands, clothing, dishes and architecture identical. Only dim ORBIT's recorded image and break the navigation trace on the screen into two faint disconnected fragments. Alya's expression shows slightly increased curiosity. No giant glitch overlay, text or frightening failure. Hold this as a readable, unresolved message.

## AD_V02_START
Reference: AD_I04_metallic_world.png
Use the approved metallic-world image as the interior view. Add only a thin dark oval simulation-aperture rim occupying the outer edges, as though the first-person camera is about to pass through it. The amber metallic vista is already visible beyond. No cast, no ORBIT, no actual scientific interaction or material deformation. This is a view transition into a virtual world.

## AD_V02_END
Reference: AD_V02_START.png
Edit the START frame to show a modest forward camera movement through the aperture. The rim is now outside the image; the SAME metallic-world vista occupies the frame at a slightly closer scale. Match every major background form and lighting direction. Nothing changes chemical identity or morphs. Keep the centre free for the later interactive model.

## AD_V03_START
Reference: AD_I04_metallic_world.png
Use the same metallic-world composition after the student's verified model reconstruction. Introduce a faint broken navigation overlay floating independently in front of the background, with two separated pale segments. This is a software route marker, not an electron pathway or chemical bond. No ORBIT is visible. Leave all material forms and the atmosphere unchanged.

## AD_V03_END
Reference: AD_V03_START.png
Edit the START frame only. Connect the two faint navigation-overlay segments into a fine softly illuminated route marker leading toward the distance. Preserve all forms, camera geometry and lighting. The background's electron-region metaphor does not move into the route or become a road. The scene expresses a repaired map, not a changed chemical substance. No labels or numerical score.

## AD_V04_START
Reference: AD_I05_ionic_world.png
Use the approved ionic-world artwork as the view beyond a thin dark simulation-aperture rim. Keep both populations of distant forms softly focused and preserve the empty central interaction area. The first-person camera is about to enter this separate sample simulation. No human, ORBIT, electron transfer or scientific result is visible.

## AD_V04_END
Reference: AD_V04_START.png
Edit the START frame into the endpoint of a modest forward camera movement. Remove the aperture rim from view and reveal the SAME ionic-world environment slightly closer. Keep the lattice-inspired background fixed. Do not transform metal into salt or show an electron sea. Leave all precise scientific content to the website.

## AD_V05_START
Reference: AD_I07_orbit_found.png
Create the moment just before ORBIT is clearly recovered. Retain the AD_I07 metallic setting, camera and drone silhouette. ORBIT is partly occluded by the near edge of the large form; its cyan face lights are faint but visible. Keep a clear route for the drone to move slightly into view. No humans, text or chemistry animation.

## AD_V05_END
Reference: AD_V05_START.png
Edit the START image into the approved AD_I07 discovery composition: ORBIT moves a short distance into clear view, its cyan lights return to normal brightness and it makes a tiny attentive tilt. All background forms, camera position, proportions and fin details remain fixed. No extra drone, new mouth or childish exaggerated expression.

## AD_V06_START
Reference: AD_I08_homecoming.png
Use the exact AD_I08 closing laboratory composition, but the translucent ORBIT projection has not fully brightened yet. Hamad, Alya and Rashid watch with cautious anticipation. The two original material specimens are untouched and unchanged. This is a restored simulation signal in the studio, not a physical teleportation.

## AD_V06_END
Reference: AD_V06_START.png
Edit the START frame only. The ORBIT projection is now fully legible with a restrained cyan glow. Hamad gives a slight approving smile; Alya and Rashid show relief. Keep the same pose families, table, camera, specimens, architecture and evening light. No trophy, printed message, chemical change or dramatic new object.


# FIVE-SECOND VIDEO PROMPTS


Create one 16:9 cinematic 2D illustrated animation, exactly 5.0 seconds at export and never longer than 5 seconds. Match the supplied first frame at the beginning and supplied last frame at the end. Preserve character identity, costumes, geometry, lighting and drawing technique. Use one simple, continuous shot; no montage, jump cuts, face morphing or unexpected objects. Use the approved ATOM DIVE visual-novel style: fine outlines, expressive natural faces, soft cel shading, painted depth and restrained glow. No text, formulas, charge labels, UI or lip-synced speech. Generate silent footage; voices, music and effects are separate. Do not animate an unverified scientific model. The fictional journey is a simulation, and its route effects do not represent chemical mechanisms. Keep the final 0.5 seconds visually steady. Verify the downloaded duration rather than relying on the prompt alone.

## AD_V01_last_signal
First frame: AD_V01_START.png
Last frame: AD_V01_END.png
Trigger: Opening, after the research-room introduction.
0.0-1.0 s: Hold the supplied first frame. The prerecorded ORBIT image is visible on the communication screen; the cast makes only tiny natural blinks.
1.0-4.0 s: The recorded image dims subtly and its navigation trace loses continuity. Keep the surrounding research room perfectly stable. Alya makes a small concerned eye movement.
4.0-5.0 s: Arrive at the supplied end frame. Hold the final half-second. No full-screen glitch or frightened reaction.
CAMERA: Locked medium shot. The only important change is the lost message.
OPTIONAL SEPARATE SPOKEN LINE: ORBIT - "My return route is incomplete."

## AD_V02_enter_metallic
First frame: AD_V02_START.png
Last frame: AD_V02_END.png
Trigger: When the student chooses to enter the metallic investigation.
0.0-1.0 s: First-person view through the simulation rim toward the amber metallic environment.
1.0-4.0 s: One gentle forward dolly crosses the virtual threshold. The rim slips outside the frame. The environment enlarges consistently with perspective.
4.0-5.0 s: Settle into the supplied final composition and hold. Preserve all large forms; no swirling tunnel, teleportation flash or morphing material.
CAMERA: Smooth, slow axial movement with no roll.
OPTIONAL SEPARATE SPOKEN LINE: Narrator - "An ordinary sample. An extraordinary hidden world."

## AD_V03_metallic_route
First frame: AD_V03_START.png
Last frame: AD_V03_END.png
Trigger: Only after the student correctly reconstructs metallic bonding and identifies its attraction.
0.0-1.0 s: Hold the metallic environment and its faint disconnected route overlay.
1.0-4.0 s: Illuminate the small missing section of the navigation overlay. The overlay connects gently while the material background stays unchanged.
4.0-5.0 s: Hold the completed route in the supplied end frame. No atomic motion, new negative metal ions or electrical current effects.
CAMERA: Stationary. This is a software map confirmation, not an animation of a bonding mechanism.
OPTIONAL SEPARATE SPOKEN LINE: Hamad - "Your evidence restored part of ORBIT's route."

## AD_V04_enter_ionic
First frame: AD_V04_START.png
Last frame: AD_V04_END.png
Trigger: When the student chooses the ionic investigation; valid in either investigation order.
0.0-1.0 s: View the cool violet-and-teal ionic environment through the simulation rim.
1.0-4.0 s: Move forward through the rim, revealing the repeating background at a modestly closer scale. Preserve the two types of distant forms without changing their arrangement.
4.0-5.0 s: Settle into the final frame; leave the central area open for the accurate interactive model.
CAMERA: Slow axial dolly without a cut. Do not transform one type of material into another.
OPTIONAL SEPARATE SPOKEN LINE: Narrator - "Another material. A different arrangement to explain."

## AD_V05_find_orbit
First frame: AD_V05_START.png
Last frame: AD_V05_END.png
Trigger: Only after both investigations and the evidence-based final location decision are complete.
0.0-1.0 s: ORBIT is partly hidden beside the large metallic-world form, its cyan eyes faint.
1.0-4.0 s: ORBIT floats a small distance into clear view and brightens its eye lights. Give its body one tiny attentive tilt; maintain fins and silhouette exactly.
4.0-5.0 s: Hold the supplied end frame. The world stays unchanged; the student restored a map, not the material's chemistry.
CAMERA: Locked composition with natural painted depth.
OPTIONAL SEPARATE SPOKEN LINE: ORBIT - "You found me. Route confirmed."

## AD_V06_homecoming
First frame: AD_V06_START.png
Last frame: AD_V06_END.png
Trigger: Shared ending after ORBIT is recovered, before reflection and the exit ticket.
0.0-1.0 s: Hold the original research room and unchanged metal and salt specimens. ORBIT's restored simulation projection is faint.
1.0-4.0 s: The projection becomes clear. Hamad gives a restrained approving nod. Alya and Rashid smile with quiet relief.
4.0-5.0 s: Finish on the supplied end frame with a stable half-second hold. No fireworks, physical drone teleportation, new props or chemical transformation.
CAMERA: Very gentle push only if the endpoint perspective supports it.
OPTIONAL SEPARATE SPOKEN LINE: Hamad - "You found the route by understanding the bonds."


# VOICEOVER PROMPTS AND COMPLETE SCRIPT


# ATOM DIVE - Complete voiceover script

Generate only the supplied dialogue, not the filename, speaker label or instructions. Clear natural English for Grade 10 learners. Consistent original or properly licensed character voice, no imitation of a real identifiable person. No music, sound effects, room echo or artificial radio distortion in the voice stem. Preserve scientific wording. Use a comfortable conversational pace with brief natural pauses. Do not force the recording into five seconds; video and dialogue have independent durations. Export one clean WAV master or high-quality MP3 per dialogue line. Keep the same voice ID, model and generation settings throughout. Do not read chemical strings letter by letter: use the spoken wording supplied. Only one character speaks in each file.

## NAR
An adult cinematic narrator with warm, clear, inviting delivery. Curious rather than ominous; restrained wonder and a slightly slower pace. Use a distinct voice from Hamad. No exaggerated trailer-announcer bass.

## HAM
Hamad: young adult male science mentor, approximately 27. Calm, intelligent, warm and precise. Clear fluent English; a subtle natural UAE-English accent is welcome if genuinely available, never forced. Encourage reasoning rather than announce all answers. Retain the established Hamad voice from earlier missions when available.

## ALY
Alya: teenage female research partner. Curious, capable, expressive and hopeful, with natural age-appropriate delivery. Clear English, no babyish pitch or exaggerated accent. She sounds like a partner investigating alongside the student.

## RAS
Rashid: teenage male research partner. Warm, lively and observant. A different timbre from Hamad, slightly quicker but always intelligible. Show surprise through small changes in delivery rather than shouting.

## ORB
ORBIT: an original gender-neutral digital explorer voice. Bright, intelligible, lightly synthetic and curious, but not childish. Use subtle electronic character only; no vocoder effect that obscures scientific words. Maintain one stable voice throughout.

## S01

### AD_S01_NAR_01
**Speaker:** NAR | **Condition:** story
At Masdar City, two ordinary specimens are about to reveal an extraordinary story.

### AD_S01_HAM_02
**Speaker:** HAM | **Condition:** story
A metal sample. A salt crystal. ORBIT explored both inside our scientific simulation.

### AD_S01_RAS_03
**Speaker:** RAS | **Condition:** story
Its observations are here, but part of its return map is missing.

## S02

### AD_S02_ORB_01
**Speaker:** ORB | **Condition:** story
My return route is incomplete.

### AD_S02_ALY_02
**Speaker:** ALY | **Condition:** story
It left clues in both worlds. We can work out where it went.

### AD_S02_HAM_03
**Speaker:** HAM | **Condition:** story
ORBIT is a virtual explorer. Nobody has shrunk, and nothing has happened to the real samples.

### AD_S02_HAM_04
**Speaker:** HAM | **Condition:** story
Your mission is to reconstruct the bonding models, compare the evidence, and restore its route.

## S03

### AD_S03_NAR_01_ENTER_METALLIC
**Speaker:** NAR | **Condition:** enter-metallic
An ordinary sample. An extraordinary hidden world.

### AD_S03_HAM_02
**Speaker:** HAM | **Condition:** story
Choose which world to investigate first. You will need evidence from both.

### AD_S03_ALY_03
**Speaker:** ALY | **Condition:** story
Inspect before you decide. The first clue might not be the whole answer.

## S04

### AD_S04_ORB_01
**Speaker:** ORB | **Condition:** story
I recorded positive centres everywhere. Where was the negative charge?

### AD_S04_HAM_02
**Speaker:** HAM | **Condition:** story
Use the atomic lens. Inspect the positive metal ion cores and the outer electrons in this simplified model.

### AD_S04_ALY_03
**Speaker:** ALY | **Condition:** story
The picture helps us explore, but the interactive model is where we test our explanation.

## S05

### AD_S05_HAM_01
**Speaker:** HAM | **Condition:** story
Reconstruct the metallic structure. What happens to the valence electrons when the metal forms?

### AD_S05_HAM_02
**Speaker:** HAM | **Condition:** story
Now identify the two charged components whose attraction holds this structure together.

### AD_S05_HAM_03_METAL_COMPLETE
**Speaker:** HAM | **Condition:** metal-complete
In this model, valence electrons are delocalized throughout the metal. Their attraction to positive metal ion cores is metallic bonding.

### AD_S05_HAM_04_METAL_COMPLETE
**Speaker:** HAM | **Condition:** metal-complete
The electrons are still part of the material. Its positive and negative charges balance overall.

### AD_S05_HAM_05_METAL_COMPLETE
**Speaker:** HAM | **Condition:** metal-complete
Your evidence restored part of ORBIT's route.

### AD_S05_HAM_90_METAL_TRANSFER_ERROR
**Speaker:** HAM | **Condition:** metal-transfer-error
You created alternating positive and negative metal ions. Does that match the metallic model?

### AD_S05_HAM_91_METAL_ELECTRONS_ESCAPE
**Speaker:** HAM | **Condition:** metal-electrons-escape
The electrons have not left the specimen. How could its total charge remain neutral if they disappeared?

### AD_S05_HAM_92_METAL_FIXED_PAIR_ERROR
**Speaker:** HAM | **Condition:** metal-fixed-pair-error
Check whether the electrons belong to fixed pairs, or are delocalized through the whole structure.

### AD_S05_ALY_93_METAL_ATTRACTION_ERROR
**Speaker:** ALY | **Condition:** metal-attraction-error
Our model needs to show what attracts what. Two positive cores do not explain the bonding by themselves.

## S06

### AD_S06_HAM_01
**Speaker:** HAM | **Condition:** story
Save your explanation. Both formation models belong in the evidence record.

### AD_S06_RAS_02
**Speaker:** RAS | **Condition:** story
The map is becoming clearer. Keep the evidence, not just the picture.

## S07

### AD_S07_NAR_01_ENTER_IONIC
**Speaker:** NAR | **Condition:** enter-ionic
Another material. A different arrangement to explain.

### AD_S07_ORB_02
**Speaker:** ORB | **Condition:** story
This recorded world contains positive and negative ions. The earlier description does not fit.

### AD_S07_HAM_03
**Speaker:** HAM | **Condition:** story
Rewind the simplified formation model. Start with a sodium atom and a chlorine atom.

### AD_S07_HAM_04
**Speaker:** HAM | **Condition:** story
Observe what changes when one electron moves from sodium to chlorine.

## S08

### AD_S08_HAM_01_IONIC_TRANSFER_COMPLETE
**Speaker:** HAM | **Condition:** ionic-transfer-complete
Check the particles and their charges. Have the nuclei changed, or only the numbers of electrons?

### AD_S08_HAM_02_IONIC_CHARGE_COMPLETE
**Speaker:** HAM | **Condition:** ionic-charge-complete
Sodium loses one electron and becomes a positive sodium ion. Chlorine gains it and becomes a negative chloride ion.

### AD_S08_HAM_03_IONIC_ATTRACTION_COMPLETE
**Speaker:** HAM | **Condition:** ionic-attraction-complete
Electron transfer forms the ions in this example. Ionic bonding is the electrostatic attraction between the oppositely charged ions.

### AD_S08_HAM_04_IONIC_LATTICE_COMPLETE
**Speaker:** HAM | **Condition:** ionic-lattice-complete
Expand the view. Solid sodium chloride is an extended ionic lattice, not a collection of separate sodium chloride molecules.

### AD_S08_ALY_05_BOTH_INVESTIGATIONS_COMPLETE
**Speaker:** ALY | **Condition:** both-investigations-complete
We have two formation explanations. Now we can compare the structures they produce.

### AD_S08_HAM_90_IONIC_PROTON_ERROR
**Speaker:** HAM | **Condition:** ionic-proton-error
Move an electron, not a proton. Changing the proton number would change the element.

### AD_S08_HAM_91_IONIC_CHARGE_ERROR
**Speaker:** HAM | **Condition:** ionic-charge-error
Losing a negative electron makes the sodium ion positive. Check your charge calculation.

### AD_S08_HAM_92_IONIC_ELECTRON_SEA_ERROR
**Speaker:** HAM | **Condition:** ionic-electron-sea-error
An electron sea describes the metallic model. Which charged particles attract in this ionic structure?

### AD_S08_HAM_93_IONIC_MOLECULE_ERROR
**Speaker:** HAM | **Condition:** ionic-molecule-error
One pair is not the complete solid. Show how the positive and negative ions repeat through the structure.

## S09

### AD_S09_NAR_01
**Speaker:** NAR | **Condition:** story
The final recording arrives without a location label.

### AD_S09_ORB_02
**Speaker:** ORB | **Condition:** story
I am beside positive metal ion cores, with electrons delocalized throughout the surrounding structure.

### AD_S09_HAM_03
**Speaker:** HAM | **Condition:** story
The colours and names are hidden. Which model matches the recording? Support your decision with two observations.

### AD_S09_ALY_04
**Speaker:** ALY | **Condition:** story
Then match each formation sequence to its resulting structure. That will complete the route.

### AD_S09_HAM_90_FINAL_WRONG_WORLD
**Speaker:** HAM | **Condition:** final-wrong-world
The ionic lattice contains cations and anions. Compare that with the components in ORBIT's description.

### AD_S09_HAM_91_FINAL_SAME_BOND_ERROR
**Speaker:** HAM | **Condition:** final-same-bond-error
Both bonding types involve electrostatic attraction, but they do not involve the same charged components.

### AD_S09_ALY_92_FINAL_COLOUR_ONLY
**Speaker:** ALY | **Condition:** final-colour-only
The colour is only an illustration choice. Use the particles and their attraction as evidence.

### AD_S09_HAM_93_FINAL_NO_EVIDENCE
**Speaker:** HAM | **Condition:** final-no-evidence
Your location choice needs an explanation. Identify the charged components and what attracts them.

### AD_S09_HAM_05_FINAL_SUPPORTED
**Speaker:** HAM | **Condition:** final-supported
Your evidence matches the metallic model. The complete comparison restores ORBIT's return map.

## S10

### AD_S10_ORB_01_FINAL_SUPPORTED
**Speaker:** ORB | **Condition:** final-supported
You found me. Route confirmed.

### AD_S10_ALY_02
**Speaker:** ALY | **Condition:** story
We found the explorer by understanding the world it described.

### AD_S10_HAM_03
**Speaker:** HAM | **Condition:** story
Exactly. The models did not change the real substances. They changed what we could explain.

## S11

### AD_S11_HAM_01
**Speaker:** HAM | **Condition:** story
You found the route by understanding the bonds.

### AD_S11_RAS_02
**Speaker:** RAS | **Condition:** story
The two specimens still look ordinary. Their structures do not.

### AD_S11_NAR_03
**Speaker:** NAR | **Condition:** story
Two hidden worlds. Two explanations. One journey completed through evidence.

### AD_S11_HAM_04
**Speaker:** HAM | **Condition:** story
Before you finish, explain one difference in how the bonds form and one difference in what holds the structures together.

## S12

### AD_S12_NAR_01
**Speaker:** NAR | **Condition:** story
Five questions check your understanding. Answer all five, then submit. Four correct answers earns the mission achievement.

### AD_S12_HAM_02_QUESTION_1_READ
**Speaker:** HAM | **Condition:** question-1-read
In the metallic model, what happens to the valence electrons?

### AD_S12_HAM_03_QUESTION_2_READ
**Speaker:** HAM | **Condition:** question-2-read
Which attraction holds a metallic structure together?

### AD_S12_HAM_04_QUESTION_3_READ
**Speaker:** HAM | **Condition:** question-3-read
A sodium atom transfers one electron to a chlorine atom. Which result is correct?

### AD_S12_HAM_05_QUESTION_4_READ
**Speaker:** HAM | **Condition:** question-4-read
Which statement correctly separates electron transfer from ionic bonding?

### AD_S12_HAM_06_QUESTION_5_READ
**Speaker:** HAM | **Condition:** question-5-read
Model X has positive metal ion cores and delocalized electrons. Model Y has a repeating arrangement of cations and anions. Which comparison is correct?

### AD_S12_HAM_07_ASSESSMENT_PASS
**Speaker:** HAM | **Condition:** assessment-pass
Well done. You can explain metallic bonding and distinguish it from ionic bonding.

### AD_S12_HAM_08_ASSESSMENT_REVIEW
**Speaker:** HAM | **Condition:** assessment-review
Revisit the model linked to your feedback. Then try again using the evidence.



# OPTIONAL SOUND PROMPTS


## AD_MUSIC_exploration
Create an original 60-second seamless instrumental loop for an elegant illustrated microscopic science adventure. Restrained piano, warm soft strings, subtle glass-like tones and a quiet atmospheric synth. Curious, hopeful, spacious, not threatening. No vocals, spoken words, imitation of a named composer, explosive percussion or sudden volume changes. Leave generous sonic space for narration. Deliver an unmixed music-only stem.

## AD_AMB_studio
Create a quiet 20-second seamless background ambience for a fictional modern research studio: soft ventilation and a very gentle equipment hum. No voices, keyboard typing, beeping, music or identifiable announcements. Subtle and non-distracting.

## AD_SFX_dive
Create a gentle two-second transition sound for entering a fictional digital microscopic simulation: a soft airy rise followed by a light glass resonance. No blast, scream, harsh high frequency, spoken words or music.

## AD_SFX_evidence
Create a refined one-second evidence-confirmation sound: two restrained clear notes with a brief soft decay. Positive but not game-show-like. No voice or musical bed.

## AD_SFX_reconsider
Create a soft one-second reconsideration cue for a learning activity. A quiet descending two-note tone, neutral and supportive, never a loud failure buzzer. No speech or music.

## AD_SFX_orbit
Create an original half-second subtle identification chirp for a small virtual exploration drone. Clear and friendly without sounding childish. No speech, no copyrighted robot imitation, no music.

## AD_SFX_recovery
Create a restrained three-second hopeful resolution cue: warm glass-like notes and a soft airy finish. Original, no vocals, no loud crescendo, no exaggerated reward sounds.


# EXIT TICKET


## AD_Q1
In the metallic bonding model, what happens to the valence electrons?
A. They disappear from the material.
B. They become delocalized throughout the metallic structure.
C. They form a separate set of negative metal ions.
D. Each electron is fixed between only two neighbouring cores.
Answer: B
Feedback: Valence electrons are delocalized through the metallic structure; they remain part of the material.

## AD_Q2
Which attraction holds a metallic structure together?
A. Attraction between two positive metal ion cores alone.
B. Attraction between negative metal ions and neutral atoms.
C. Attraction between different nuclei after protons transfer.
D. Electrostatic attraction between positive metal ion cores and delocalized electrons.
Answer: D
Feedback: The positive cores and delocalized negative electrons are the charged components in this model.

## AD_Q3
A sodium atom transfers one electron to a chlorine atom. Which result is correct?
A. Na+ and Cl- form; their proton counts stay the same.
B. Na- and Cl+ form; their proton counts stay the same.
C. Both atoms become negative ions.
D. The elements change because their nuclei exchange protons.
Answer: A
Feedback: Sodium loses an electron and becomes positive; chlorine gains it and becomes negative. Their nuclei do not change.

## AD_Q4
Which statement correctly separates electron transfer from ionic bonding in the sodium-chlorine model?
A. The transfer itself is the only force keeping the completed solid together.
B. Electron transfer makes neutral atoms that then share an electron sea.
C. Transfer produces ions; electrostatic attraction between opposite ions is ionic bonding.
D. Transfer removes all electrons from both atoms.
Answer: C
Feedback: Forming charged ions and explaining the force between those ions are related but distinct steps.

## AD_Q5
Model X contains positive metal ion cores and delocalized electrons. Model Y contains repeating cations and anions. Which comparison is correct?
A. Both are ionic structures because both contain positive particles.
B. X is metallic and Y is ionic; both involve electrostatic attraction between different charged components.
C. X is ionic and Y is metallic.
D. Both are metallic because all solids have an electron sea.
Answer: B
Feedback: The particles involved and their arrangement distinguish the metallic and ionic models, not their illustration colours.


# IMPLEMENTATION HANDOFF


PERSPECTIVE X - ATOM DIVE MEDIA HANDOFF

Build a new mission from this production pack; do not silently change existing scenarios. This pack contains proposed source prompts and authored story data, not generated or verified playable media.

Reuse the platform's illustrated visual-novel presentation: one persistent scene, active-speaker dialogue panel, distinct narrator treatment, collapsible log, audio replay, manual Continue and accessible investigation overlays. Keep current character identity locked to the latest ATOM DIVE mock-up. The optional scene illustrations are backgrounds, not scientific answer keys.

Use the 8 images and 6 video filenames from the manifests. Produce verified optimized web copies of image masters without merely renaming extensions. Do not auto-upload raw masters, private voice IDs, API keys or production-only notes into public folders. Do not use obsolete Ocean Dome or dessert asset names.

Implement the metallic and ionic models as deterministic interactive scientific components. Preserve all particles and charges as specified in the learning manifest. Do not model metallic formation as positive and negative metal ions, let electrons leave the specimen, identify ionic bonding as electron transfer alone, or represent solid NaCl as isolated molecules. Keep all material-property objectives outside this mission.

The student chooses investigation order, but both required investigations must be completed before the grayscale final comparison unlocks. Use condition-keyed spoken feedback for errors. Do not play all branch recordings sequentially. Revising a choice must retain the evidence record and record the actual attempt; do not grant progress for merely watching a video.

Use audio_manifest.json to connect each scene, speaker, exact line and branch. Play recorded files first. Never guess a line's branch from alphabetic order. When a file is missing, retain the readable text and flag the missing recording rather than claim it exists. Avoid duplicate voice tracks from video audio. Block overlapping narration; stop audio on exit, replay or navigation. Pause media on tab hide; resume only with appropriate controls.

Each clip is at most 5.0 seconds. Measure actual duration and flag/trim a generation that exceeds the requirement while preserving its requested endpoint. Do not stretch, slow or loop a video to fit speech. At the end, hold the actual end frame, or the supplied END still, until the dialogue finishes and the student continues. Longer lines belong on still scenes. Silence is valid.

Provide a clear Start button to enable audio, captions, optional voice, keyboard alternatives to dragging, touch support, replay, pause and reduced motion. Keep investigations untimed. The target completion time is 10-15 minutes, not a hard deadline. Render formula labels and all assessment options as accessible HTML/SVG. Final comparison must randomize left/right placement without allowing colour to reveal the answer.

Use the five questions in exit_ticket.json, four options per question, 80% passing. Reveal answers after full submission, not during the story. Read question options on request if accessible audio is implemented. Record the 5-answer result and reuse existing teacher, notebook and progression infrastructure without unsupported claims of semantic AI grading.

Validate all image formats, asset URLs, voice mappings, 5-second durations, branch paths, charge calculations, save/resume and reduced motion. Preserve all unrelated art, music, code and user records. Work in a separate development branch; do not merge or deploy without approval. Report what was actually verified and all missing assets.



# REFERENCES


SCIENCE AND SETTING REFERENCES

These links support the scientific guardrails and real-world location only. The characters, virtual studio, missing route, dialogue, original assessment and cinematic production directions are newly authored fiction.

Royal Society of Chemistry - Metallic bonding teaching resource:
https://edu.rsc.org/metallic-bonding/how-to-teach-metallic-bonding/4017471.article

OpenStax, Chemistry 2e, 7.1 Ionic Bonding:
https://openstax.org/books/chemistry-2e/pages/7-1-ionic-bonding

OpenStax, Chemistry 2e, 10.5 The Solid State of Matter:
https://openstax.org/books/chemistry-2e/pages/10-5-the-solid-state-of-matter

Masdar City official website:
https://masdarcity.ae/

The illustrative 'electron sea' is a simplified bonding model, not literal liquid. The sodium/chlorine formation interaction is an educational particle model, not a real-laboratory reaction procedure. No third-party source illustration, passage or assessment has been copied into this pack.
