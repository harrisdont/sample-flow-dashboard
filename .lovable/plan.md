

# Add New Artwork Module — Print & Motif Induction

## Overview

This adds a comprehensive artwork induction system with two major categories: **Print** and **Motif**. Both share common fields (collection, designer name, etc.) but diverge into category-specific workflows with nested sub-categories, component selectors, and file link entries for artwork and colourways.

The feature integrates into:
- The global **Add New** menu (top nav) as "New Artwork"
- The **Design Hub** as a new "Artwork" tab alongside Silhouettes, Fabrics, etc.

---

## Data Architecture

### New Store: `src/data/artworkStore.ts`

```text
ArtworkType: 'print' | 'motif'

── PRINT ──
PrintTechnique: 'digital' | 'rotary' | 'screen'
PrintLayout: 'running' | 'engineered'

Running → component: 'shirt' | 'dupatta' | 'lowers'
Engineered → component + placement:
  shirt    → front, back, sleeve
  lowers   → trousers/shalwar, panels-skirt, circle-skirt, saree, gharara
  dupatta  → stole, square-scarf, 2.5M, 2.75M

── MOTIF ──
MotifTechnique: 'multihead' | 'pakki' | 'ari-dori' | 'adda' | 'cottage'

Multihead → layout: 'running' | 'engineered' | 'borders'
  engineered → select butter paper → auto-fills silhouette name, component, etc.
  running / borders → manual component selection

All others (pakki, ari-dori, adda, cottage) → simpler form with component + placement
```

**Artwork interface:**

| Field | Type | Description |
|-------|------|-------------|
| id | string | Auto-generated |
| type | 'print' \| 'motif' | Top-level category |
| collectionId | string | Linked capsule collection |
| designerName | string | Who created it |
| lineId | string | Product line |
| technique | string | print technique or motif technique |
| layout | string | running / engineered / borders |
| component | string | shirt / dupatta / lowers |
| placement | string | front / back / sleeve / etc. |
| artworkFileLink | string | Local/network path to artwork file |
| colourways | { name: string; fileLink: string }[] | Colourway variants with file links |
| butterPaperId? | string | For multihead engineered — links to approved silhouette |
| autoFilledDetails? | { silhouetteName, componentName, code } | Auto-populated from butter paper |
| status | 'draft' \| 'submitted' \| 'approved' | Workflow status |
| notes | string | Designer notes |
| createdAt / updatedAt | Date | Timestamps |

**Store methods:** `addArtwork`, `updateArtwork`, `removeArtwork`, `getArtworkByCollection`, `getArtworkByType`

### Mock Data

2-3 seeded artworks (one print-digital-running, one motif-multihead-engineered) linked to existing collections for immediate visibility.

---

## UI Component: `src/components/NewArtworkForm.tsx`

A single-view scrollable dialog (same pattern as the silhouette induction form), `max-w-4xl`.

### Section Flow

**Section 1 — Common Fields:**
- Artwork Type toggle: **Print** | **Motif** (large toggle buttons)
- Collection selector (from capsule store)
- Product Line (auto-filled from collection, editable)
- Designer Name (text input)

**Section 2 — Technique Selection (conditional on type):**

*If Print:*
- Technique: Digital | Rotary | Screen (radio group)
- Layout: Running | Engineered (radio group)

*If Motif:*
- Technique: Multihead | Pakki | Ari-Dori | Adda | Cottage (radio group)
- If Multihead → Layout: Running | Engineered | Borders (radio group)

**Section 3 — Component & Placement (conditional on layout):**

*Running (both print & motif):*
- Component selector: Shirt | Dupatta | Lowers (checkbox group, multi-select)

*Engineered (print):*
- Component selector: Shirt | Dupatta | Lowers
- Placement sub-selector (appears after component selection):
  - Shirt → Front, Back, Sleeve (checkboxes)
  - Lowers → Trousers/Shalwar, Panels Skirt, Circle Skirt, Saree, Gharara (checkboxes)
  - Dupatta → Stole, Square Scarf, 2.5M, 2.75M (checkboxes)

*Engineered (multihead motif):*
- **Select Butter Paper** dropdown — lists approved silhouettes from `useSilhouetteStore` (filtered to status === 'approved')
- On selection, auto-fills a read-only summary card showing: Silhouette Name, Code, Category, Sub-type, Component Name, linked fabric
- Below that, manual placement override if needed

*Borders (multihead motif):*
- Component selector same as running

**Section 4 — Artwork Files:**
- **Add Artwork** — text input for file link (local/network path) with a label field
- **Add Colourway** — repeatable section: colourway name + file link. "Add Another Colourway" button adds rows. Each row has a remove button.

**Section 5 — Notes:**
- Designer notes textarea

**Section 6 — Actions:**
- Cancel | Submit Artwork
- On submit: saves to artwork store, sends notification to design-lead via `useNotificationStore.addNotification()`

---

## Integration Points

### 1. `src/components/AddNewMenu.tsx`

Add a fourth menu item:
```
<DropdownMenuItem> <Paintbrush icon /> New Artwork </DropdownMenuItem>
```
State: `artworkFormOpen` / `setArtworkFormOpen`
Render: `<NewArtworkForm open={artworkFormOpen} onOpenChange={setArtworkFormOpen} />`

### 2. `src/pages/DesignHub.tsx`

Add a new tab "Artwork" to the existing `TabsList` (after Fabric Inbox):
```
<TabsTrigger value="artwork"> <Paintbrush /> Artwork </TabsTrigger>
```

The `TabsContent` for "artwork" renders:
- Filter bar: Type (Print/Motif/All), Technique dropdown, Collection dropdown
- Grid/list of artwork cards showing: type badge, technique, component, collection name, colourway count, status
- "Add Artwork" button that opens the same `NewArtworkForm`

### 3. Butter Paper Auto-Fill (Multihead Engineered)

When a user selects a butter paper (approved silhouette) in the motif-multihead-engineered flow:
- Read from `useSilhouetteStore` → filter by `status === 'approved'`
- Display silhouette details in a read-only card: name, code, category, sub-type, linked fabric, front sketch thumbnail
- Auto-populate the `autoFilledDetails` field on the artwork record

---

## File Summary

| File | Action |
|------|--------|
| `src/data/artworkStore.ts` | **New** — Zustand store with types, interface, mock data |
| `src/components/NewArtworkForm.tsx` | **New** — Full artwork induction form dialog |
| `src/components/AddNewMenu.tsx` | **Edit** — Add "New Artwork" menu item |
| `src/pages/DesignHub.tsx` | **Edit** — Add "Artwork" tab with listing view |

---

## Technical Notes

- The colourway repeater uses a simple array state with `push` / `filter` operations — same pattern as reference images in the silhouette form.
- Butter paper selection filters silhouettes by `status === 'approved'` to ensure only fully-approved patterns can be linked.
- The artwork store is session-only (Zustand without persistence), consistent with all other stores in the project.
- Notification on submit uses the existing `addNotification` with `recipientRoles: ['design-lead']` and `type: 'task-assigned'`.
- All monetary references in the artwork form (if any arise) will use PKR.

