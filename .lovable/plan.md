
# Season Performance Chart — Sampling Sub-Stage Breakdown

## What Changes

The chart currently shows 4 grouped bars: Design, Sourcing, Sampling, Decoration. The "Decoration" bar is removed since decoration is not a separate department — it happens within the sampling floor. Instead, the Sampling process is expanded so each internal stage gets its own bar, giving a detailed workload view across the entire production floor.

## New Chart Structure

The chart becomes a **per-stage breakdown** across the full sampling pipeline, grouped into two visual sections:

**Section 1 — Design & Sourcing** (kept as-is, these ARE separate departments):
- Design
- Sourcing

**Section 2 — Sampling Floor** (each stage gets its own bar):
| Bar Label | Stages Covered |
|---|---|
| Pattern Making | `pattern` |
| Motif Design | `motif-assignment`, `motif-in-progress`, `motif-review` |
| Punching | `multihead-punching`, `punching` |
| Stitching | `semi-stitching`, `complete-stitching` |
| Multihead | `multihead` |
| Pakki | `pakki` |
| Ari / Dori | `ari-dori` |
| Screen Print | `screen-print`, `screen-print-execution`, `stencil-transfer` |
| Hand Work | `hand-embroidery`, `pinning`, `cottage-work`, `adda`, `hand-block-printing` |
| Finishing | `hand-finishes`, `decoration-approval` |

Each bar still shows two segments: **On Time** (green) and **Delayed** (red), using the same logic already in place — a process is on time if it was approved before its `targetDate`, and delayed if it missed or is still pending past its `targetDate`.

## What the Chart Looks Like

```text
On Time  Delayed
  ▇▇▇▇    ▇▇
  ▇▇▇     ▇▇▇
  ▇▇▇▇▇   ▇
  ▇▇▇▇    ▇▇▇▇
  ...
Design  Sourcing  Pattern  Motif  Punching  Stitching  Multihead  Pakki  Ari/Dori  Screen  Hand  Finishing
←─ Dept ──────→ ←──────────────────── Sampling Floor Stages ──────────────────────────────────────────→
```

To make this readable, the chart switches to **horizontal bars** (a `BarChart` with `layout="vertical"`) — this is the clearest way to show 12 bars with long stage labels without the labels overlapping.

## Changes to the Tooltip

The tooltip will keep showing "On Time: X / Delayed: Y / Z% on time" — no change needed there since it already reads `onTime` and `delayed` keys.

## What Does NOT Change

- The 5-stage Pipeline Overview cards below the chart stay exactly the same
- The chart's colour scheme (green = on time, red = delayed) stays the same
- The Sourcing and Design bars remain
- The `SeasonOverviewPanel.tsx` file structure stays the same — only the `chartData` array and chart orientation change

## Technical Implementation

Only `src/components/dashboard/SeasonOverviewPanel.tsx` needs to change:

1. **Remove** `DECORATION_STAGES` constant
2. **Replace** the single `SAMPLING_STAGES` constant with a named map of sub-stage groups:
   ```ts
   const SAMPLING_STAGE_GROUPS = [
     { label: 'Pattern Making', stages: ['pattern'] },
     { label: 'Motif Design',   stages: ['motif-assignment','motif-in-progress','motif-review','motif'] },
     { label: 'Punching',       stages: ['multihead-punching','punching'] },
     { label: 'Stitching',      stages: ['semi-stitching','complete-stitching'] },
     { label: 'Multihead',      stages: ['multihead'] },
     { label: 'Pakki',          stages: ['pakki'] },
     { label: 'Ari / Dori',     stages: ['ari-dori'] },
     { label: 'Screen Print',   stages: ['screen-print','screen-print-execution','stencil-transfer'] },
     { label: 'Hand Work',      stages: ['hand-embroidery','pinning','cottage-work','adda','hand-block-printing'] },
     { label: 'Finishing',      stages: ['hand-finishes','decoration-approval'] },
   ];
   ```
3. **Update** `chartData` to build one entry per group (plus Design and Sourcing at the top)
4. **Switch** `BarChart` to `layout="vertical"` with `XAxis` and `YAxis` swapped so stage names display as horizontal labels on the left
5. **Increase** the chart height to ~380px to comfortably display all 12 bars
6. The `ResponsiveContainer`, `CartesianGrid`, `Tooltip`, and both `Bar` elements remain unchanged

## File to Modify

- **`src/components/dashboard/SeasonOverviewPanel.tsx`** — chart data array, stage group constants, and chart orientation only
