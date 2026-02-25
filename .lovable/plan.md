

# Upgrade Production Techpack to Match Reference Format

## Analysis — What the Reference Techpack Has That Ours Lacks

The uploaded Excel techpack is a 6-page professional spec document. Here is what it contains versus our current `ProductionTechpack.tsx`:

```text
REFERENCE TECHPACK (6 pages)              OUR CURRENT TECHPACK (10 sections)
─────────────────────────────             ──────────────────────────────────
1. Product Detail Header                  1. Identity Block ✓ (similar)
   + 4-View Sketch (Front/Back/           2. Design Sketch ✗ (only annotated canvas,
     Left/Right)                              no structured 4-view grid)

2. Graded Spec Sheet                      3. Specification Sheet ✗ (flat key-value,
   - Label (A-X)                              no graded table, no tolerances,
   - Point of Measurement                     no grade increments)
   - Grade increment
   - Tolerance -/+
   - All sizes (0-14) in columns
   + Pattern UV Layouts                   — MISSING entirely

3. Body Size Charts                       — MISSING (body measurements for
   (body reference measurements)             grading reference)

4. Construction Callouts                  — MISSING (labeled A-G annotations
   (labeled construction details             describing closures, yokes, hems,
    on 4-view drawings)                      pleats, cuffs, collars)

5. Artworks Page                          7. Embroidery/Artwork ✗ (just a badge,
   - Type, Width, Height, Angle              no dimensions, no placement views)
   - 4-view placement diagrams

6. Bill of Materials (BOM)                — MISSING entirely

—                                         4. GGT Pattern Files ✓ (KEEP - ref doesn't have)
—                                         5. Fabric Specifications ✓ (KEEP)
—                                         6. Trims & Closures ✓ (KEEP)
—                                         8. Lining & Slip ✓ (KEEP)
—                                         9. Stage Gate Tracker ✓ (KEEP)
—                                         10. Production Notes ✓ (KEEP)
```

## Plan — Merge Both Into a Comprehensive Techpack

We keep all 10 existing sections and add the 5 missing sections from the reference. The final techpack will have **15 sections**, reorganised in a logical production-document order.

### New Section Order

| # | Section | Source | Status |
|---|---------|--------|--------|
| 1 | Product Detail Header (Brand, Style, Season, Sample Size, Size Range, Date) | Reference Page 1 | **NEW** — restructure Identity block |
| 2 | 4-View Technical Sketch (Front, Back, Left, Right grid) | Reference Pages 1 & 4 | **UPGRADE** existing section 2 |
| 3 | Construction Callouts (labeled A-G with descriptions) | Reference Page 4 | **NEW** |
| 4 | Graded Spec Sheet (table: Label, Measurement, Grade, Tol±, sizes 0-14) | Reference Page 2 | **NEW** — replace flat spec sheet |
| 5 | Body Size Charts (reference body measurements per size) | Reference Page 3 | **NEW** |
| 6 | Pattern UV Layouts (pattern piece thumbnails with labels) | Reference Page 2 | **NEW** |
| 7 | Fabric Specifications | Existing section 5 | KEEP |
| 8 | Trims & Closures | Existing section 6 | KEEP |
| 9 | Artwork Placement (type, dimensions, angle, 4-view placement) | Reference Page 5 | **UPGRADE** existing section 7 |
| 10 | Bill of Materials (BOM) | Reference Page 6 | **NEW** |
| 11 | Lining & Slip Configuration | Existing section 8 | KEEP |
| 12 | GGT / Pattern Files | Existing section 4 | KEEP |
| 13 | Care & Handling | Existing (inside spec sheet) | KEEP (extracted to own section) |
| 14 | Stage Approval Gate Tracker | Existing section 9 | KEEP |
| 15 | Production Change Notes | Existing section 10 | KEEP |

---

### Detailed Changes

#### 1. Data Model — `src/data/designStore.ts`

Add new fields to the `Design` interface:

```ts
// 4-View sketches
sketchViews?: {
  front?: string;   // image URL or data URL
  back?: string;
  left?: string;
  right?: string;
};

// Construction callouts (labeled annotations)
constructionCallouts?: {
  label: string;     // "A", "B", "C" etc.
  description: string; // "CF closure 4 hole sew-through buttons..."
}[];

// Graded spec sheet (full professional format)
gradedSpecSheet?: {
  sampleSize: string;  // "6"
  sizeRange: string;   // "0 - 14"
  measurements: {
    label: string;           // "A"
    pointOfMeasurement: string; // "1/2 Chest width 2cm below armhole"
    grade: number;           // 2.5
    tolMinus: number;        // 1
    tolPlus: number;         // 1
    values: Record<string, number>; // { "0": 50.3, "2": 52.8, ... "14": 67.8 }
  }[];
};

// Body size chart (grading reference)
bodySizeChart?: {
  label: string;       // "A"
  measurement: string; // "Bicep"
  values: Record<string, number>; // { "0": 25.5, "2": 26, ... }
}[];

// Pattern UV layouts
patternLayouts?: {
  pieceName: string;   // "Left sleeve long (interior)"
  imageUrl?: string;   // optional image
}[];

// Artwork placement details
artworkPlacements?: {
  artworkType: string;  // "Digital Print"
  width: string;        // "41cm"
  height: string;       // "52.3cm"
  angle: string;        // "(0°)"
  notes?: string;
  placementView?: 'front' | 'back' | 'left' | 'right';
}[];

// Bill of Materials
billOfMaterials?: {
  item: string;         // "Main Fabric"
  description: string;  // "Cotton Lawn 60s"
  supplier?: string;
  unitCost?: number;    // PKR
  quantity?: number;
  unit?: string;        // "meters", "pieces", "yards"
  totalCost?: number;   // PKR
}[];
```

Update mock designs with sample data for at least one design (e.g., `design-ws2046`) so the new sections are immediately visible.

#### 2. `src/components/production/ProductionTechpack.tsx` — Major Overhaul

Restructure into 15 sections. Key new UI elements:

**Section 1 — Product Detail Header**
- Structured like the reference: Brand row, Style Name, Style Code, Season/Collection, Sample Size, Size Range, Date
- Clean bordered table layout instead of scattered key-value pairs

**Section 2 — 4-View Technical Sketch**
- 2x2 grid: Front View | Back View / Left View | Right View
- Falls back to annotated canvas if 4-view not available
- Each quadrant has a label and bordered image area

**Section 3 — Construction Callouts**
- Table with Label (A, B, C...) and Description columns
- Matches the reference Page 4 callout format
- Only renders if `constructionCallouts` exists on the design

**Section 4 — Graded Spec Sheet**
- Full HTML table matching the reference format exactly:
  - Columns: Label | Point of Measurement (cm) | Grade | Tol - | Tol + | Size 0 | 2 | 4 | 6 | 8 | 10 | 12 | 14
  - Each row is a measurement point (A through X)
- Falls back to the existing flat spec sheet if graded data is not available
- Horizontally scrollable on mobile

**Section 5 — Body Size Charts**
- Table: Label | Measurement | sizes 0-14
- Reference body measurements (Bicep, Chest, Waist, etc.)
- Only renders if `bodySizeChart` data exists

**Section 6 — Pattern UV Layouts**
- Grid of labeled pattern piece cards (e.g., "Left sleeve long (interior)", "Back straight", "Collar flap standard")
- Each card has a placeholder image area and the piece name
- Only renders if `patternLayouts` data exists

**Section 9 — Artwork Placement (upgraded)**
- Table: Artwork | Type | Width | Height | Angle | Notes
- Below the table, a 4-view grid showing placement positions
- Pulls data from the artwork store if linked, plus any `artworkPlacements` on the design

**Section 10 — Bill of Materials**
- Table: Item | Description | Supplier | Unit Cost (PKR) | Qty | Unit | Total (PKR)
- Summary row with total cost
- Only renders if `billOfMaterials` data exists

All existing sections (Fabric Specs, Trims, Lining, GGT Files, Stage Tracker, Production Notes) remain unchanged in content, just renumbered.

#### 3. `src/components/TechpackPreview.tsx` — Align Design-Time Preview

Update the design-time techpack preview to also show the 4-view grid and construction callouts when available, so designers see a preview that matches the final production format. Add props for the new fields. This is a lighter update — just add the 4-view grid and callout table if data is passed in.

#### 4. Mock Data Seeding

Seed `design-ws2046` with:
- `gradedSpecSheet` with 10-12 measurement rows matching the reference format
- `constructionCallouts` with 5-7 entries (A-G)
- `bodySizeChart` with 9 body measurements
- `patternLayouts` with 8-10 piece names
- `artworkPlacements` with 3-4 entries
- `billOfMaterials` with 5-6 line items
- `sketchViews` left as undefined (placeholder areas will show)

This ensures the techpack renders a full professional document immediately for demo purposes.

---

### File Summary

| File | Action |
|------|--------|
| `src/data/designStore.ts` | **Edit** — Add new interface fields + seed mock data |
| `src/components/production/ProductionTechpack.tsx` | **Edit** — Major restructure to 15 sections |
| `src/components/TechpackPreview.tsx` | **Edit** — Add 4-view grid + callouts to design preview |

### Technical Notes

- All costs in BOM use PKR (consistent with prior currency migration)
- The graded spec sheet table uses `overflow-x-auto` for horizontal scrolling on smaller screens
- Pattern UV layouts are visual placeholders — in production, these would link to actual pattern images from the GGT files
- The 4-view sketch grid gracefully degrades: if only front/back sketches exist (from silhouette induction), it shows a 1x2 grid; if all 4 views exist, it shows a 2x2 grid
- Construction callouts auto-label with sequential letters (A, B, C...) matching the reference format

