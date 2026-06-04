---
name: NeutronTech
colors:
  surface: '#fbf8ff'
  surface-dim: '#dad8e8'
  surface-bright: '#fbf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f2ff'
  surface-container: '#eeecfc'
  surface-container-high: '#e8e6f6'
  surface-container-highest: '#e3e1f0'
  on-surface: '#1a1b25'
  on-surface-variant: '#444557'
  inverse-surface: '#2f2f3b'
  inverse-on-surface: '#f1efff'
  outline: '#757589'
  outline-variant: '#c5c5da'
  surface-tint: '#2f3eff'
  primary: '#0010cc'
  on-primary: '#ffffff'
  primary-container: '#1929fe'
  on-primary-container: '#c1c5ff'
  inverse-primary: '#bec2ff'
  secondary: '#545f72'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f7'
  on-secondary-container: '#586377'
  tertiary: '#7e0b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#a91300'
  on-tertiary-container: '#ffb8aa'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e0e0ff'
  primary-fixed-dim: '#bec2ff'
  on-primary-fixed: '#00046a'
  on-primary-fixed-variant: '#0013e7'
  secondary-fixed: '#d8e3fa'
  secondary-fixed-dim: '#bcc7dd'
  on-secondary-fixed: '#111c2c'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#ffdad4'
  tertiary-fixed-dim: '#ffb4a6'
  on-tertiary-fixed: '#3f0300'
  on-tertiary-fixed-variant: '#900e00'
  background: '#fbf8ff'
  on-background: '#1a1b25'
  surface-variant: '#e3e1f0'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist
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
    lineHeight: '1.6'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 4rem
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The brand identity for this design system is built on the intersection of high-energy innovation and professional stability. It targets a tech-savvy demographic that values efficiency, clarity, and a futuristic aesthetic that remains grounded in utility. 

The visual style is **Modern Corporate with a Tech-Startup edge**. It utilizes a "Hyper-Clean" approach: expansive white space, precision-engineered typography, and a "Electric Blue" focal point that draws the eye to primary actions. The aesthetic feels breathable yet structured, prioritizing high legibility and a sense of "technological calm."

## Colors

The color palette is dominated by a high-contrast relationship between pure white surfaces and a vibrant, digitally-native primary blue. 

- **Primary Blue (#1929FE):** Used for critical actions, active states, and brand-defining moments. It should be used sparingly to maintain its impact.
- **Neutrals:** The background logic uses a layered approach. Primary surfaces are white, while structural containers (like sidebars or background sections) use a cool-toned light blue-gray to provide soft depth without introducing heavy shadows.
- **Typography:** Headlines utilize a deep navy to provide better readability and a more premium feel than pure black. Body text uses a functional gray to reduce eye strain in long-form content.

## Typography

This design system employs a dual-font strategy to balance technical precision with extreme legibility.

- **Geist** is used for headlines and UI labels. Its geometric, monolinear construction evokes a "developer-friendly" and futuristic feel.
- **Inter** is used for all body and long-form text. Its high x-height and neutral tone ensure maximum readability across all device types.

**Usage Rules:**
- Large display headings should use tighter letter spacing and heavy weights.
- All uppercase styling should be reserved exclusively for `label-sm` to denote categories or overlines.
- Line heights are intentionally generous for body text (1.6) to support the "breathable" brand personality.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** model with strict vertical rhythm based on a 4px baseline.

- **Desktop:** 12-column grid, max-width 1280px. Gutters are fixed at 24px to maintain structured whitespace.
- **Tablet:** 8-column grid with 24px margins.
- **Mobile:** 4-column grid with 16px margins. 

Spacing between components should be aggressive; when in doubt, increase padding. Horizontal sections should be separated by `xl` (64px) spacing to prevent visual clutter and maintain the professional, startup-like clarity.

## Elevation & Depth

To maintain a "Modern Professional" look, the design system avoids heavy shadows and traditional skeuomorphism. Instead, it uses **Tonal Layering** and **Soft Ambient Shadows**.

- **Level 0 (Floor):** Pure White (#FFFFFF) or Sub-Background (#F0F4F8).
- **Level 1 (Cards/Cards):** White background with a subtle 1px border (#E2E8F0).
- **Level 2 (Interactive/Hover):** A soft, highly-diffused shadow (0px 4px 20px rgba(10, 17, 40, 0.05)).
- **Level 3 (Modals/Popovers):** A more defined shadow with a slight blue tint (0px 12px 32px rgba(25, 41, 254, 0.08)) to create a sense of floating above the interface.

Depth is communicated primarily through the change in border color and extremely subtle shifts in elevation shadows.

## Shapes

The shape language is defined by "Medium Roundedness." This provides a approachable, modern feel that avoids the childishness of full pill-shapes while moving away from the harshness of sharp corners.

- **Standard Elements (Buttons, Inputs):** 0.5rem (8px).
- **Large Containers (Cards, Modals):** 1rem (16px).
- **Small Elements (Chips, Tags):** 0.25rem (4px) or fully rounded depending on context.

Icons should follow a 2px stroke weight with slightly rounded terminals to match the component radius.

## Components

### Buttons
- **Primary:** Solid #1929FE with white text. Hover state: #1929FE with a subtle 10% black overlay.
- **Secondary:** Transparent with 1px border #E2E8F0 and #0A1128 text.
- **Tertiary:** Ghost style, using #1929FE for text only.

### Input Fields
- White background with 1px border #E2E8F0.
- Focus state: Border changes to #1929FE with a 2px outer glow (rgba(25, 41, 254, 0.15)).
- Labels use `label-md` in `text_secondary`.

### Cards
- White background, 16px corner radius, and 1px subtle border.
- Padding should be generous (min 24px).

### Chips & Tags
- Used for metadata and status. Small text (`label-sm`), light blue-gray background, and 4px radius. Active chips use the primary blue with 10% opacity and primary blue text.

### Navigation
- Top navigation should be sticky with a backdrop-blur (10px) and 80% opacity white background to maintain context while scrolling.