# Scenario Images — Ken Burns Mode

Place your AI-generated images in this folder for each scenario.

## Folder Structure

Each scenario gets its own subfolder named after its **Scenario ID**:

```
images/
└── scenarios/
    ├── water_contamination/     ← already has a real MP4, images not needed
    ├── acid_rain/
    │   ├── 1.jpg
    │   ├── 2.jpg
    │   ├── 3.jpg
    │   ├── 4.jpg
    │   └── 5.jpg
    ├── invasive_species/
    │   ├── 1.webp
    │   └── ...
    └── ...
```

## File Naming Rules

- Files must be named **1, 2, 3, 4 …** (sequential integers, starting from 1)
- **No gaps** — the system stops scanning at the first missing number
- Supported extensions: **jpg, jpeg, webp, png**
- Example: `1.jpg`, `2.jpg`, `3.webp`, `4.png` ✅
- **Wrong**: `intro.jpg`, `scene_2.jpg`, `image1.jpg` ❌

## Recommended Image Count

- **4–6 images** per scenario (ideal pacing with typical 60–120s audio)
- Minimum: 1 image (will just zoom on that single image)
- Maximum: 10 images

## Image Content Suggestions (per image index)

| # | Suggested Content |
|---|-------------------|
| 1 | The problem / setting — wide establishing shot |
| 2 | The location / environment (lab, field, city) |
| 3 | The evidence or data being examined |
| 4 | The expert character / scientist at work |
| 5 | The consequences / impact on people or environment |
| 6 | A hopeful / resolution visual |

## Format Guidelines

- **Resolution**: 1920×1080 (16:9) recommended
- **Format**: JPG or WebP (smaller file size), PNG if transparency needed
- **File size**: Aim for under 500 KB per image for fast loading

## Scenario IDs Reference

| Scenario Name | Folder Name |
|---------------|-------------|
| The Invisible Threat | `water_contamination` |
| Desert Air Quality | `acid_rain` |
| Mangrove Preservation | `invasive_species` |
| Runaway Reaction | `reaction_gone_wrong` |
| Gas Law – Boyle | `gas_boyle_adnoc` |
| Gas Law – Charles | `gas_charles_aviation` |
| Gas Law – Gay-Lussac | `gas_gaylussac_cylinder` |
| Genetic Counseling | `mutation_dilemma` |
| Athlete Performance | `reaction_time` |
| Space Chemistry | `oxygen_failure` |
| Mountain Hazards | `unstable_slope` |
| Grid Load Management | `power_grid` |
| Sustainability | `heat_loss` |
| Medicine Quality | `aspirin_production` |
| Stoichiometric Yield | `aspirin_percent_yield` |
| Green Fuel | `fuelproduction` |
