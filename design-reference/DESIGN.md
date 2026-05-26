---
name: Cinematic Documentary Interface
colors:
  surface: '#0a0e17'
  surface-dim: '#151e2e'
  surface-bright: '#1d283a'
  surface-container-lowest: '#05070a'
  surface-container-low: '#0a0e17'
  surface-container: '#0f141f'
  surface-container-high: '#151e2e'
  surface-container-highest: '#1d283a'
  on-surface: '#f8fafc'
  on-surface-variant: '#94a3b8'
  inverse-surface: '#f1f5f9'
  inverse-on-surface: '#020617'
  outline: '#334155'
  outline-variant: '#475569'
  surface-tint: '#14b8a6'
  primary: '#14b8a6'
  on-primary: '#ffffff'
  primary-container: '#0f766e'
  on-primary-container: '#ccfbf1'
  inverse-primary: '#5eead4'
  secondary: '#f59e0b'
  on-secondary: '#ffffff'
  secondary-container: '#b45309'
  on-secondary-container: '#fef3c7'
  tertiary: '#10b981'
  on-tertiary: '#ffffff'
  tertiary-container: '#047857'
  on-tertiary-container: '#d1fae5'
  error: '#ef4444'
  on-error: '#ffffff'
  error-container: '#991b1b'
  on-error-container: '#fee2e2'
  background: '#0a0e17'
  on-background: '#f8fafc'
  surface-variant: '#1e293b'
typography:
  headline-xl:
    fontFamily: Inter, Noto Kufi Arabic, sans-serif
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter, Noto Kufi Arabic, sans-serif
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter, Noto Kufi Arabic, sans-serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter, Noto Kufi Arabic, sans-serif
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter, Noto Kufi Arabic, sans-serif
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter, Noto Kufi Arabic, sans-serif
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  code-sm:
    fontFamily: Inter, Noto Kufi Arabic, sans-serif
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
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

The design system is engineered to evoke a sense of professional, immersive storytelling, akin to a high-quality educational documentary. It replaces the old "escape room" aesthetic with a **Cinematic Documentary** feel that places learners in authentic, real-world UAE settings.

The visual language balances **Clarity** with **Narrative Depth**. The environment is no longer a sterile lab, but a vibrant, culturally resonant interface featuring cinematic visuals, deep blues, dark neutrals, and vibrant accents (turquoise, amber, green) based on UAE flag colors.

## Colors

The palette is anchored in deep dark neutrals and blues to create a cinematic backdrop, allowing vibrant data and interactive elements to stand out.

- **Backgrounds (#0a0e17):** Deep dark neutral for a cinematic theater-like experience.
- **Primary Turquoise (#14b8a6):** Used for interactive elements, highlights, and primary data visualizations.
- **Secondary Amber (#f59e0b):** Draws attention to choices, warnings, and interactive elements.
- **Accent Green (#10b981):** Communicates successful states, growth, and positive outcomes, subtly reflecting the UAE flag green.
- **Accent Red (#ef4444):** Used for errors or critical alerts, reflecting the UAE flag red.
- **Text & Panels (#f8fafc / #1e293b):** Crisp whites for text on deep slate panels for maximum readability.

## Typography

This design system utilizes a modern, approachable typographic hierarchy to support bilingual content.

**Inter** is used for English text, providing a highly readable, clean, and professional appearance. **Noto Kufi Arabic** is employed for Arabic text, ensuring cultural authenticity and excellent legibility. We avoid all-caps for large bodies of text to ensure a friendly, accessible learning environment.

## Layout & Spacing

The layout philosophy follows a **Cinematic Grid** model. Generous margins (40px+) and wide gutters ensure the UI feels expansive and immersive, not cramped or tense like an escape room. Large imagery and full-bleed backgrounds are encouraged.

## Components

### Narrative Panels
Instead of sterile status panels, use semi-transparent dark slate backgrounds with soft blurs (glassmorphism) over cinematic background images.

### Decision Interactions
Choices should look like professional dashboard prompts rather than locked keypads. They should not highlight red/green immediately upon clicking, but instead transition smoothly into the consequence scene.

### Data Dashboards
Charts and data visualizations should use the vibrant accent colors (Turquoise, Amber, Green) against dark backgrounds to look like high-end professional tools used by engineers or scientists.