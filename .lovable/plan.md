

# Silhouette Approval Submission Form + PKR Currency Fix

## Overview

This plan addresses two requests:
1. **Approval submission form**: When a silhouette is approved (the "approve" step), expand it into a comprehensive submission with a spec sheet (sizes 8-16), GGT pattern link with grading, sleeve/neckline categorisation that auto-codes into the library, final fitting photos, and stitching lead time + cost.
2. **Currency fix**: Replace all `₹`, `IndianRupee`, and `Rs.` references with `PKR` across the codebase.

---

## Detailed Changes

### 1. Currency Fix — Replace INR/₹ with PKR

**Files affected:**

- **`src/components/design/ComponentSelector.tsx`** (lines 20, 260, 302, 340, 347, 355): Replace `IndianRupee` icon import with a generic currency approach (use text "PKR" instead of icon), replace `₹` with `PKR `.
- **`src/components/design/ClosureSelector.tsx`** (lines 21, 149): Replace `IndianRupee` import and `₹` with `PKR `.
- **`src/components/NewDesignForm.tsx`** (lines 45, 1101, 1108, 1115, 1122): Replace `IndianRupee` icon references with `PKR` text.
- **`src/components/SilhouetteCard.tsx`** (lines 135, 145, 150): Replace `Rs.` with `PKR`.
- **`src/components/SilhouetteInductionForm.tsx`** (lines 863, 874, 881-895): Replace `Rs.` with `PKR`.
- **`src/pages/FabricInduction.tsx`** (line 369): Already uses `PKR` — no change needed.

### 2. `src/data/silhouetteStore.ts` — Expand Interface for Approval Data

Add new fields to the `Silhouette` interface:

```ts
// Spec sheet — graded measurements for sizes 8-16
specSheet?: Record<string, Record<string, string>>; // { "8": { "chest": "34", ... }, "10": { ... } }

// Categorised construction details
necklineId?: string;    // Links to necklineLibrary
sleeveId?: string;      // Links to sleeveLibrary

// Final fitting photos
fittingPhotos?: string[];

// Lead time
stitchingLeadTimeDays?: number;
```

Update `approveSilhouette` to accept these new fields in its `data` parameter.

Update `GRADING_SIZE_OPTIONS` — add numeric sizes: `['8', '10', '12', '14', '16']` (replace the current letter-based options, or keep both and add the numeric set as `SPEC_SHEET_SIZES`).

### 3. `src/data/libraryData.ts` — Auto-Induction to Neckline/Sleeve Library

Add functions or store methods that allow new neckline/sleeve entries to be added dynamically:

- Export `necklineLibrary` and `sleeveLibrary` as mutable (convert to a small Zustand store or use a mutable array with a setter).
- On approval, if the user enters a new neckline name that does not exist in the library, auto-generate a code (e.g., `NK-NEW-007`) and push it into the library so it appears in the New Design form's modifications tab.
- Same for sleeves (e.g., `SL-NEW-007`).

Since the current libraries are static arrays, the cleanest approach is to create a small `useConstructionLibraryStore` in a new file or extend `libraryData.ts` with Zustand so entries persist in session.

### 4. `src/components/SilhouetteInductionForm.tsx` — Redesign Approve Step

The current approve step (lines 812-914) has: GGT link, technical drawing uploader, grading sizes (letter badges), fabric selector, consumption, stitching cost.

**Replace with a comprehensive single-view approval form:**

**Section A — Silhouette Summary (read-only header)**
- Code, name, category, sub-type badge, sketches thumbnail

**Section B — Spec Sheet (Graded Measurements)**
- A table with columns for sizes 8, 10, 12, 14, 16
- Rows are the category-specific measurement fields (from `CATEGORY_MEASUREMENTS`)
- Each cell is an editable input
- This creates a full grading spec sheet

**Section C — GGT Pattern File**
- GGT file link input (existing)
- Grading sizes checkboxes (existing, but add numeric 8-16)

**Section D — Construction Categorisation**
- **Neckline**: Dropdown from `necklineLibrary` + "Add New" option that opens an inline input to create a new entry (auto-coded, auto-inducted into library)
- **Sleeve**: Same pattern — dropdown from `sleeveLibrary` + "Add New"
- These are relevant for tops, dresses, outerwear. For bottoms/dupatta/accessories, these sections are conditionally hidden.

**Section E — Final Fitting Photos**
- Multi-image uploader (reuse the same `SketchUploader` pattern or the reference images grid)
- Each photo gets the crop/adjust/AI enhance toolbar

**Section F — Stitching Lead Time & Cost**
- Stitching Lead Time (days) — number input
- Stitching Cost (PKR) — number input
- Link Inducted Fabric — dropdown (existing)
- Fabric Consumption (meters) — number input (existing)
- Cost calculation summary (existing, but with PKR)

**Section G — Action Buttons**
- Reject (with reason textarea)
- Approve & Induct

**On Approve:**
- Save all new fields to silhouette store
- If new neckline/sleeve were created, induct them into the library
- The neckline/sleeve entries become available in the New Design form's modifications tab
- GGT patterns with grading are stored on the silhouette record

### 5. Neckline/Sleeve Library Store — New File `src/data/constructionLibraryStore.ts`

A small Zustand store that wraps the static `necklineLibrary` and `sleeveLibrary` arrays and allows runtime additions:

```ts
interface ConstructionLibraryStore {
  necklines: NecklineItem[];
  sleeves: SleeveItem[];
  addNeckline: (name: string) => NecklineItem;
  addSleeve: (name: string) => SleeveItem;
}
```

- Initialised with the existing static data from `libraryData.ts`
- `addNeckline` generates the next code (`NK-{3-letter}-{NNN}`) and appends
- `addSleeve` generates `SL-{3-letter}-{NNN}` and appends
- `NewDesignForm` is updated to read from this store instead of the static arrays

### 6. `src/components/NewDesignForm.tsx` — Use Dynamic Library

Update imports to use `useConstructionLibraryStore` for necklines and sleeves instead of the static `necklineLibrary` / `sleeveLibrary`. This way, any neckline or sleeve inducted during silhouette approval immediately appears in the New Design form's modifications dropdown.

### 7. Downstream — Files Already Using Rs./₹/IndianRupee

All currency displays across the following files will be updated to use `PKR` consistently:
- `ComponentSelector.tsx` — fabric cost display
- `ClosureSelector.tsx` — accessory cost display  
- `NewDesignForm.tsx` — cost breakdown panel
- `SilhouetteCard.tsx` — cost tooltip
- `SilhouetteInductionForm.tsx` — approval cost calculation

The `IndianRupee` lucide icon import will be removed from all files where it's used. Cost values will display as `PKR 850` instead of `₹850` or `Rs. 850`.

---

## Technical Notes

- **Spec sheet data structure**: `Record<string, Record<string, string>>` where outer keys are size labels ("8", "10", etc.) and inner keys are measurement field IDs. This allows the grading table to render dynamically based on category.
- **Neckline/sleeve auto-coding**: The code prefix is derived from the first 3 characters of the name (uppercase). Sequential number is based on current library length + 1.
- **Fitting photos** reuse the same `SketchUploader` component with `compact` mode and the crop/adjust/AI toolbar.
- **Conditional rendering**: Neckline and sleeve sections only appear for categories where they're relevant (top, dress, outerwear). They're hidden for bottom, dupatta, slip, accessories.
- **PKR currency**: All monetary values across the entire application will consistently display as `PKR` (Pakistani Rupee).

