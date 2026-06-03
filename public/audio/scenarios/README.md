# Scenario Audio — Ken Burns Mode

Place your **ElevenLabs-generated** MP3 narration files here.

## File Naming Rules

Each file must be named exactly after its **Scenario ID** with `.mp3` extension:

```
audio/
└── scenarios/
    ├── acid_rain.mp3
    ├── invasive_species.mp3
    ├── reaction_gone_wrong.mp3
    ├── gas_boyle_adnoc.mp3
    ├── gas_charles_aviation.mp3
    ├── gas_gaylussac_cylinder.mp3
    ├── mutation_dilemma.mp3
    ├── reaction_time.mp3
    ├── oxygen_failure.mp3
    ├── unstable_slope.mp3
    ├── power_grid.mp3
    ├── heat_loss.mp3
    ├── aspirin_production.mp3
    ├── aspirin_percent_yield.mp3
    └── fuelproduction.mp3
```

> **Note**: `water_contamination` already has a real MP4 video, so it doesn't need an MP3.

## How the System Uses These Files

The Ken Burns slideshow will:
1. **Auto-play** the MP3 when the student enters the scenario
2. **Cycle through images** proportionally to the audio duration
3. **Display subtitles** timed to audio playback position (derived from scenario text)
4. **Show "Start Mission"** button after audio finishes

## Format Guidelines

- **Format**: MP3 (required)
- **Bitrate**: 128 kbps minimum, 192 kbps recommended
- **Sample Rate**: 44.1 kHz
- **Duration**: Typically 60–120 seconds per scenario

## ElevenLabs Export Tips

- Use a **narrative/documentary** voice style
- Export as **MP3** at highest quality
- Mix in background ambience if desired — the MP3's own audio plays directly
- The narration text should cover:
  1. The scenario context (what's happening)
  2. The student's role and mission
  3. A teaser of the decision they'll face

## Scenario IDs Reference

| Scenario Name | Audio File |
|---------------|------------|
| Desert Air Quality | `acid_rain.mp3` |
| Mangrove Preservation | `invasive_species.mp3` |
| Runaway Reaction | `reaction_gone_wrong.mp3` |
| Gas Law – Boyle | `gas_boyle_adnoc.mp3` |
| Gas Law – Charles | `gas_charles_aviation.mp3` |
| Gas Law – Gay-Lussac | `gas_gaylussac_cylinder.mp3` |
| Genetic Counseling | `mutation_dilemma.mp3` |
| Athlete Performance | `reaction_time.mp3` |
| Space Chemistry | `oxygen_failure.mp3` |
| Mountain Hazards | `unstable_slope.mp3` |
| Grid Load Management | `power_grid.mp3` |
| Sustainability | `heat_loss.mp3` |
| Medicine Quality | `aspirin_production.mp3` |
| Stoichiometric Yield | `aspirin_percent_yield.mp3` |
| Green Fuel | `fuelproduction.mp3` |
