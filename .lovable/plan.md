

# Techpack Gap Analysis: Reference vs Current Implementation

## Missing Elements Identified from Reference Tech Pack

### 1. Multi-Colorway Support (Major Gap)
The reference has **"FABRIC: COLOUR WAY 1"** and **"FABRIC: COLOUR WAY 2"** as parallel columns. Each colorway has its own fabric code, composition, colour, labels, and trims — all side by side. Our system currently supports only a single colorway per design.

### 2. Per-Component Fabric/Labels/Trims Matrix
The reference breaks down fabric info by garment piece — **SHIRT**, **LOWERS**, **DUPATTA**, **OTHER** — each showing CODE, COMPOSITION, COLOUR as rows. Our component system has this data but doesn't present it in this matrix format with labels and trims columns per colorway.

### 3. Techniques Row (Per Component)
A dedicated row showing decoration/technique assignments per component: e.g., "TECHNIQUES SHIRT | LOWERS | DUPATTA | BP/PUNCHING". We track decoration technique at the sample level but not broken down per component piece.

### 4. Granular Finish Details
The reference has **FINISH SHIRT HEM**, **NECKLINE**, **LOWERS**, **DUPATTA**, **SEAMS SHIRT**, **SEAMS LOWERS** — individual finish/seam specifications per component and per construction point. We only have a single `seamFinish` field for the whole design.

### 5. Silhouette Breakdown Row
**SILHOUETTE SHIRT | NECKLINE | SLEEVES | LOWERS | SEAMS LOWERS** — a quick-reference row mapping silhouette choices per component. We resolve neckline/sleeve but don't display them in this compact per-component format.

### 6. Missing Header Fields
- **Textile Designer** (separate from Designer)
- **Distribution** channel/info

### 7. Special Instructions Section
A dedicated **SPECIAL INSTRUCTIONS** text block at the bottom. We have `additionalNotes` but it's not labeled or positioned the same way.

### 8. Labels Column
Per-component **LABELS** column (e.g., brand labels, care labels, size labels per piece). We don't track label assignments at all.

---

## Proposed Improvements

### Changes to `src/data/designStore.ts`
- Add `textileDesigner: string` and `distribution: string` fields to `Design`
- Add `colorways: Colorway[]` array where each `Colorway` has `{ name, fabricCode, composition, colour, labelsPerComponent, trimsPerComponent }`
- Add `componentFinishes: Record<string, { hem, seams, necklineFinish }>` for per-component finish details
- Add `componentTechniques: Record<string, string>` for per-component technique assignments
- Add `componentLabels: Record<string, string[]>` for label assignments per piece
- Add `specialInstructions: string` field
- Seed mock data for `design-ws2046` with 2 colorways

### Changes to `src/pages/TechpackPreviewPage.tsx`
- Add new **Section: Colorway & Fabric Matrix** — a table with component rows (Shirt, Lowers, Dupatta, Other) and colorway columns, each cell showing Code/Composition/Colour/Labels/Trims
- Add editable fields for Textile Designer, Distribution, Special Instructions
- Add per-component Finish Details section (hem, seams per piece) — editable in edit mode
- Add Techniques per Component row in product detail
- Make colorway data editable (add/remove colorways, edit fabric info per colorway)

### Changes to `src/components/production/ProductionTechpack.tsx`
- Mirror the new colorway matrix section
- Display per-component finishes and techniques
- Show Labels assignments

### Changes to mock data in `src/data/designStore.ts`
- Seed `design-ws2046` with:
  - 2 colorways with distinct fabric codes/compositions/colours
  - Per-component finish details
  - Per-component technique assignments
  - Label assignments
  - Textile designer name and distribution info
  - Special instructions text

### File Summary

| File | Action |
|------|--------|
| `src/data/designStore.ts` | Edit — Add colorway, finish, technique, label types + seed data |
| `src/pages/TechpackPreviewPage.tsx` | Edit — Add colorway matrix, new editable fields, special instructions |
| `src/components/production/ProductionTechpack.tsx` | Edit — Mirror new sections in production view |

