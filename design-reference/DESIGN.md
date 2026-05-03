---
name: Scientific Escape Interface
colors:
  surface: '#f5fafc'
  surface-dim: '#d5dbdd'
  surface-bright: '#f5fafc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4f7'
  surface-container: '#e9eff1'
  surface-container-high: '#e3e9eb'
  surface-container-highest: '#dee3e6'
  on-surface: '#171d1e'
  on-surface-variant: '#3d494c'
  inverse-surface: '#2b3133'
  inverse-on-surface: '#ecf2f4'
  outline: '#6d797d'
  outline-variant: '#bcc9cd'
  surface-tint: '#00687a'
  primary: '#00687a'
  on-primary: '#ffffff'
  primary-container: '#06b6d4'
  on-primary-container: '#00424f'
  inverse-primary: '#4cd7f6'
  secondary: '#006e2f'
  on-secondary: '#ffffff'
  secondary-container: '#6bff8f'
  on-secondary-container: '#007432'
  tertiary: '#0053db'
  on-tertiary: '#ffffff'
  tertiary-container: '#85a3ff'
  on-tertiary-container: '#003490'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#6bff8f'
  secondary-fixed-dim: '#4ae176'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005321'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f5fafc'
  on-background: '#171d1e'
  surface-variant: '#dee3e6'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.1em
  code-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  grid_gutter: 24px
  grid_margin: 40px
---

## Brand & Style

The design system is engineered to evoke a sense of clinical precision, high-stakes scientific discovery, and futuristic immersion. It targets an audience that values analytical problem-solving, utilizing a "Light High-Tech" aesthetic that moves away from traditional dark sci-fi tropes in favor of a sterile, brightly lit laboratory environment.

The visual language balances **Minimalism** with **Technical Detail**. While the core layout remains clean and functional, the atmosphere is enriched through "blueprint" overlays and holographic corner brackets that suggest a heads-up display (HUD). The emotional response should be one of focused urgency—the user is not just a player, but a researcher operating a sophisticated laboratory OS.

## Colors

The palette of this design system is anchored in a sterile, clinical white and slate-gray foundation to ensure maximum legibility and a "clean room" feel. 

- **Primary Cyan (#06b6d4):** Used for interactive elements, data visualizations, and primary system states.
- **Primary Blue (#2563eb):** Reserved for high-priority data, links, and "Authorized Personnel" indicators.
- **Secondary Green (#22c55e):** Communicates system stability, successful scans, and unlocked states.
- **Accent Teal (#14b8a6):** Used for decorative HUD elements, holographic brackets, and secondary technical readouts.
- **Background (#f8fafc):** A cool-toned slate that prevents eye strain while maintaining the clinical aesthetic.

## Typography

This design system utilizes a dual-font approach to balance technical character with institutional clarity. 

**Space Grotesk** is used for headlines, labels, and numeric data. Its geometric quirks provide the necessary "scientific" edge and futuristic personality. **Inter** is employed for all body copy and instructional text, ensuring that complex escape room clues and narrative logs are highly readable under pressure. All labels should be set in uppercase with increased letter spacing to mimic laboratory equipment markings.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model to simulate a hardware-constrained terminal or control station. A 12-column grid is used for the main dashboard, with a 24px gutter to maintain a sense of structured airiness.

The background should feature a subtle 24px square grid pattern in `#e2e8f0` at 30% opacity. Components should align strictly to this grid. Use generous margins (`40px+`) to prevent the UI from feeling cluttered, reinforcing the "clinical" minimalism of the environment.

## Elevation & Depth

In this design system, depth is conveyed through **low-contrast outlines and tonal layering** rather than traditional drop shadows.

- **Surface Layering:** White panels sit atop the Slate background.
- **Outlines:** Use 1px solid borders in `#e2e8f0` for all panels.
- **Holographic Depth:** Corner brackets (`L` shapes) should be positioned at the vertices of primary panels in Cyan or Teal, slightly offset to create a "floating" HUD effect.
- **Blueprint Overlays:** Use semi-transparent technical drawings (0.05 opacity) as background elements within panels to suggest internal schematics or hardware specifications.

## Shapes

The shape language is primarily **Soft (0.25rem)**. This provides a modern, sophisticated feel while maintaining the structural integrity required for a scientific tool. 

While the containers themselves are slightly rounded, the decorative "corner brackets" should remain sharp 90-degree angles to contrast with the UI and emphasize the digital overlay nature of the system. Buttons and input fields should follow the standard `rounded-sm` (4px) or `rounded-md` (8px) convention.

## Components

### Terminal-Style Buttons
Buttons are rectangular with a 1px border. The "Active" state should feature a subtle glow (outer-glow) in the primary cyan color. Icons should be used sparingly and should look like technical schematics.

### Status Panels
Panels contain a header with a "system scan line"—a 1px horizontal line that slowly scrolls vertically across the panel background at low opacity. Headers must include a unique alphanumeric "ID code" in the top-right corner in `code-sm` typography.

### Biometric Scanner Graphics
A specialized component featuring a circular or hand-print outline. When "scanning," the Secondary Green color should fill the graphic using a radial or linear wipe animation.

### Input Fields
Fields should have a light slate background (`#f1f5f9`) with no top/left/right borders—only a 2px bottom border in Primary Cyan. This mimics high-tech laboratory input terminals.

### Chips & Tags
Used for "Hazard Levels" or "System Access." These should use the secondary and tertiary colors with a low-opacity background fill (10%) and a high-contrast text color for visibility.