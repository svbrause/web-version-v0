/**
 * Demo preset: pre-selected concerns and areas for the /demo route so (almost)
 * all results stay within the selection, with enough non-surgical cases.
 *
 * Applied when the user visits the /demo path (or ?demo=1). We avoid Nose and
 * Full Face. Skin Laxity + Volume Loss with Cheeks, Eyes, Jawline has many
 * non-surgical cases.
 */

export const DEMO_PRESET = {
  concernIds: ['skin-laxity', 'volume-loss'] as const,
  areaIds: ['cheeks', 'eyes', 'jawline'] as const,
};

/** Alternate presets (no Full Face; avoid Nose for demos—mostly surgical). */
export const DEMO_PRESET_ALTERNATES = [
  {
    label: 'Skin Laxity + Volume Loss, Eyes + Jawline + Lips (~98 in CSV)',
    concernIds: ['skin-laxity', 'volume-loss'] as const,
    areaIds: ['eyes', 'jawline', 'mouth-lips'] as const,
  },
  {
    label: 'Skin Texture + Volume Loss, Jawline + Lips + Cheeks',
    concernIds: ['skin-texture', 'volume-loss'] as const,
    areaIds: ['jawline', 'mouth-lips', 'cheeks'] as const,
  },
  {
    label: 'Facial Structure + Skin Laxity, Eyes + Jawline only (Nose excluded—mostly rhinoplasty)',
    concernIds: ['facial-structure', 'skin-laxity'] as const,
    areaIds: ['eyes', 'jawline'] as const,
  },
];

/** Returns the demo preset when the user is on the demo route or has ?demo=1. Disabled for now—no pre-fill. */
export function getDemoPresetFromUrl(): typeof DEMO_PRESET | null {
  return null; // Preset disabled: use CONCERN_AND_AREA_REFERENCE.md to pick combinations manually
}
