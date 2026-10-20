---
name: SafeSign System
colors:
  surface: '#faf9fe'
  surface-dim: '#dad9df'
  surface-bright: '#faf9fe'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f8'
  surface-container: '#eeedf3'
  surface-container-high: '#e9e7ed'
  surface-container-highest: '#e3e2e7'
  on-surface: '#1a1b1f'
  on-surface-variant: '#414755'
  inverse-surface: '#2f3034'
  inverse-on-surface: '#f1f0f5'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc1'
  primary: '#0058bc'
  on-primary: '#ffffff'
  primary-container: '#0070eb'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc6ff'
  secondary: '#4c4aca'
  on-secondary: '#ffffff'
  secondary-container: '#6664e4'
  on-secondary-container: '#fffbff'
  tertiary: '#9e3d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c64f00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c2c1ff'
  on-secondary-fixed: '#0c006a'
  on-secondary-fixed-variant: '#3631b4'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb595'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7c2e00'
  background: '#faf9fe'
  on-background: '#1a1b1f'
  surface-variant: '#e3e2e7'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 40px
  margin-mobile: 16px
---

## Brand & Style
The design system is built upon the principles of **Precision Minimalism**. It is designed for high-stakes legal environments where clarity equals confidence. The aesthetic draws from the functional elegance of tool-based interfaces like Linear and the approachable document-centricity of Notion.

The target audience consists of legal professionals, founders, and procurement teams who require an "editor" experience that feels both powerful and invisible. The UI evokes a sense of **Calm Authority**—reducing cognitive load through vast whitespace, exceptional typographic hierarchy, and a restrained use of color. The style is **Corporate Modern**, utilizing light-weight borders and soft depth to create a structured, professional workspace.

## Colors
The palette is rooted in a "Paper & Ink" philosophy. The background remains a pristine `#FFFFFF` to mimic a digital canvas, while the primary Blue (`#007AFF`) is reserved strictly for primary actions and focused states, ensuring a high signal-to-noise ratio.

- **Neutral Tones**: Use a scale of cool greys for borders (`#F2F2F7`) and secondary text (`#636366`). 
- **Functional Colors**: Status colors (Red, Yellow, Green) are used with low-opacity backgrounds (10-15%) for highlighting contract risks or clauses, ensuring they stand out without overwhelming the text.
- **Contrast**: Maintain a minimum 7:1 contrast ratio for all body text to ensure maximum legibility during long reading sessions.

## Typography
This design system utilizes **Inter** for its neutral, systematic clarity. Its tall x-height makes it ideal for dense legal text and UI labels. For technical metadata and clause identifiers, **JetBrains Mono** is introduced to provide a distinct "data-driven" feel.

- **Scale**: Use tight tracking (-1% to -2%) for larger headlines to maintain a premium, "Linear-like" aesthetic.
- **Hierarchy**: Headlines should use `SemiBold` (600) weights to contrast against the `Regular` (400) body text.
- **Contract Text**: Specifically for document analysis, use `body-lg` with increased line-height (1.6) to prevent eye fatigue.

## Layout & Spacing
The layout follows a **Fluid Grid** model with a hard-cap on container width to ensure readability. We utilize an 8pt spatial system, with 4pt increments for micro-adjustments.

- **Sidebar Strategy**: Use a fixed-width left sidebar (240px) for navigation and a flexible right "Inspector" panel (320px) for AI analysis.
- **Margins**: Generous 40px external margins on desktop create a "breathing" layout that prevents the interface from feeling cluttered.
- **Stacking**: Vertical spacing between sections should favor `32px` or `48px` to clearly demarcate different analysis modules.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and extremely soft shadows. 

- **Level 0 (Background)**: `#FFFFFF` – The primary canvas.
- **Level 1 (Cards/Sidebar)**: `#FBFBFB` or white with a 1px border of `#F2F2F7`.
- **Level 2 (Modals/Popovers)**: White background with a "Large" soft shadow: `0 10px 40px rgba(0,0,0,0.04)`.
- **Interaction**: Elements do not lift on hover; instead, they use subtle background color shifts (e.g., White to `#F2F2F7`) to maintain a flat, professional profile.

## Shapes
The shape language is sophisticated and friendly. We avoid sharp corners to make the software feel more accessible, but avoid full pill-shapes to maintain a professional "SaaS" structure.

- **Standard Radius**: 8px (`rounded-md`) for buttons and small inputs.
- **Card Radius**: 20px (`rounded-xl`) for major content containers and contract previews.
- **Inner Elements**: When nesting elements within a 20px card, use a 12px radius to maintain visual harmony.

## Components
- **Buttons**: Primary buttons are solid Blue (`#007AFF`) with white text. Secondary buttons use a light grey ghost style with a 1px border. Always use 8px rounded corners.
- **Analysis Cards**: Large 20px rounded containers. Use a subtle `#F2F2F7` border instead of a shadow to delineate sections of a contract.
- **Status Chips**: Use "Soft" styling—a light background of the status color (e.g., 10% Red) with high-contrast text of the same hue.
- **Input Fields**: Minimalist design with a 1px light grey border that transitions to a 2px Blue border on focus. No shadows.
- **AI Highlight**: For AI-detected text, use a subtle `Yellow` or `Blue` background highlight with a 4px corner radius, appearing behind the text.
- **Data Lists**: Use "Invisible" lists with no borders between items; utilize 12px of vertical padding and a subtle hover state to indicate interactivity.