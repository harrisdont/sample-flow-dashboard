

# Integrate Decoration Processes into Existing Dashboards

## Overview

Instead of creating a new "Decoration Processes" tab, this plan enriches the existing Design Hub and Sampling Floor views so that every sample card -- wherever it appears -- clearly shows: (1) its current stage, (2) the date it entered that stage, (3) the calculated deadline for that stage based on lead times and the collection submission date.

The decoration workflow (motif development, punching, embroidery techniques, approval gate) is modeled as expanded process stages and integrated directly into the existing Floor Overview, Stage Management, Heat Map, and EJob Card.

## Changes

### 1. Expand ProcessStage and Sample types (`src/types/sample.ts`)

- Add new `ProcessStage` values: `'motif-assignment'`, `'motif-in-progress'`, `'motif-review'`, `'multihead-punching'`, `'pinning'`, `'stencil-transfer'`, `'hand-embroidery'`, `'screen-print-execution'`, `'hand-block-printing'`, `'decoration-approval'`
- Add fields to the `Sample` interface:
  - `stageEntryDate: string` -- when the sample entered its current stage
  - `stageDeadline: string` -- calculated deadline for the current stage
  - `decorationTechnique?: 'multihead' | 'hand-embroidery' | 'screen-print' | 'hand-block-print'`
- Update the `processes` array items to include `entryDate: string` alongside the existing `targetDate`

### 2. Create Embroidery Workflow Engine (`src/lib/embroideryWorkflow.ts`)

Defines routing paths per technique:
- **Multihead**: motif-assignment -> motif-in-progress -> motif-review -> multihead-punching -> multihead -> decoration-approval -> semi-stitching
- **Hand Embroidery**: motif-assignment -> motif-in-progress -> motif-review -> pinning -> stencil-transfer -> hand-embroidery -> decoration-approval -> semi-stitching
- **Screen Print**: motif-assignment -> motif-in-progress -> motif-review -> screen-print-execution -> decoration-approval -> semi-stitching
- **Hand Block Print**: motif-assignment -> motif-in-progress -> motif-review -> hand-block-printing (vendor) -> decoration-approval -> semi-stitching

Exports `getNextStage()`, `getRoutingPath()`, and `canTransition()` functions.

### 3. Update Lead Time Calculator (`src/lib/leadTimeCalculator.ts`)

Add stage duration mappings for new sub-stages:
- motif-assignment: 1d, motif-in-progress: 3d, motif-review: 1d, multihead-punching: 2d, pinning: 1d, stencil-transfer: 1d, hand-embroidery: 5d, screen-print-execution: 2d, hand-block-printing: 7d, decoration-approval: 1d

Add a new helper function `calculateStageDeadline(collectionSubmissionDate, stage, routingPath)` that backwards-calculates the deadline for each stage based on the collection's submission date and the lead time of all subsequent stages.

### 4. Update Mock Data (`src/data/mockData.ts`)

- Add `stageEntryDate`, `stageDeadline`, and `decorationTechnique` to each mock sample
- Add more samples covering multihead, hand embroidery, screen print, and hand block print techniques so all technique paths are represented
- Add `entryDate` to each process in the `processes` array

### 5. Create Sample Stage Info Card (`src/components/sampling/SampleStageCard.tsx`)

A reusable compact card for displaying a sample anywhere in the app. Always shows:
- Sample number and collection name
- **Current Stage** (bold, prominent label)
- **Stage Entry Date** (when it arrived at this stage)
- **Stage Deadline** (calculated from lead times + collection submission date)
- **Days remaining / overdue** indicator with color coding (green = on track, amber = due soon, red = overdue)
- Decoration technique badge (if applicable)
- A small progress indicator showing position in the full routing path

### 6. Update Sampling Floor Dashboard (`src/pages/SamplingFloorDashboard.tsx`)

**Floor Overview tab:**
- Add new stage cards for the decoration sub-stages (motif dev, punching, pinning, stencil, embroidery execution, decoration approval) grouped under a "Decoration Processes" section header
- Each card shows queue count, utilization, and deadline pressure

**Stage Management tab:**
- Add decoration stages to the stage filter buttons
- Replace the current minimal sample rows with `SampleStageCard` components so each sample shows entry date, deadline, and days remaining
- Add an "Advance Stage" button per sample that uses the workflow engine to determine the valid next stage

**Operators tab:**
- Add operators for: Motif Developer, Punching Operator, Screen Printer, Block Print Coordinator

**Sidebar - Overdue Samples:**
- Replace simple overdue display with `SampleStageCard` so stage and deadline info is always visible

### 7. Update Design Hub (`src/pages/DesignHub.tsx`)

**Collections tab:**
- Under each collection card, add a "Samples in Decoration" summary showing count of samples currently in decoration stages with a breakdown by technique

**Task Board tab:**
- When a task relates to a sample (motif assignment, approval review), show the `SampleStageCard` inline so the designer can see the sample's current stage, entry date, and deadline without navigating away

### 8. Update Heat Map (`src/components/SamplingBoard.tsx`)

- Add the new decoration sub-stages to the `stages` array so samples in motif dev, punching, embroidery execution, etc. appear as columns on the heat map
- Group them visually with a "Decoration" section header
- Each sample tile already shows target date; enhance it to also show **stage entry date** and **stage-specific deadline**

### 9. Update EJob Card (`src/components/EJobCard.tsx`)

- Add new stages to `allStages` array
- In the "Process Timeline" section, show **entry date** alongside target date for each completed and current stage
- Highlight the current stage row with a distinct background
- Add the decoration technique badge to the header
- Show the stage-specific deadline prominently next to the current stage

### 10. Update Bottleneck Detector (`src/lib/bottleneckDetector.ts`)

- Add the new decoration stages to the `StageConfig` interface and detection logic so bottlenecks in motif development or embroidery execution are detected and reported

## Technical Details

### Stage Deadline Calculation Logic

```text
For a sample with collection submission date = March 15:
1. Get the sample's full routing path (e.g., for multihead: motif-assignment -> ... -> complete-stitching -> hand-finishes)
2. Starting from submission date, walk backwards through stages summing lead times
3. Each stage gets a deadline = submission date - sum of all subsequent stage durations
4. Example: if hand-finishes=2d, complete-stitching=4d, semi-stitching=4d, decoration-approval=1d, multihead=3d
   then multihead deadline = March 15 - (2+4+4+1) = March 4
```

### Key Display Rule

Every sample card in the application -- whether on the Heat Map, Floor Overview, Stage Management, EJob Card, or Design Hub -- will consistently show three pieces of information:
1. Current stage name
2. Date entered current stage
3. Deadline for current stage (with days remaining/overdue)

### Files Modified
1. `src/types/sample.ts` -- Add ProcessStage values and Sample fields
2. `src/lib/embroideryWorkflow.ts` -- New: workflow routing engine
3. `src/lib/leadTimeCalculator.ts` -- Add durations and deadline calculator
4. `src/data/mockData.ts` -- Expand mock data with new fields and samples
5. `src/components/sampling/SampleStageCard.tsx` -- New: reusable stage info card
6. `src/pages/SamplingFloorDashboard.tsx` -- Add decoration stages to existing tabs
7. `src/pages/DesignHub.tsx` -- Add sample tracking to collections and tasks
8. `src/components/SamplingBoard.tsx` -- Add decoration stages to heat map
9. `src/components/EJobCard.tsx` -- Add stages and entry dates to timeline
10. `src/lib/bottleneckDetector.ts` -- Add decoration stages to detection

