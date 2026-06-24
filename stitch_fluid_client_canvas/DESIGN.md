---
name: Obsidian Shield
colors:
  surface: '#141314'
  surface-dim: '#141314'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353435'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c6c6cb'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#909095'
  outline-variant: '#45474b'
  surface-tint: '#c6c6cc'
  primary: '#c6c6cc'
  on-primary: '#2f3035'
  primary-container: '#0f1115'
  on-primary-container: '#7b7c82'
  inverse-primary: '#5d5e63'
  secondary: '#bdf4ff'
  on-secondary: '#00363d'
  secondary-container: '#00e3fd'
  on-secondary-container: '#00616d'
  tertiary: '#d1bcff'
  on-tertiary: '#3c0090'
  tertiary-container: '#170041'
  on-tertiary-container: '#8e5aff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e8'
  primary-fixed-dim: '#c6c6cc'
  on-primary-fixed: '#1a1c20'
  on-primary-fixed-variant: '#45474b'
  secondary-fixed: '#9cf0ff'
  secondary-fixed-dim: '#00daf3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d1bcff'
  on-tertiary-fixed: '#23005b'
  on-tertiary-fixed-variant: '#5700c9'
  background: '#141314'
  on-background: '#e5e2e1'
  surface-variant: '#353435'
  slate-900: '#0F1115'
  charcoal-800: '#1A1D23'
  electric-blue: '#00E5FF'
  neon-teal: '#00FFA3'
  cyber-purple: '#7000FF'
  glass-stroke: rgba(255, 255, 255, 0.08)
  vault-green: '#22C55E'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  code-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-margin: 24px
  gutter: 16px
  card-padding: 20px
  stack-gap: 12px
---

## Brand & Style
The design system embodies the intersection of **Absolute Security** and **Fluid Productivity**. It is designed for high-stakes professionals who require the impenetrable safety of a Zero-Knowledge vault without the friction of legacy enterprise software.

The aesthetic follows a **Glassmorphic Bento** direction. It utilizes deep, architectural tones to establish a "digital fortress" feel, while employing translucent layers and vibrant customizable accents to maintain a sense of modern agility. Surfaces should feel like high-grade instrumentation—precise, reactive, and depth-aware. The user experience should evoke a sense of calm control, emphasizing that while the data is complex and heavily guarded, the interface remains effortless and "liquid."

## Colors
This design system defaults to a **Dark Mode** primary experience to emphasize the "Vault" nature of the product. 

- **Foundation:** The palette is anchored by `slate-900` (Background) and `charcoal-800` (Surface layers). 
- **Accents:** High-vibrancy "Electric" colors are used for interactive elements and state indicators. These are intended to be customizable by the user to denote different workspaces or security clearance levels.
- **Semantic Colors:** Green is reserved strictly for "Encrypted/Secure" status indicators. Red is utilized for destructive actions or "Unprotected" warnings.
- **Glassmorphism:** Use semi-transparent whites (`rgba(255, 255, 255, 0.03)`) for surface fills and high-contrast strokes for edges to simulate thin glass sheets.

## Typography
The typography system uses **Geist** for structural and data-heavy elements to lean into a technical, developer-centric aesthetic, while **Inter** provides maximum legibility for body text and long-form client notes.

- **Headlines:** Should be tight, bold, and authoritative.
- **Labels:** Use uppercase Geist for metadata (e.g., "LAST SYNCED," "AES-256") to reinforce the secure, industrial feel.
- **Numerical Data:** Use tabular figures where possible to ensure alignment in CRM tables and vault lists.

## Layout & Spacing
The layout employs a **Fluid Bento Grid** philosophy. Content is organized into modular cards that can expand or contract based on importance, mimicking a "mind map" logic where related entities (Client -> Project -> Vault Secret) are visually clustered.

- **Desktop:** A 12-column grid with high-density spacing. Margins are fixed at 24px, while gutters remain at 16px to maintain a compact, "cockpit" feel.
- **Mobile:** Reflows to a single-column stack. Bento cards become full-width with reduced internal padding.
- **Dynamic Padding:** Use an 8pt rhythmic scale. Components should feel breathable but efficient.

## Elevation & Depth
Depth is created through **Backdrop Blurs** and **Tonal Layering** rather than traditional drop shadows.

- **Level 0 (Background):** Solid `#0F1115`.
- **Level 1 (Bento Cards):** `charcoal-800` with 0.4 Alpha and a 20px backdrop blur. 1px solid border using `glass-stroke`.
- **Level 2 (Modals/Popovers):** Higher transparency with a more intense backdrop blur (40px) and a subtle outer glow using the `primary_accent` color at 10% opacity.
- **Interactions:** When a card is hovered, it should "lift" by increasing the border opacity and slightly scaling (1.02x), creating a tactile, responsive feel.

## Shapes
The shape language is "Squircle-adjacent." Using `rounded-lg` (16px) for main containers creates a sophisticated, modern silhouette that feels approachable yet professional.

- **Primary Containers:** 16px (rounded-lg).
- **Buttons & Inputs:** 8px (standard rounded).
- **Status Chips:** Full pill-shape for high-velocity recognition.
- **Interactive "Nodes":** In the mind-map view, use perfect circles for connection points to contrast against the rectangular bento grid.

## Components

### Buttons
- **Primary:** Solid `secondary_color` with black text. High contrast, no shadow.
- **Ghost/Secure:** Transparent background, `glass-stroke` border, monochromatic icon. Used for vault actions.
- **Haptic Feedback:** Buttons should have a subtle active state scale-down (0.98x).

### Vault Cards
Each card represents a bento-module. It features a "Security Header" with a small padlock icon. If the item is "Decrypted," the icon glows with `vault-green`.

### Input Fields
Inputs are "Underline" style or "Ghost" style. No heavy backgrounds. Focus states trigger a 1px neon border matching the user's chosen accent color.

### Mind-Map Connectors
Used in the overview layout to link Clients to Projects. These are 1px SVG paths with a "flowing" gradient animation to indicate active data streams.

### Chips & Tags
Small, Geist-font labels with low-opacity backgrounds (e.g., `primary_accent` at 15%). These categorize tasks (e.g., "URGENT," "ENCRYPTED," "STALE").