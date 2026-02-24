

# Connect "New Collection" (Add New Menu) to the Planning Page's Full Form

## Current State

There are **two separate collection creation forms**:

1. **`NewCollectionForm`** (Add New menu) — A simplified dialog with just line, name, GTM strategy, date, Pinterest link, and description. Creates a bare-bones capsule entry.
2. **`CapsuleCollectionPlanForm`** (Planning page) — The full detailed form inside a Sheet with category design breakdowns, composition settings, fabric requirements, technique selection, moodboard uploads, backwards scheduling timeline, and auto-created fabric entries.

Both write to the same `useCapsuleStore`, but the Add New version skips all the detailed planning fields, creating an incomplete capsule.

## The Fix

Replace the `NewCollectionForm` dialog with a **two-step flow**: first pick the product line, then open the full `CapsuleCollectionPlanForm` in a Sheet — identical to what the planning page does.

### Files to Modify

**`src/components/NewCollectionForm.tsx`**
- Replace the current simplified dialog with a two-step approach:
  - **Step 1**: Dialog with just the product line picker (the 9 lines)
  - **Step 2**: Once a line is selected, close the dialog and open a Sheet containing `CapsuleCollectionPlanForm` with the selected line's data
- Import `CapsuleCollectionPlanForm`, `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`
- Use the same line color mapping from the planning page (`initialProductLines` colors) so the form renders correctly
- Pass `allocatedDesigns: 0` since the global menu doesn't have planning-page allocation context (the form uses this only as an informational label)

### Line Color Data

The `CapsuleCollectionPlanForm` requires a `lineColor` prop. The color mapping currently lives only as local data in `SeasonalCollectionPlanning.tsx`. To avoid duplication, the product lines array in `NewCollectionForm` will be extended with color values matching the planning page:

```
cottage → bg-fashion-cottage
classic → bg-fashion-classic
formals → bg-fashion-formals
woman   → bg-fashion-woman
ming    → bg-fashion-ming
basic   → bg-sky-500
semi-bridals → bg-rose-400
leather → bg-amber-600
regen   → bg-emerald-600
```

### Result

Clicking **Add New → New Collection** from any page opens a line picker, then the exact same detailed capsule planning form used on the Seasonal Planning page — with category breakdowns, fabric requirements, technique selection, scheduling timeline, and auto-created fabric entries.

