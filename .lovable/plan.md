

# New Silhouette: Two Different Forms

## The Problem

The same issue that existed with New Collection exists here. There are **two completely different silhouette creation forms**:

1. **`NewSilhouetteForm`** (Add New menu) — A bare-bones dialog with collection picker, code, name, category, and description. It **does not even write to the silhouette store** — it just shows a success toast and discards the data.

2. **`SilhouetteInductionForm`** (Design Hub / Sampling page) — The full multi-step workflow with sketch upload (drag-and-drop + URL), designer notes, auto-generated codes, category selection using the proper `SilhouetteCategory` types (`kurta`, `shirt`, `dress`, `pants`, `dupatta`), and writes to `useSilhouetteStore`. It also handles the full lifecycle: pattern development, sample review, approval with grading/costing.

They are not connected at all. The global Add New version is a dead-end that creates nothing.

## The Fix

Replace the `NewSilhouetteForm` in the Add New menu with the `SilhouetteInductionForm`, which is the real, functional form.

### Files to Modify

**`src/components/AddNewMenu.tsx`**
- Replace the import of `NewSilhouetteForm` with `SilhouetteInductionForm`
- Replace the rendered `<NewSilhouetteForm>` with `<SilhouetteInductionForm>` (no `silhouette` prop passed, so it opens in "submit" mode for new creation)

**`src/components/NewSilhouetteForm.tsx`**
- Can be deleted entirely — it becomes unused. The `SilhouetteInductionForm` already handles new silhouette creation when no `silhouette` prop is passed.

### Result

Clicking **Add New → New Silhouette** from any page opens the same full induction form used on the Design Hub — with sketch upload, auto-code generation, proper category types, and actual persistence to `useSilhouetteStore`.

