
# Dashboard Remodel — Season Operations Center

## Summary of Changes Requested

1. Move the **Season Performance Chart** to the very top of the dashboard (before everything else)
2. Replace technical jargon — "RAG table" is renamed to **Collection Health** (it's a colour-coded list showing which collections are on track, at risk, or behind)
3. Build the full **5-stage pipeline overview** below the chart

---

## What "RAG" Means (Plain English)

The "RAG table" in the previous plan just means a colour-coded list of all collections with a traffic light indicator:
- **Green** = On track, no delays
- **Amber** = Some samples are running late
- **Red** = More than half the samples are overdue

It will simply be called **"Collection Health"** in the UI.

---

## Final Dashboard Layout (Top to Bottom)

```text
┌──────────────────────────────────────────────────────────────┐
│  Dashboard Header  [Role]  [Scan Sample]                      │
├──────────────────────────────────────────────────────────────┤
│  SEASON PERFORMANCE CHART  ← NEW, moved to the very top      │
│  Bar chart: On-Time vs Delayed, per department                │
│  (Design · Sourcing · Sampling · Decoration)                  │
├──────────────────────────────────────────────────────────────┤
│  PIPELINE OVERVIEW  (5 stage cards side by side)             │
│                                                               │
│  [1. Planning]  [2. Design]  [3. Sourcing]                   │
│  [4. Sampling]  [5. Approved for Production]                  │
├──────────────────────────────────────────────────────────────┤
│  ROLE-SPECIFIC PANEL (existing, unchanged)                    │
│  Director → Collection Health list + KPI cards               │
│  Design Lead → My pipeline + overdue                         │
│  Sampling Incharge → Floor queues                            │
└──────────────────────────────────────────────────────────────┘
```

---

## What Each Section Shows

### Season Performance Chart (top)

A grouped bar chart (using the existing `recharts` library) with one bar group per department, each split into two colours:

- **Green bar** = tasks/samples completed on time
- **Red bar** = tasks overdue or still pending past their deadline

Departments shown:
- **Design** — samples currently in `design` or `pattern` stage
- **Sourcing** — fabrics by their pipeline status (inducted on time vs overdue deadline)
- **Sampling** — samples in stitching/finishing stages, on-time vs overdue
- **Decoration** — samples in embroidery/print/pakki stages

Data comes from the existing `useSampleStore` and `useFabricStore` — no new data needed.

---

### Pipeline Overview (5 cards)

Each card is a simple box showing counts from live store data:

| Card | What It Shows | Where Data Comes From |
|---|---|---|
| **Planning** | Whether the season plan is set; how many collections have been planned vs total lines (9) | `useCapsuleStore` — count of capsules created |
| **Design** | How many designs have been submitted; how many sent to sampling | `useDesignStore` + `useSampleStore` |
| **Sourcing** | Fabrics ready, fabrics still in treatment, fabrics needing orders placed | `useFabricStore` |
| **Sampling** | Samples on the floor (in process), overdue, waiting for approval | `useSampleStore` |
| **Production** | How many samples have been fully approved and are ready to go to bulk production | `useSampleStore` (`approvalStatus === 'approved'`) |

Each card has a coloured left border: green if all is well, amber if some items are delayed, red if many items are overdue.

---

### Collection Health (part of Director role panel — existing, just renamed)

The existing "RAG Collection Status" section in the Director panel is simply renamed to **"Collection Health"** and the labels are updated to plain English:
- "On Track" (was "green")
- "Needs Attention" (was "amber")
- "Behind Schedule" (was "red")

---

## New File to Create

**`src/components/dashboard/SeasonOverviewPanel.tsx`**

This is one new component that contains:
1. The performance chart (Section A)
2. The 5 pipeline stage cards (Section B)

It reads from `useSampleStore`, `useFabricStore`, `useCapsuleStore`, and `useDesignStore` directly — no props needed from the parent except `onCollectionClick` if the user wants to drill in.

---

## Files to Modify

**`src/pages/Index.tsx`**
- Import and render `<SeasonOverviewPanel />` at the very top of the dashboard section, before the role-specific panels
- No other changes needed here

**`src/components/dashboard/DirectorDashboardPanel.tsx`**
- Rename "Collection RAG Status" heading → **"Collection Health"**
- Update status badge labels: "On Track", "Needs Attention", "Behind Schedule"
- No logic changes

---

## What Does NOT Change

- The role-specific panels (Director KPI cards, Design Lead pipeline, Sampling floor queues) stay exactly where they are — just moved below the new chart
- The sample search dialog (Ctrl+K) stays
- The Heat Map button stays
- The Planning page (`/seasonal-planning`) is not touched — it remains independent local state for now

---

## Implementation Order

1. Create `SeasonOverviewPanel.tsx` with the performance chart and 5 pipeline cards
2. Add it to `Index.tsx` above the role panels
3. Update label text in `DirectorDashboardPanel.tsx` (rename RAG → Collection Health)
