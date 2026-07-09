---
name: Nurture & Logic
colors:
  surface: '#f3faff'
  surface-dim: '#c8dde8'
  surface-bright: '#f3faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e6f6ff'
  surface-container: '#dcf1fc'
  surface-container-high: '#d6ebf6'
  surface-container-highest: '#d1e6f1'
  on-surface: '#091e26'
  on-surface-variant: '#4f453d'
  inverse-surface: '#20333b'
  inverse-on-surface: '#dff4ff'
  outline: '#80756c'
  outline-variant: '#d2c4b9'
  surface-tint: '#74593f'
  primary: '#74593f'
  on-primary: '#ffffff'
  primary-container: '#ffdab9'
  on-primary-container: '#795e44'
  inverse-primary: '#e3c0a0'
  secondary: '#546348'
  on-secondary: '#ffffff'
  secondary-container: '#d5e5c3'
  on-secondary-container: '#59674c'
  tertiary: '#675d4e'
  on-tertiary: '#ffffff'
  tertiary-container: '#eedfcc'
  on-tertiary-container: '#6c6253'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcbe'
  primary-fixed-dim: '#e3c0a0'
  on-primary-fixed: '#2a1704'
  on-primary-fixed-variant: '#5a422a'
  secondary-fixed: '#d8e8c6'
  secondary-fixed-dim: '#bcccab'
  on-secondary-fixed: '#131f0a'
  on-secondary-fixed-variant: '#3d4b32'
  tertiary-fixed: '#efe0cd'
  tertiary-fixed-dim: '#d2c4b2'
  on-tertiary-fixed: '#221a0f'
  on-tertiary-fixed-variant: '#4f4538'
  background: '#f3faff'
  on-background: '#091e26'
  surface-variant: '#d1e6f1'
typography:
  headline-xl:
    fontFamily: Quicksand
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
  headline-lg:
    fontFamily: Quicksand
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  data-display:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-padding: 20px
  gutter: 16px
---

## Brand & Style

The brand personality is a harmonious blend of maternal warmth and clinical precision—the "Nurturing Scientist." It targets health-conscious individuals seeking a supportive companion that doesn't sacrifice data integrity. The UI must evoke a sense of calm safety (The Mother) while instilling absolute confidence in the metrics provided (The Lab).

The design style is a hybrid of **Soft Minimalism** and **Tactile Modernism**. It utilizes expansive whitespace and soft, pill-like shapes to reduce medical anxiety, while employing crisp, high-contrast data modules to anchor the user's health journey in reality. The aesthetic "Serious underneath, light on top" is achieved by layering friendly, approachable surfaces over a rigid, systematic structural grid.

## Colors

The palette is divided into two distinct functional zones: **Nurture** and **Rigorous**.

- **Nurture Zone (Warmth):** Uses "Kind Peach" (#FFDAB9) as the primary action color and "Soft Sage" (#B2C2A2) for success states and secondary organic elements. "Warm Sand" (#F5E6D3) serves as a subtle container color to separate content without the harshness of grey.
- **Rigorous Zone (Precision):** "Deep Midnight" (#12262E) is reserved for primary typography and heavy data-viz headers. "Scientific Teal" (#006D77) is used exclusively for data points, graphs, and technical callouts to signal authoritative information.

Backgrounds should remain off-white (#FDFBF9) to maintain the soft, non-clinical atmosphere.

## Typography

This design system uses a dual-font strategy to balance emotion and information.

- **Quicksand** is used for all headers and encouraging "voice" moments. Its rounded terminals provide a friendly, approachable tone that mimics a gentle conversation.
- **Inter** is used for all body text, data points, and technical labels. It provides the "rigorous brain" of the system, ensuring that health metrics are highly legible, professional, and unambiguous. 

For data-heavy screens, use `label-caps` in Deep Midnight to create clear, disciplined information hierarchies.

## Layout & Spacing

The layout follows a **Fluid Grid** model with generous margins to avoid a "cluttered" or "stressful" medical feel. 

- **Desktop:** 12-column grid with 24px gutters and 80px side margins.
- **Mobile:** 4-column grid with 16px gutters and 20px side margins.

Spacing should favor the `lg` and `xl` tokens for vertical rhythm between sections to maintain the "light on top" feel. Content should be grouped into cards with significant internal padding (minimum `md`) to allow the information to breathe.

## Elevation & Depth

Visual hierarchy is achieved through **Ambient Shadows** and **Tonal Layering**.

- **Surfaces:** Use "Warm Sand" for base cards to create a soft distinction from the background. 
- **Shadows:** Use extremely diffused, low-opacity shadows (Opacity: 4-8%) with a slight "Kind Peach" tint. This creates a "looming" softness rather than a "floating" hardness, making elements feel integrated and touchable.
- **Data Depth:** Scientific sections (charts/graphs) should be flat or slightly inset, suggesting they are "carved" into the supportive surface, reinforcing stability and permanence.

## Shapes

The shape language is dominated by high-radius curves. Buttons, input fields, and primary containers use `rounded-2xl` (1rem) as a minimum, with many secondary elements (chips, status pills) using a full pill-shape (`rounded-3xl`).

The only exception to this rule is within **Data Visualizations**. While the containers for charts remain rounded, the internal geometry (bars, line points, grid lines) should be crisp and sharp-edged to communicate mathematical accuracy and scientific rigor.

## Components

- **Buttons:** Primary buttons use a Kind Peach fill with Quicksand Semibold text. They should feel "squishy" and inviting. Secondary buttons use Soft Sage outlines.
- **Cards:** Use large corner radii (`rounded-2xl`). Header cards for health summaries use a Warm Sand background, while data-heavy "Scientific" cards use a white background with a thin Scientific Teal top-border.
- **Charts:** Line graphs use a thin, precise Scientific Teal stroke. Data points are small, sharp circles. Use Deep Midnight for axis labels to ensure maximum contrast.
- **Inputs:** Text fields should be pill-shaped with a Soft Sage 1px border. Focus states use a Kind Peach glow.
- **Icons:** Use two distinct styles. **Nurture Icons** (navigation, wellness tips) are soft-line, slightly hand-drawn. **Technical Icons** (vitals, heart rate, dosage) are precise, geometric, and use a consistent 2px stroke weight in Deep Midnight.
- **Progress Bars:** Use thick, rounded tracks in Warm Sand with a Soft Sage fill for the progress indicator, suggesting organic growth.