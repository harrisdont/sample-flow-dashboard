
# Beta Test Report: End-to-End Product Journey Audit

## Executive Summary

After a thorough review of the entire codebase, here is where each step of the product journey stands and what needs to be fixed to create a fully connected, trackable pipeline.

---

## Journey Step 1: Planning (Seasonal Collection Planning)

**Status: Partially Connected**

- **Working:** Category planner can set total design count, allocate by launch, distribute by line, and set category breakdowns (1pc/2pc/3pc) with MOQs per category per line.
- **Working:** Capsule Collection Plan Form creates collections in the capsule store, which the Design Hub reads.
- **Gap:** Planning allocations (line-level design counts, launch percentages) are local state only -- they do NOT write to the capsule store or any shared state. The line-level design targets exist only on the Planning page and are lost on navigation. They need to persist so downstream modules can reference how many designs each line was allocated.

---

## Journey Step 2: Collection Plans in Design Hub

**Status: Working but Limited**

- **Working:** Design Hub reads capsule store and shows "My Collections" filtered by the current user's assigned lines. Shows design progress (submitted vs. planned) with category breakdowns.
- **Working:** "New Design" button opens the multi-step wizard linked to actual collections.
- **Gap:** Collections tab is read-only -- team leads cannot assign a collection or individual design tasks to a specific designer from this view. The task system exists (useTaskStore) but there is no UI to create/assign tasks from the collection cards.

---

## Journey Step 3: Sourcing Receives Fabric Orders

**Status: Partially Connected**

- **Working:** When a capsule collection is saved, pending-induction fabric entries are auto-generated in the fabric store for each required component.
- **Working:** Sourcing Dashboard shows fabric pipeline, treatment tracking, and procurement queue.
- **Gap:** The "Review" button in the procurement queue is a stub (no onClick handler). Sourcing cannot action fabric requests.
- **Gap:** Fabric status transitions (advancing from pending to in-treatment to inducted) require manually opening the Fabric Induction form -- there is no quick-action button on the Sourcing dashboard to advance status.

---

## Journey Step 4: Departmental Workload Alignment

**Status: Partially Working**

- **Working:** Director Dashboard shows department health (design/sourcing/sampling workload counts) and collection status overview with RAG indicators.
- **Working:** Collections Summary View shows all collections with backwards-calculated milestones, fabric/sampling/production deadlines.
- **Gap:** Director Dashboard collection cards are not clickable -- they don't drill down to a detailed view.
- **Gap:** Predictive workload forecasting (what department gets what workload in what time period) does not exist. Only current-state counts are shown.

---

## Journey Step 5: Design Creation Flow in Design Hub

**Status: Mostly Working**

- **Working:** 4-step wizard: (1) Select collection + category, (2) Configure components with silhouettes + fabrics, (3) Trims/closures/lining, (4) Techpack canvas + PDF export.
- **Working:** Silhouette selection from approved silhouettes, with inline cost calculation (fabric cost + stitching = aggregate, then 3.2x markup for predicted selling price).
- **Working:** Fabric selection filters to only inducted fabrics for the selected collection.
- **Working:** Neckline, sleeve, and seam finish customization dropdowns exist in the form.
- **Gap:** Silhouette and Fabric induction are separate top-level nav items (/sampling for silhouettes, /fabric-induction for fabrics). Per the user's request, these should be accessible from within the Design Hub, not as separate navigation destinations.
- **Gap:** Auto-applied default seam finishes based on line (formals = front seams, others = overlocked) are NOT implemented -- the seam finish is always a manual selection with no defaults.
- **Gap:** Size spec sheet generation after silhouette approval is not implemented.
- **Gap:** The "fabric inbox" concept (showing which fabrics are in-house, which are pending) does not exist in the Design Hub. Designers see only inducted fabrics in the design form dropdown but have no visibility into pending or in-transit fabrics.
- **Gap:** Embroidery/decoration technique assignment during design creation exists (process checkboxes) but does NOT connect to the decoration workflow engine (embroideryWorkflow.ts). Selecting "multihead" in the design form doesn't create a decoration task or route the sample through the motif workflow.

---

## Journey Step 6: Sample Tracking Through Production

**Status: Mostly Working (with mock data)**

- **Working:** Heat Map (SamplingBoard) shows samples across production + decoration stages with entry dates, stage deadlines, and days remaining.
- **Working:** EJob Card shows full process timeline with entry dates, current stage deadline, and decoration technique badge.
- **Working:** Sampling Floor Dashboard has Floor Overview (production + decoration stage cards), Stage Management with SampleStageCard components, and "Advance Stage" buttons.
- **Gap:** All sample data is hardcoded mock data. Designs created via the NewDesignForm do NOT generate Sample records. There is no bridge between a submitted design and a tracked sample in the production pipeline.
- **Gap:** The "Advance Stage" button logs to console but doesn't actually update the sample's stage (mockSamples is a static array, not a Zustand store).

---

## Journey Step 7: Designer Review and Approval

**Status: Partially Working**

- **Working:** EJob Card has Approve/Reject buttons that trigger toast notifications.
- **Gap:** Approve/Reject actions do NOT update any store -- the sample status remains unchanged after clicking.
- **Gap:** "Ready for Review" panel with costing sheet does not exist. The costing calculation exists in the NewDesignForm but is not carried forward to a review stage.
- **Gap:** No "modification request" flow -- only approve or reject, no "redo with changes."

---

## Journey Step 8: Production Hub

**Status: Not Implemented**

- There is no dedicated Production Hub. The Sampling Floor tracks samples through sampling stages only. Once a sample is approved, there is no view showing production-level tracking (cutting, bulk embroidery, finishing, QC, dispatch).

---

## Journey Step 9: Efficiency & Predictive Analytics

**Status: Not Implemented**

- No efficiency ratio summary exists.
- No predictive analysis for on-time vs. delayed collections.
- No self-learning from delays or suggested solutions.
- Bottleneck detection exists but only for current-state capacity analysis.

---

## Critical Navigation Issues

Per the user's request, Silhouette induction and Fabric induction should be accessible from within the Design Hub, not as separate top-level nav items. Currently:
- `/sampling` (labeled "Silhouettes") is a separate page
- `/fabric-induction` (labeled "Fabrics") is a separate page

These need to be embedded as tabs or sub-sections within the Design Hub.

---

## Recommended Fix Priority (Implementation Plan)

### Phase 1: Connect the Data Pipeline (Critical)
1. **Create a Sample store** (Zustand) so samples are mutable and can be created from designs, advanced through stages, and approved/rejected with persistent state changes.
2. **Bridge Design to Sample**: When a design is submitted, auto-generate a Sample record with the correct routing path based on selected processes/decoration technique.
3. **Wire Approve/Reject**: Make EJob Card approve/reject actually update the sample store.
4. **Wire Stage Advancement**: Make the "Advance Stage" button in Sampling Floor actually update the sample's current stage.

### Phase 2: Consolidate Navigation
5. **Move Silhouette Library and Fabric Induction into Design Hub** as additional tabs, removing them from the main nav bar.
6. **Add a Fabric Inbox** to the Design Hub showing fabric status (in-house / pending / in-transit) per collection.

### Phase 3: Complete Missing Workflows
7. **Wire the Sourcing "Review" button** to open the fabric induction form for that specific fabric.
8. **Add default seam finish logic** based on line (formals = front seams, others = overlocked).
9. **Add "Ready for Review" panel** with the costing sheet pulled from the design's cost calculation.
10. **Add task creation UI** in Design Hub to assign designs/collections to team members.

### Phase 4: Production & Analytics
11. **Create Production Hub** page for post-approval tracking through cutting, embroidery, finishing, QC, dispatch.
12. **Add efficiency reporting** -- sampling-to-production conversion ratios, on-time rates.
13. **Add predictive analysis** -- flag at-risk collections based on current pipeline velocity vs. deadlines.

### Phase 5: Polish
14. **Persist planning allocations** to the store so they are available downstream.
15. **Make Director Dashboard collection cards clickable** with drill-down navigation.
16. **Add in-app tutorial** for first-time users.

---

## Technical Details

### New Files Required
- `src/data/sampleStore.ts` -- Zustand store for mutable sample records
- `src/pages/ProductionHub.tsx` -- Production tracking page
- `src/components/FabricInbox.tsx` -- Fabric status inbox for designers
- `src/components/ReadyForReview.tsx` -- Review panel with costing

### Files to Modify
- `src/components/MainNav.tsx` -- Remove Silhouettes and Fabrics from top nav
- `src/pages/DesignHub.tsx` -- Add Silhouettes, Fabrics, and Fabric Inbox tabs
- `src/components/NewDesignForm.tsx` -- Connect design submission to sample store, add default seam finish logic
- `src/components/EJobCard.tsx` -- Wire approve/reject to sample store
- `src/pages/SamplingFloorDashboard.tsx` -- Wire "Advance Stage" to sample store
- `src/pages/SourcingDashboard.tsx` -- Wire "Review" button
- `src/pages/DirectorDashboard.tsx` -- Make collection cards clickable
- `src/App.tsx` -- Add ProductionHub route, remove standalone silhouette/fabric routes

This is a large scope. I recommend implementing it in phases, starting with Phase 1 (connecting the data pipeline) as it is the foundation everything else depends on.
