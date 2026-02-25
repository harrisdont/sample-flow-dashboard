

# Enrich Production Techpack — Missing Fields & Multi-Piece Component Sections

## What's Missing from the Current Techpack

The current Section 1 (Product Detail) shows 12 rows but is missing several critical fields that exist elsewhere in the data model. Additionally, there is no dedicated section for accompanying pieces in 2pc/3pc designs.

### Fields to Add to Product Detail Header (Section 1)

| Field | Source | Currently Shown? |
|-------|--------|-----------------|
| Fabric Name | `fabricStore` → `fabricName` | No |
| Fabric Code | `fabricStore` → `id` | No |
| Fabric Colour | `fabricStore` → `colorId` / `colorPaletteStore` | No |
| SPI | `fabricStore` → `technicalSpecs.recommendedSPI` | No |
| Ironing Instructions | `fabricStore` → `technicalSpecs.ironingInstructions` | No |
| Seam Style | `design.seamFinish` | No (only in fallback spec sheet) |
| Product Category | `design.category` (1pc/2pc/3pc etc.) | No |
| GTM Date | `capsuleCollectionData` → `targetInStoreDate` | No |
| Silhouette Name | `sample.silhouetteName` | Yes |
| Silhouette Code | `sample.silhouetteCode` | Yes (as "Style Code") |
| Neckline Name & Code | `constructionLibraryStore` via `design.neckline` / silhouette `necklineId` | No |
| Sleeve Name & Code | `constructionLibraryStore` via `design.sleeve` / silhouette `sleeveId` | No |
| Order Qty | `sample.totalQty` | No |

### New Section Needed: Multi-Piece Component Details

For 2pc/3pc/lehenga-set/saree-set designs, the techpack must include a **dedicated section** showing each accompanying piece (Shirt, Lowers, Dupatta, Lehenga, Choli, etc.) with:
- Component silhouette name & sketch
- Component fabric name, code, colour
- Component-specific trims & closures
- Component-specific techpack annotations/drawings

This data lives in `design.components` (a map of `ComponentSpec` objects, each with `silhouetteId`, `fabricId`, `trims`, `closures`).

---

## Detailed Changes

### 1. `src/components/production/ProductionTechpack.tsx`

**Section 1 — Product Detail Header: Add ~12 new rows**

The component already imports `useFabricStore` and has `fabric` and `specs`. It also needs:
- Import `useCapsuleStore` to fetch GTM date from the collection
- Import `useConstructionLibraryStore` to resolve neckline/sleeve names+codes
- Import `useSilhouetteStore` to resolve component silhouette details

New rows to add to the header table after the existing 12:
- **Fabric Name** — `fabric?.fabricName`
- **Fabric Code** — `fabric?.id`
- **Colour** — resolve from `colorPaletteStore` using `fabric?.colorId`, or fall back to `sample.colour`
- **SPI** — `specs?.recommendedSPI` + " SPI"
- **Ironing** — `IRONING_INSTRUCTION_LABELS[specs?.ironingInstructions]`
- **Seam Style** — `design?.seamFinish`
- **Product Category** — map `design?.category` to human label ("1 Piece", "2 Piece", "3 Piece", "Lehenga Set", etc.)
- **GTM Date** — look up capsule collection by `design?.collectionId` and format `targetInStoreDate`
- **Neckline** — look up from `constructionLibraryStore` by `silhouette.necklineId` or `design?.neckline`, show "Name (Code)"
- **Sleeve** — same pattern as neckline
- **Order Qty** — `sample.totalQty`

**New Section (insert after Section 2, before Construction Callouts) — "Component Pieces"**

Only rendered when `design?.category` is `twoPiece`, `threePiece`, `lehenga-set`, or `saree-set` AND `design?.components` has entries.

For each component (shirt, lowers, dupatta, lehenga, choli, saree, blouse):
- **Sub-header card** with component name badge
- **Silhouette info**: resolve `componentSpec.silhouetteId` from `silhouetteStore` → show name, code, front/back sketch images
- **Fabric info**: resolve `componentSpec.fabricId` from `fabricStore` → show name, composition, colour
- **Trims & closures** for that specific component
- **Techpack annotation** if the component has custom modifications (neckline, sleeve, seam finish overrides)

This gives production a complete picture of every piece in a single document.

### 2. No data model changes needed

All required data already exists across the stores:
- `designStore` → `Design.components`, `category`, `seamFinish`, `neckline`, `sleeve`
- `fabricStore` → `FabricEntry` with `fabricName`, `id`, `colorId`, `technicalSpecs`
- `capsuleCollectionData` → `CapsuleCollection.targetInStoreDate`
- `silhouetteStore` → `Silhouette` with `necklineId`, `sleeveId`, sketches
- `constructionLibraryStore` → neckline/sleeve name+code lookup
- `colorPaletteStore` → colour name resolution

The techpack just needs to **fetch and display** this data.

---

## File Summary

| File | Action |
|------|--------|
| `src/components/production/ProductionTechpack.tsx` | **Edit** — Expand Section 1 with ~12 new header rows; add new "Component Pieces" section for multi-piece designs; add imports for capsule store, silhouette store, construction library store, color palette store |

## Technical Notes

- Category label mapping: `{ onePiece: '1 Piece', twoPiece: '2 Piece', threePiece: '3 Piece', dupattas: 'Dupatta', lowers: 'Lowers', 'lehenga-set': 'Lehenga Set', 'saree-set': 'Saree Set' }`
- Component pieces section uses a bordered card per component with an internal 2-column grid for details + sketch image
- All data is fetched reactively from Zustand stores — no API calls, no new state
- The component pieces section number shifts all subsequent sections by 1 (Construction Callouts becomes Section 4, etc.)
- Neckline/sleeve lookup: first try `constructionLibraryStore` by `silhouette.necklineId`, then fall back to `design.neckline` as plain text

