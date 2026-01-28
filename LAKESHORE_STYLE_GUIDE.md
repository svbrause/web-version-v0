# Lakeshore Skin + Body — Brand Style Guide

_For use in product UI, web apps, and internal tools_

---

## 1. Brand Personality & Design Intent

**Lakeshore Skin + Body** presents as:

- Calm, refined, and professional
- Medical-grade credibility without feeling clinical
- Warm, welcoming, and lifestyle-oriented
- Minimal, modern, and image-forward

Design should feel:

- **Clean but not stark**
- **Luxurious but not flashy**
- **Trustworthy, soft, and human**

Avoid anything overly bold, playful, or tech-heavy.

---

## 2. Color Palette

### Core Neutrals (UI Foundation)

| Name       | Hex       | Usage                       |
| ---------- | --------- | --------------------------- |
| Pure White | `#FFFFFF` | Primary backgrounds, cards  |
| Soft Cream | `#F7F4F1` | Section backgrounds, panels |
| Charcoal   | `#222222` | Body text                   |
| Soft Black | `#000000` | Headings, primary buttons   |

---

### Warm Brand Accents

| Name        | Hex       | Usage                            |
| ----------- | --------- | -------------------------------- |
| Warm Beige  | `#D9C8BD` | Secondary buttons, highlights    |
| Blush Taupe | `#E9D7D0` | UI accents, badges, subtle fills |

These should be used **sparingly** and never overpower white space.

---

### Image-Driven Supporting Tones

(Used subtly in gradients, hero overlays, or illustration accents)

| Name       | Hex       |
| ---------- | --------- |
| Deep Teal  | `#4A6474` |
| Dusty Teal | `#5A7D83` |
| Muted Tan  | `#B89C85` |

---

### Suggested CSS Variables

```css
:root {
  --color-white: #ffffff;
  --color-cream: #f7f4f1;
  --color-charcoal: #222222;
  --color-black: #000000;

  --color-beige: #d9c8bd;
  --color-blush: #e9d7d0;

  --color-teal-deep: #4a6474;
  --color-teal-soft: #5a7d83;
  --color-tan: #b89c85;
}
```
