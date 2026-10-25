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
