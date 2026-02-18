
# Production Hub + Scan Sample — Updated Plan (With Spec Sheet & GGT Files)

## What's Being Added to the Previous Plan

The full Production Hub + Scan Sample plan remains exactly as previously agreed. Two new sections are added **inside the Production Techpack** (Level 3), which is the shared document used by both the Production tab drill-down and the Scan Sample tab:

1. **Graded Garment Template (GGT) File Links** — a panel listing uploaded GGT/pattern files for the sample, each as a clickable download link
2. **Specification Sheet** — a structured, print-ready summary table of all critical production measurements, grading, and construction specs

Both are rendered inside `ProductionTechpack.tsx` as dedicated sections below the Fabric Specifications block.

---

## What GGT Files Are

GGT (Graded Garment Template) files are the pattern files used by the pattern room and cutting department. They contain the final graded pattern for every size. The techpack needs to link to these so any department picking up the sample can immediately access the correct cut files.

Since the app has no file server, GGT files are stored as **URL strings** (can be a shared drive path, Google Drive link, or any URL) attached to the `Design` record. The field is added to `designStore.ts`.

---

## Updated Techpack Section Order (Level 3)

```text
ProductionTechpack.tsx
├── 1. Identity Block
├── 2. Design Sketch & Technical Drawing
├── 3. Specification Sheet          ← NEW
├── 4. GGT File Links               ← NEW
├── 5. Fabric Specifications (per component)
├── 6. Trims & Closures
├── 7. Embroidery / Artwork
├── 8. Lining & Slip Config
├── 9. Stage Approval Gate Tracker
└── 10. Production Change Notes
```

---

## Section 3 — Specification Sheet

A structured table (or grid of labelled fields) presenting all construction and sizing specs in a single glanceable block — the kind a cutter or QC officer would refer to on the floor.

### What it shows

| Field | Source |
|---|---|
| Silhouette Code | `sample.silhouetteCode` |
| Silhouette Name | `sample.silhouetteName` |
| Combination | `sample.combination` (1pc / 2pc / 3pc / 4pc) |
| Sizes | `sample.sizes` (e.g. S, M, L, XL) |
| Total Quantity (Sample) | `sample.totalQty` |
| Colour | `sample.colour` |
| Further Colourways | `sample.furtherColourways` (listed as badges) |
| Seam Finish | `design.seamFinish` or per-component from `design.components[x].customModifications.seamFinish` |
| Recommended SPI | From matched `FabricEntry.technicalSpecs.recommendedSPI` |
| Fabric Width | `FabricEntry.technicalSpecs.fabricWidth` |
| GSM | `FabricEntry.technicalSpecs.gsm` |
| Shrinkage Margin | `FabricEntry.technicalSpecs.shrinkageMargin` |
| Construction Notes | `FabricEntry.technicalSpecs.construction` |
| Stitching Specs | `FabricEntry.technicalSpecs.stitchingSpecs` |
| Care Instructions | `FabricEntry.technicalSpecs.careInstructions` or `sample.careInstructions` |
| Decoration Technique | `sample.decorationTechnique` (displayed as a badge if present) |
| Fast Track | Badge shown if `design.fastTrack === true` |
| Sample Type | `design.sampleType` |
| Season | `sample.season` |
| Target Date | `sample.targetDate` |

This is rendered as a clean two-column grid with a light background, using the same card style already in use across the app.

---

## Section 4 — GGT File Links

A panel listing the GGT/pattern files associated with this design. Each file entry shows:
- File name (editable label)
- A clickable link (opens in a new tab — works for Google Drive, Dropbox, shared drive URLs, etc.)
- An "Upload / Add Link" form at the bottom of the section to paste a new URL and give it a label

### Data storage

GGT file links are stored directly on the `Design` record. Two additions are made to `designStore.ts`:

```ts
// New interface
export interface GGTFile {
  id: string;
  label: string;       // e.g. "Pattern v2 - All Sizes" or "WS2046-graded.ggt"
  url: string;         // any URL: Google Drive link, file server path, etc.
  addedBy: string;
  addedAt: string;     // ISO date string
}

// Added to Design interface
ggtFiles?: GGTFile[];
```

New store action:
```ts
addGGTFile: (designId: string, file: Omit<GGTFile, 'id' | 'addedAt'>) => void;
```

This parallels the existing `addProductionNote` action being added in the same file — consistent pattern.

---

## Files That Change (Additions to the Previously Agreed List)

### `src/data/designStore.ts`
Previously planned changes (adding `ProductionNote`, `productionNotes`, `addProductionNote`) remain. Now also add:
- `GGTFile` interface (exported)
- `ggtFiles?: GGTFile[]` on the `Design` interface
- `addGGTFile(designId, file)` action on `useDesignStore`

### `src/components/production/ProductionTechpack.tsx`
This is a new file being created anyway. The two new sections (Spec Sheet and GGT Files) are added as additional section blocks within the same component — no architectural change, just two more sections in the document.

---

## Everything Else Remains Identical

All five files to create and three files to modify from the previous plan are unchanged:

Files to create:
- `src/components/production/ProductionTab.tsx`
- `src/components/production/ProductionCollectionView.tsx`
- `src/components/production/ProductionTechpack.tsx` (with Spec Sheet + GGT sections added)
- `src/components/scan/ScanSampleTab.tsx`

Files to modify:
- `src/data/designStore.ts` (ProductionNote + GGTFile additions)
- `src/data/sampleStore.ts` (approval gate guard in `advanceStage`)
- `src/pages/Index.tsx` (new view states + nav buttons)

Implementation order is also unchanged — the only difference is that `ProductionTechpack.tsx` now renders two additional sections.
