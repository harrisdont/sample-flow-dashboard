

# Editable Techpack Preview with Approve for Production

## Overview

Create a new `/techpack-preview/:designId` page that renders the full 15-section production techpack in an **editable mode**. Users can inline-edit key fields (spec sheet measurements, BOM costs, construction callouts, notes, etc.), review the complete document, then either **Download PDF** or **Approve for Production**. Approval updates the design status to `approved` and is reflected on the Design Hub.

---

## Architecture

```text
DesignHub (collections tab)
  └── "Review Techpack" button per design card
        └── /techpack-preview/:designId
              ├── Editable ProductionTechpack (readOnly=false)
              │   ├── Section 1: Product Detail — editable fields (seam style, notes, etc.)
              │   ├── Section 4: Graded Spec Sheet — editable measurement values
              │   ├── Section 10: BOM — editable costs/qty
              │   ├── Section 3: Construction Callouts — add/edit/remove rows
              │   └── All other sections: read-only display
              ├── "Download PDF" button (html2canvas + jspdf)
              └── "Approve for Production" button → updates design.status to 'approved'
```

---

## File Changes

### 1. New File: `src/pages/TechpackPreviewPage.tsx`

A routed page at `/techpack-preview/:designId` that:
- Reads `designId` from URL params
- Looks up the `Design` from `useDesignStore` and matches a `Sample` from `useSampleStore`
- Manages local editable state (cloned from the design record) for:
  - `gradedSpecSheet.measurements[].values` — each cell is an `<input type="number">`
  - `billOfMaterials[].unitCost`, `.quantity`, `.totalCost` — inline number inputs with auto-calculated totals
  - `constructionCallouts` — editable description text, add/remove rows
  - `additionalNotes` — editable textarea
  - `seamFinish` — editable text input
- Renders the techpack in a `ref`-captured div for PDF generation
- Has a sticky header bar with:
  - Back button (navigates to `/design-hub`)
  - Design name + collection
  - **"Save Changes"** button — calls `updateDesign()` to persist edits
  - **"Download PDF"** button — captures content via `html2canvas` → `jspdf` multi-page A4
  - **"Approve for Production"** button — saves all edits, sets `design.status = 'approved'`, shows toast, navigates back to Design Hub

**Editable vs Read-Only Logic:**
- Sections that are editable get inline `<Input>` / `<Textarea>` elements replacing the static text
- A top-level `isEditing` toggle (default: true) lets the user switch between edit mode and preview mode
- In preview mode, all fields render as static text (same as current ProductionTechpack) — this is what gets captured for PDF
- PDF generation: temporarily switches to preview mode, waits a tick, captures, then restores

**PDF Generation (same libraries already installed):**
```
1. Set isEditing = false (switch to preview)
2. Wait 100ms for re-render
3. html2canvas(contentRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff' })
4. Calculate A4 page breaks (595.28 × 841.89 pts)
5. Split canvas into pages, jsPDF.addImage() each
6. Save as "Techpack_{sampleNumber}_{collection}_{date}.pdf"
7. Restore isEditing = true
```

### 2. Edit: `src/pages/DesignHub.tsx`

Add a **"Review Techpack"** button to the collections tab and/or a new column in the design listing. Specifically:

- In the `TabsContent value="collections"` section, inside each collection card, add a "Review Techpack" link for each design in that collection
- Add a new sub-section below the design counts that lists designs with their status and a "Review Techpack" button
- Uses `<Link to={/techpack-preview/${design.id}}>` to navigate
- Designs with `status === 'approved'` show a green "Approved" badge instead of the button

This surfaces the approval workflow directly within the Design Hub's existing collection view.

### 3. Edit: `src/App.tsx`

Add the new route:
```
<Route path="/techpack-preview/:designId" element={<TechpackPreviewPage />} />
```

### 4. Edit: `src/data/designStore.ts`

No schema changes needed. The existing `updateDesign(id, updates)` method already supports partial updates including `status: 'approved'`. The existing `Design.status` field already has the `'approved'` value in its union type.

Add one new store method for convenience:
- `approveDesign(id: string)` — sets `status: 'approved'` and adds a production note "Design approved for production" with department `'design'`

---

## Editable Sections Detail

| Section | Editable Fields | Input Type |
|---------|----------------|------------|
| 1. Product Detail | Seam Style, Additional Notes | Text input, Textarea |
| 3. Construction Callouts | Description per row, add/remove rows | Text input + buttons |
| 4. Graded Spec Sheet | Each measurement value per size, grade, tolerances | Number inputs in table cells |
| 5. Body Size Charts | Each value per size | Number inputs in table cells |
| 9. Artwork Placement | Width, Height, Angle, Notes | Text inputs |
| 10. BOM | Unit Cost, Quantity, Total Cost | Number inputs with auto-calc |
| 15. Production Notes | Add new notes (already exists) | Textarea + dept selector |

Sections 2, 6, 7, 8, 11, 12, 13, 14 remain **read-only** (they display data from linked stores — silhouette, fabric, trims, etc. — which are edited at their own induction points).

---

## Approve for Production Flow

1. User navigates from Design Hub → "Review Techpack" on a specific design
2. Page loads with all sections populated, editable fields highlighted with a subtle edit border
3. User reviews and edits measurements, BOM, callouts as needed
4. User clicks **"Save Changes"** → `updateDesign()` persists all edits to the store
5. User clicks **"Approve for Production"** → confirmation dialog → `approveDesign()` → toast "Techpack approved for production" → navigate back to `/design-hub`
6. On Design Hub, the design now shows an "Approved" badge and the "Review Techpack" button changes to "View Techpack" (still navigable, but page opens in preview-only mode since status is approved)

---

## File Summary

| File | Action |
|------|--------|
| `src/pages/TechpackPreviewPage.tsx` | **New** — Editable techpack preview + PDF download + approve flow |
| `src/pages/DesignHub.tsx` | **Edit** — Add "Review Techpack" links per design in collection cards |
| `src/App.tsx` | **Edit** — Add `/techpack-preview/:designId` route |
| `src/data/designStore.ts` | **Edit** — Add `approveDesign()` convenience method |

## Technical Notes

- PDF uses `html2canvas` + `jspdf` (both already installed)
- Editable number inputs use `type="number"` with `step="0.1"` for measurements and `step="1"` for costs
- The editable state is local (useState) — only persisted on explicit "Save Changes" or "Approve"
- Auto-calculation: BOM `totalCost = unitCost × quantity`, footer shows sum
- Construction callout labels auto-increment (A, B, C...) when rows are added
- Approved designs open in read-only mode (no edit inputs, no approve button)
- All costs display in PKR

