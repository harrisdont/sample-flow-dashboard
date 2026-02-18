
# Fix: Make Production Tab & Scan Sample Accessible From Everywhere

## Root Cause

The Production tab and Scan Sample tab are currently implemented as **view states** inside `Index.tsx` (the `/` route only). The buttons that toggle them appear only in the navigation bar when the user is already on `/`. 

The user is on `/sampling-floor` — a completely separate page with its own navigation — and from there, no Production button exists. This is a navigation dead-end that affects every page except the home dashboard.

## The Fix

Move both features to **proper standalone routes** so the existing `MainNav` (which is already on every page) can link to them directly. This is the correct architectural pattern — the same way `/director`, `/design-hub`, `/sourcing`, and `/sampling-floor` all work.

### New Routes

| Route | Component | What it renders |
|---|---|---|
| `/production` | `ProductionPage` (new) | The existing `ProductionTab` component |
| `/scan` | `ScanPage` (new) | The existing `ScanSampleTab` component |

### Add to MainNav

Two new entries added to the `NAV_ITEMS` array in `MainNav.tsx`:

| Label | Icon | Path |
|---|---|---|
| Production | `Factory` | `/production` |
| Scan Sample | `Scan` | `/scan` |

These sit alongside the existing Dashboard, Director, Planning, Sourcing, Design Hub, and Sampling Floor links — visible and active-highlighted on every page.

### Handle drill-down navigation from `/production`

The Production tab has a three-level drill-down (overview → collection → techpack). Since this is now a route, the drill-down needs to stay within the page using local state — exactly the same pattern currently used in `Index.tsx`. The new `ProductionPage` will manage the `productionView`, `productionCollectionName`, and `productionTechpackSample` states that currently live inside `Index.tsx`.

### Clean up `Index.tsx`

Remove the `'production'`, `'production-collection'`, `'production-techpack'`, and `'scan'` view states from `Index.tsx` entirely — along with the Production and Scan Sample buttons from the nav slots in that file. The home dashboard reverts to only managing `'dashboard'`, `'board'`, `'ejob'`, and `'collection-detail'`.

---

## Files to Create

### `src/pages/ProductionPage.tsx`
A new standalone page wrapping the existing production components. Manages the three-level drill-down state internally:
- `view: 'list' | 'collection' | 'techpack'`
- `selectedCollectionName`
- `selectedSample`

Renders `ProductionTab` → `ProductionCollectionView` → `ProductionTechpack` based on view state. Includes `MainNav` at the top.

### `src/pages/ScanPage.tsx`
A minimal wrapper that renders `MainNav` + `ScanSampleTab`. The scan tab already opens the techpack inline as a sheet, so no additional state management is needed here.

---

## Files to Modify

### `src/components/MainNav.tsx`
Add two entries to `NAV_ITEMS`:
```ts
{ path: '/production', label: 'Production', icon: Factory },
{ path: '/scan', label: 'Scan Sample', icon: Scan },
```
Import `Factory` and `Scan` from `lucide-react`.

### `src/App.tsx`
Add two new routes:
```tsx
<Route path="/production" element={<ProductionPage />} />
<Route path="/scan" element={<ScanPage />} />
```

### `src/pages/Index.tsx`
- Remove `'production'`, `'production-collection'`, `'production-techpack'`, `'scan'` from the `View` type
- Remove the `productionCollectionName`, `productionTechpackSample` states
- Remove the `handleProductionCollectionClick` and `handleProductionTechpackOpen` handlers
- Remove the production and scan conditional renders and `if` blocks
- Remove the Production and Scan Sample buttons from the `MainNav` children in the main shell return
- Remove the unused imports: `ProductionTab`, `ProductionCollectionView`, `ProductionTechpack`, `ScanSampleTab`, `Factory`, `Scan`

---

## Result

After this change, the user on any page — including `/sampling-floor` — will see **Production** and **Scan Sample** in the top navigation bar and can click directly to those features without going back to the home dashboard first.
