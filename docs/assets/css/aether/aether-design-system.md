# ÆTHER Design System
## A Museum-Grade Interface Style Sheet for Elegant, Minimalist & Futuristic Web Experiences

---

## 1. Design Philosophy: The Intent

> **"Every pixel is a curatorial decision."**

This system fuses the restraint of modern museum architecture with the precision of 2026 interface craft. It operates on three non-negotiable principles:

| Principle | Rule |
|-----------|------|
| **Subtraction** | If an element does not guide, inform, or delight, it is removed. |
| **Choreography** | Motion is not decoration; it is wayfinding. Every transition must answer *where did I come from?* and *where am I going?* |
| **Material Honesty** | Digital surfaces should feel tactile—light behaves as it does in physical space. No arbitrary shadows, no fake depth. |

**Constraint Framework** (for any project using this system):
- **Maximum 3 typefaces** per experience.
- **Maximum 1 accent color** in active use per view.
- **Minimum 40% negative space** above the fold.
- **Zero tolerance** for layout shift during load.

---

## 2. Design Tokens

### 2.1 Color Palette: *The Gallery Modes*

Two modes are mandatory: **Daylight** (the white cube gallery) and **Midnight** (the immersive exhibition). Both are fully WCAG 2.2 AA+ compliant.

#### Daylight Mode
| Token | Hex | Usage |
|-------|-----|-------|
| `canvas` | `#FAFAF8` | Primary background — warm, gallery-wall white |
| `ink` | `#0A0A0A` | Primary text — near-black with warmth removed |
| `stone` | `#E8E6E1` | Secondary surfaces, dividers, inactive states |
| `slate` | `#6B6B6B` | Captions, metadata, timestamps |
| `accent` | `#C41E3A` | Curatorial highlight — used sparingly for active wayfinding |
| `glass` | `rgba(250,250,248,0.72)` | Backdrop-filter surfaces |

#### Midnight Mode
| Token | Hex | Usage |
|-------|-----|-------|
| `canvas` | `#050505` | True dark — not pure black, to prevent OLED smearing |
| `ink` | `#F5F5F0` | Warm white text — reduced eye strain |
| `stone` | `#1A1A1A` | Elevated surfaces, card backgrounds |
| `slate` | `#888888` | Secondary text in low-light UX |
| `accent` | `#FF4D6D` | Luminescent accent — brighter than Daylight for perceptual balance |
| `glass` | `rgba(5,5,5,0.65)` | Dark mode frosted layers |

**Rule:** Accent color occupies **no more than 5%** of any viewport. It is reserved for: primary CTAs, active nav states, and live indicators.

---

### 2.2 Typography

A dual-type strategy: **Editorial Serif** for voice, **Geometric Sans** for function.

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| **Display** | *DM Serif Display* or *Newsreader* | 400 | H1, Hero statements, exhibition titles |
| **Headline** | *Soehne* or *Inter* | 500 | H2–H4, section headers |
| **Body** | *Inter* or *Suisse Int'l* | 400, 450 | Paragraphs, descriptions |
| **Mono** | *SF Mono* or *JetBrains Mono* | 400 | Metadata, coordinates, timestamps, captions |

#### Type Scale (Viewport-Fluid)
Uses `clamp()` for seamless responsiveness without breakpoints:

| Token | Size | Line Height | Letter Spacing |
|-------|------|-------------|----------------|
| `hero` | `clamp(3rem, 8vw, 7.5rem)` | 0.95 | -0.03em |
| `h1` | `clamp(2.5rem, 5vw, 4.5rem)` | 1.05 | -0.02em |
| `h2` | `clamp(1.75rem, 3vw, 2.75rem)` | 1.15 | -0.01em |
| `h3` | `clamp(1.25rem, 2vw, 1.75rem)` | 1.25 | 0 |
| `body` | `clamp(1rem, 1.1vw, 1.125rem)` | 1.6 | 0.01em |
| `caption` | `0.875rem` | 1.4 | 0.02em |
| `micro` | `0.75rem` | 1.3 | 0.04em (uppercase) |

**Rule:** Display type is always *left-aligned* or *centered*—never justified. Body text uses a **max-width of 65ch** for optimal reading rhythm.

---

### 2.3 Spacing System: *The Grid of Breath*

Based on a `4px` sub-unit. All spacing follows a modular scale to create the "generous whitespace" characteristic of museum layouts.

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | `4px` | Icon padding, hairline gaps |
| `space-2` | `8px` | Tight component internal padding |
| `space-3` | `16px` | Button padding, input internal spacing |
| `space-4` | `24px` | Card internal padding |
| `space-5` | `32px` | Section gutters |
| `space-6` | `48px` | Component separation |
| `space-7` | `64px` | Subsection margins |
| `space-8` | `96px` | Major section breaks |
| `space-9` | `128px` | Page-level vertical rhythm |
| `space-10` | `192px` | Hero breathing room |

**Layout Grid:** `12-column`, `24px` gutter, `max-width: 1440px`, centered with auto-margin. On ultrawide displays, content remains centered—never stretches beyond `1440px`.

---

### 2.4 Elevation & Surface

No arbitrary drop shadows. Elevation is communicated through **light, borders, and blur**.

| Token | Daylight | Midnight | Behavior |
|-------|----------|----------|----------|
| `surface-base` | `canvas` | `canvas` | Default layer |
| `surface-raised` | `#FFFFFF` | `#111111` | Cards, modals — 1px `stone` border |
| `surface-floating` | `glass` + `backdrop-filter: blur(24px)` | `glass` + `backdrop-filter: blur(24px)` | Navigation, toasts, dropdowns |

**Border Radius Philosophy:**
- **Sharp (`0px`)**: Editorial images, hero media, data tables.
- **Soft (`4px`)**: Buttons, inputs, small thumbnails.
- **Pill (`999px`)**: Tags, filters, status badges.

---

### 2.5 Motion Tokens

All animation follows a **physics-based easing** model. No linear transitions.

| Token | Duration | Easing | Usage |
|-------|----------|--------|-------|
| `instant` | `100ms` | `ease-out` | Micro-feedback (hover states, toggles) |
| `swift` | `200ms` | `cubic-bezier(0.25, 1, 0.5, 1)` | Button presses, color shifts |
| `smooth` | `400ms` | `cubic-bezier(0.65, 0, 0.35, 1)` | Page transitions, panel opens |
| `dramatic` | `800ms` | `cubic-bezier(0.76, 0, 0.24, 1)` | Hero reveals, scroll-triggered entrances |
| `ambient` | `12s–20s` | `linear` | Continuous loops (marquees, living textures) |

**Scroll Behavior:** Native `scroll-behavior: smooth` is enabled globally. Parallax is restricted to **0.85x speed differential** between layers—never disorienting.

---

## 3. Component Library

### 3.1 Navigation

**Primary Nav (Sticky/Fixed)**
- Height: `72px` (desktop) / `64px` (mobile)
- Background: `surface-floating` with `1px` bottom border in `stone`
- Backdrop blur: `24px`
- Logo: Left-aligned, `24px` height, monochrome `ink`
- Links: `body` size, `slate` default → `ink` on hover → `accent` when active
- Hover transition: `swift` — underline grows from center via `scaleX(0→1)`

**Off-Canvas / Sidebar Menu** (for immersive experiences)
- Trigger: Hamburger morphs to close `X` with `swift` duration
- Panel: Slides from right, `480px` max-width, `surface-raised` background
- Overlay: `canvas` at `40%` opacity, fades in `smooth`
- Content: Large `h2` links with `space-6` between items

---

### 3.2 Buttons

| Variant | Background | Text | Border | Radius | Padding | Hover Behavior |
|---------|------------|------|--------|--------|---------|----------------|
| **Primary** | `accent` | `canvas` | none | `soft` | `space-3 space-5` | Background darkens 12%; `translateY(-1px)` |
| **Secondary** | transparent | `ink` | `1px solid stone` | `soft` | `space-3 space-5` | Border transitions to `ink`; background fills `stone` |
| **Tertiary** | transparent | `slate` | none | `0px` | `space-2 0` | Text shifts to `ink`; underline draws left-to-right |
| **Ghost** | `glass` | `ink` | `1px solid rgba(0,0,0,0.08)` | `soft` | `space-3 space-4` | Backdrop blur intensifies; subtle shadow appears |

**Micro-interaction:** On click, a `ripple` effect expands from cursor position at `swift` duration, then fades. Buttons must have a **minimum 44×44px** tap target.

---

### 3.3 Cards

**Exhibition Card** (the canonical content unit)
- Aspect ratio: `4:5` (portrait) or `16:10` (landscape)
- Image: Covers full card, `sharp` radius
- Overlay: Gradient from transparent to `canvas` at `80%` opacity (bottom 40%)
- Content: Positioned absolute, bottom-left, padding `space-5`
- Title: `h3` in `ink` (Daylight) or `canvas` (Midnight)
- Meta: `caption` in `slate`, separated by `·` interpunct
- Hover: Image scales `1.04` over `smooth`; overlay lightens; title `translateY(-4px)`

**Bento Card** (for dashboards/feature grids)
- Background: `surface-raised`
- Border: `1px solid stone`
- Radius: `soft`
- Padding: `space-5`
- Hover: Border transitions to `slate`; subtle `box-shadow: 0 4px 24px rgba(0,0,0,0.04)`

---

### 3.4 Forms & Inputs

**Text Field**
- Height: `56px` (touch-friendly)
- Background: `surface-base`
- Border: `1px solid stone`, bottom only OR full container
- Radius: `soft`
- Padding: `space-3 space-4`
- Label: Floats above on focus (Material-style) OR static `caption` above
- Focus state: Border transitions to `ink` over `swift`; no glow, no ring
- Error state: Border becomes `accent`; `caption` error text appears below with `swift` fade-in
- Placeholder: `slate` at `70%` opacity

**Selection Controls**
- Checkbox: `20px` square, `2px` border in `stone` → `accent` fill on check with `swift`
- Radio: Same sizing, circular
- Toggle: `48px` wide, `28px` tall, pill shape. Thumb moves with `spring` physics.

---

### 3.5 Modals & Overlays

**Dialog / Modal**
- Overlay: `canvas` at `60%` opacity, `smooth` fade
- Container: `surface-raised`, max-width `640px`, centered
- Radius: `soft` on mobile; `sharp` on desktop (>768px)
- Entrance: Scales from `0.96` to `1.0` and fades in, `smooth` duration
- Exit: Reverse animation
- Close: Top-right `X`, `tertiary` button style

**Toast / Notification**
- Position: Bottom-right (desktop), top (mobile)
- Background: `surface-floating` with strong blur
- Border-left: `3px solid accent` for alerts, `ink` for info
- Auto-dismiss: `4000ms` delay, exits with `swift` slide-down

---

### 3.6 Data & Editorial Components

**Table**
- Header: `micro` uppercase, `slate`, bottom border `stone`
- Row: `body` size, `ink`. Hover: `surface-raised` background
- Divider: `1px solid stone` — no vertical borders
- Pagination: `secondary` buttons with `mono` numerals

**Blockquote / Pull Quote**
- Left border: `3px solid accent`
- Padding-left: `space-5`
- Font: `Display`, `h2` size, `ink`
- Attribution: `caption`, `slate`, preceded by em-dash

**Accordion**
- Header: `h3` size, `ink`, full-width row
- Icon: `+` rotates 45° to `×` on open, `swift`
- Panel: Height animates from `0` to auto using grid-template-rows trick, `smooth`
- Border-bottom: `1px solid stone` per item

---

## 4. Imagery & Media Rules

- **Treatment:** Full-bleed photography is king. No rounded corners on hero imagery—`sharp` only.
- **Color Grading:** Prefer desaturated, warm tones. If the image is the content (art), it remains untouched. If it's decorative, a `5%` warm overlay unifies it with `canvas`.
- **Loading:** Images load with a `blur-up` technique: a `20px` blurred placeholder transitions to sharp over `smooth`. No empty gray boxes.
- **Aspect Ratios:** Maintain strict ratios. Never stretch. Common ratios: `16:9`, `4:5`, `1:1`, `21:9` (cinematic).
- **Video:** Autoplay only when muted and below the fold. Include user toggle for sound. Background videos must be `≤ 2MB` and gracefully degrade to static on reduced-motion preference.

---

## 5. Interaction Patterns

### 5.1 Scroll Behaviors

| Pattern | Implementation | When to Use |
|---------|----------------|-------------|
| **Sticky Wayfinding** | Section titles pin while content scrolls | Long editorial reads |
| **Reveal** | Elements `translateY(24px)→0` + `opacity 0→1` triggered at `20%` viewport intersection | All content sections |
| **Parallax** | Background moves at `0.85x`, foreground at `1.0x` | Hero sections only |
| **Horizontal Drift** | Horizontal scroll container within vertical page | Gallery carousels, timelines |
| **Progressive Disclosure** | "Read more" expands inline; no page jump | Dense content blocks |

**Rule:** Respect `prefers-reduced-motion`. All animations become instant or opacity-only fades.

---

### 5.2 Cursor & Hover Language

- **Default → Pointer:** Immediate state change.
- **Magnetic Buttons:** On desktop, primary buttons subtly pull toward cursor within `40px` radius using `transform` (not `top/left`—no layout thrashing).
- **Image Hover:** Cursor becomes a `View` or `Explore` circular badge, `64px`, `surface-floating`, `ink` text.
- **Link Underlines:** Draw from center-out or left-to-right. Never use default browser underline.

---

### 5.3 Page Transitions

**The Curatorial Fade** (recommended default)
- Outgoing page: `opacity 1→0`, `swift`
- Incoming page: `opacity 0→1` + `translateY(12px)→0`, `smooth`
- Overlay: A `canvas` full-screen layer briefly covers to prevent flash

**The Gallery Slide** (for portfolio/exhibition contexts)
- Incoming content slides from right, outgoing to left
- Duration: `dramatic`
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`

---

## 6. Accessibility & Sustainability

This system is built **accessibility-first**, not as an afterthought.

- **Contrast:** All text meets WCAG 2.2 AA (4.5:1 for body, 3:1 for large text). The `accent` on `canvas` exceeds 7:1.
- **Focus Rings:** All interactive elements have a `2px` outline offset `2px` from the element, using `accent` at full opacity. Visible only during keyboard navigation (`:focus-visible`).
- **Screen Readers:** All icon-only buttons have `aria-label`. Decorative images have `alt=""`. Complex images have detailed `aria-describedby`.
- **Touch Targets:** Minimum `44×44px` for all interactive elements.
- **Sustainable Design:**
  - System fonts used where possible (Inter, SF Mono) to avoid font payload.
  - Images served as AVIF/WebP with fallback.
  - Animations use `transform` and `opacity` only—GPU-composited, no `layout` or `paint` triggers.
  - Dark mode is default on OLED devices to reduce energy consumption.

---

## 7. Responsive Philosophy

Breakpoints are **content-defined**, not device-defined:

| Name | Width | Behavior |
|------|-------|----------|
| `compact` | `< 640px` | Single column, full-bleed images, hamburger nav, increased touch targets |
| `medium` | `640–1024px` | 2-column grids, sidebar nav possible, reduced whitespace (`space-8` → `space-6`) |
| `expanded` | `1024–1440px` | Full grid, sticky sidebars, maximum whitespace |
| `wide` | `> 1440px` | Content stays centered at `1440px`; margins breathe with `space-10` |

**Typography scales fluidly** via `clamp()`—no breakpoint jumps for type.

---

## 8. The Synchronicity Checklist

Before any page ships, verify:

- [ ] **40% Rule:** At least 40% of the initial viewport is negative space.
- [ ] **3-Font Rule:** No more than 3 typefaces loaded.
- [ ] **5% Accent Rule:** Accent color does not dominate; it punctuates.
- [ ] **Motion Audit:** Every animation can be disabled via `prefers-reduced-motion`.
- [ ] **Tap Test:** All CTAs are reachable by thumb on a 6.1" device without hand strain.
- [ ] **Load Ritual:** Hero content loads within `1.2s` on 4G; placeholders prevent layout shift.
- [ ] **Dark Mode Parity:** Midnight mode is not an inversion—it is a fully considered palette.
- [ ] **Focus Flow:** Keyboard navigation follows a logical Z-pattern with visible focus states.

---

## 9. Quick-Start CSS Variables

```css
:root {
  /* Canvas */
  --canvas: #FAFAF8;
  --ink: #0A0A0A;
  --stone: #E8E6E1;
  --slate: #6B6B6B;
  --accent: #C41E3A;

  /* Typography */
  --font-display: "DM Serif Display", Georgia, serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "SF Mono", "JetBrains Mono", monospace;

  /* Spacing */
  --space-1: 4px;
  --space-3: 16px;
  --space-5: 32px;
  --space-8: 96px;

  /* Motion */
  --ease-swift: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-smooth: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-swift: 200ms;
  --dur-smooth: 400ms;
}

@media (prefers-color-scheme: dark) {
  :root {
    --canvas: #050505;
    --ink: #F5F5F0;
    --stone: #1A1A1A;
    --slate: #888888;
    --accent: #FF4D6D;
  }
}
```

---

*This system is designed to be constraint-rich but component-complete. It gives you the vocabulary to build anything—from a quiet editorial page to an immersive exhibition—while maintaining the restraint, elegance, and futuristic clarity that define the best museum experiences online.*
