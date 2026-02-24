

# Redesign Silhouette Induction Form — Full Overhaul

This plan covers the complete restructuring of the silhouette induction form, including all the category/sub-type changes, measurements, sketches, seam finish, **plus** a preview design sheet with PDF download and notification forwarding to the relevant person's inbox.

---

## Summary of All Changes

The current `SilhouetteInductionForm` is a basic form with manual codes, 5 flat categories, a single sketch upload, and no measurements, seam finish, preview, or PDF. This plan transforms it into a comprehensive, multi-section form with:

- Auto-generated codes (no manual input)
- Product line and designer name fields
- 7 categories with secondary sub-type dropdowns
- Front + back sketch uploaders with crop/adjust/AI enhance toolbar
- Reference images section
- Category-specific measurement fields
- Seam finish selector (same options as New Design)
- Fabric selector from inducted fabrics
- **Preview design sheet** (rendered summary card of all entered data)
- **PDF download** of the preview sheet (using jsPDF + html2canvas, same pattern as `NewDesignForm`)
- **Submit with notification** — on submit, a notification is created via `useNotificationStore.addNotification()` and forwarded to the inbox of the relevant recipient (design lead / sampling incharge) based on the selected product line

---

## Detailed File Changes

### 1. `src/data/silhouetteStore.ts` — Type and Data Updates

**Update `SilhouetteCategory`:**
```
'top' | 'bottom' | 'dupatta' | 'dress' | 'outerwear' | 'slip' | 'accessories'
```

**Add `SilhouetteSubType` mapping constant:**

| Category | Sub-types |
|----------|-----------|
| Top | Kurta, Kameez, Tunic, Choli/Blouse |
| Bottom | Shalwar, Trousers, Lehenga, Saree, Gharara/Sharara, Skirt, Dhoti, Sarong |
| Dress | Anarkali/Angarkha, Kaftan |
| Outerwear | Koti, Jacket, Coat |
| Dupatta | Regular, Stole, Scarf, Experimental |
| Accessories | Bag, Wallet, Scrunchie, Special Edition |
| Slip | Slip (single option) |

**Add new fields to `Silhouette` interface:**
- `subType: string`
- `lineId?: string` — product line
- `designerName?: string`
- `frontSketch?: string`
- `backSketch?: string`
- `referenceImages?: string[]`
- `measurements?: Record<string, string>` — category-specific
- `seamFinish?: string`
- `linkedFabricId?: string` (already exists on approval, move to creation)

**Update `SILHOUETTE_CATEGORY_LABELS`** for 7 new categories.

**Migrate sample silhouettes** — map old `kurta`/`shirt` → `top`, `pants` → `bottom`.

### 2. `src/data/libraryData.ts` — Add Constants

Export two new constants:

**`SILHOUETTE_SUB_TYPES`** — `Record<SilhouetteCategory, { id: string; label: string }[]>`

**`CATEGORY_MEASUREMENTS`** — measurement field definitions per category:

- **Top**: Length, Chest, Shoulder, Sleeve Length, Armhole, Hem Width, Neck Depth Front, Neck Depth Back, Sleeve Opening
- **Bottom**: Length, Waist, Hip, Inseam, Thigh, Knee, Hem Opening, Rise
- **Dupatta**: Length, Width
- **Dress**: Length, Chest, Shoulder, Sleeve Length, Armhole, Waist, Hip, Hem Width, Neck Depth Front, Neck Depth Back
- **Outerwear**: Length, Chest, Shoulder, Sleeve Length, Armhole, Hem Width, Overlap/Closure Width
- **Slip**: Length, Chest, Hip, Hem Width
- **Accessories**: Length, Width, Depth/Gusset

### 3. `src/components/SilhouetteInductionForm.tsx` — Full Redesign of Submit Step

The `submit` step is replaced with a multi-tab form inside the dialog (max-w-4xl for more room):

**Tab 1 — Basic Info:**
- Auto-generated code (read-only display, generated on submit from `{LinePrefix}-{CategoryPrefix}-{SubTypePrefix}-{NNN}`)
- Product Line selector (9 lines: cottage, classic, formals, woman, ming, basic, semi-bridals, leather, regen)
- Designer Name text input
- Category dropdown (7 categories)
- Sub-type dropdown (filtered by category)
- Silhouette Name field

**Tab 2 — Sketches & References:**
- Front Sketch uploader (reused `SketchUploader` component)
- Back Sketch uploader (separate instance)
- Each uploader gets a small toolbar below the preview with 3 buttons:
  - **Crop** — placeholder (shows "Coming Soon" toast)
  - **Adjust Colors** — placeholder
  - **Enhance with AI** — placeholder
- Reference Images section: multi-upload grid with remove buttons

**Tab 3 — Technical Details:**
- Category-specific measurement fields (dynamically rendered from `CATEGORY_MEASUREMENTS` config, all optional)
- Seam Finish selector — uses `seamFinishLibrary` from `libraryData.ts` (same as `NewDesignForm`), rendered as a `Select` dropdown showing `{name} - {type}`
- Fabric selector — dropdown of inducted fabrics from `useFabricStore`

**Tab 4 — Designer Notes:**
- Designer Notes textarea (existing)

**Tab 5 — Preview & Submit:**
- A `SilhouettePreviewSheet` component (new, described below) renders a read-only summary of all data
- A ref is attached to the preview for PDF generation
- **Download PDF** button — uses the same `jsPDF` + `html2canvas` pattern from `NewDesignForm`:
  ```ts
  const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm' });
  pdf.addImage(...);
  pdf.save(`silhouette-induction-${code}-${Date.now()}.pdf`);
  ```
- **Submit** button — calls `addSilhouette()` with all new fields, then creates a notification via `useNotificationStore.addNotification()`:
  ```ts
  addNotification({
    type: 'task-assigned',
    severity: 'info',
    title: `New Silhouette Inducted: ${name}`,
    message: `${designerName} has submitted silhouette ${code} (${subType}) for ${lineName} line. Review required.`,
    relatedEntityType: 'design',
    relatedEntityId: newSilhouetteId,
    actionUrl: '/design-hub',
    actionLabel: 'View Silhouette',
    recipientRoles: ['design-lead', 'sampling-incharge'],
  });
  ```

### 4. New Component: `src/components/SilhouettePreviewSheet.tsx`

A read-only card component (similar in structure to `TechpackPreview`) that renders:

- **Header**: "Silhouette Induction Sheet" + date + auto-generated code
- **Basic Info section**: Line, Designer, Category, Sub-type, Name
- **Sketches section**: Front and back sketch images side by side
- **Reference Images**: Grid of reference images (if any)
- **Measurements section**: Table/grid of filled measurement fields (skips empty ones)
- **Technical Details**: Seam finish, linked fabric
- **Designer Notes**: Notes text block

This component accepts all form data as props and is wrapped in a `forwardRef` so the parent can capture it for PDF generation.

### 5. Downstream Category Migration

Files referencing old `SilhouetteCategory` values need updates:

- **`src/components/SilhouetteLibrary.tsx`** — update filter tabs from `kurta/shirt/dress/pants/dupatta` to `top/bottom/dupatta/dress/outerwear/slip/accessories`
- **`src/components/SilhouetteStatusBoard.tsx`** — category display labels
- **`src/components/SilhouetteCard.tsx`** — category badge
- **`src/components/design/ComponentSelector.tsx`** — silhouette category filtering

The mapping: `kurta` → `top`, `shirt` → `top`, `pants` → `bottom`, `dress` → `dress`, `dupatta` → `dupatta`. New additions: `outerwear`, `slip`, `accessories`.

### 6. Sketch Toolbar (Crop/Adjust/AI)

Below each sketch preview, three icon buttons:
- **Crop** → `toast.info('Crop tool coming soon')`
- **Adjust Colors** → `toast.info('Color adjustment coming soon')`
- **AI Enhance** → `toast.info('AI enhancement coming soon')`

These are visual placeholders for now, ready to be wired to real implementations later.

---

## Technical Notes

- The `Silhouette` interface gains ~8 new optional fields. Existing silhouettes continue working due to optional typing.
- The old `sketchFile` field maps to `frontSketch` for existing data (backward compat in the form's `useEffect` initializer).
- PDF generation reuses the exact same `jsPDF` + `html2canvas` libraries already installed and used in `NewDesignForm`.
- Notification forwarding uses the existing `useNotificationStore.addNotification()` — the notification appears in the `NotificationBell` component for users with `design-lead` or `sampling-incharge` roles.
- The `AlertType` already includes `'task-assigned'` which is appropriate for new silhouette submissions.

