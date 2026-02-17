

# Dashboard Efficiency Upgrade

## What Changes

The Dashboard (landing page at `/`) currently displays hardcoded mock data that is disconnected from all other modules. This plan rewires it to read live data from the existing Zustand stores, computes KPIs dynamically, and replaces the stub "Scan Sample" button with a sample search/lookup.

## 1. Wire KPI Cards to Live Store Data

Replace the static `mockMetrics` object with computed values derived from `useSampleStore` and `useCapsuleStore`:

- **Total Samples**: `useSampleStore.samples.length`
- **Due Today**: Count samples where `stageDeadline === today`
- **Overdue**: Count samples where `stageDeadline < today` and `approvalStatus === 'pending'`
- **Bottleneck Alert**: Run `detectBottlenecks()` from the existing bottleneck engine against the live sample data to surface the most critical alert dynamically

## 2. Wire Active Collections to Live Capsule Store

Replace the static `mockCollections` array. For each capsule collection from `useCapsuleStore`:

- Compute `totalSamples` and `samplesCompleted` by querying `useSampleStore.getSamplesByCollection(collectionName)`
- Derive `status` from the furthest-along sample's current stage
- Derive `delay` by checking if any sample in the collection is overdue
- Derive `lastUpdate` from the most recent `stageEntryDate` across all samples in that collection
- Derive `location` from the current stage of the most recently updated sample

This means the Active Collections list reflects actual sample pipeline state, not static display data.

## 3. Replace "Scan Sample" with Sample Search

Remove the stub that always loads `mockSamples[0]`. Replace with:

- A search input (sample number or designer name) that filters `useSampleStore.samples`
- Clicking a result opens its EJob Card with the store-connected approve/reject/advance actions
- Keep the "Scan Sample" button but wire it to open the search dialog instead of hardcoding a sample

## 4. Wire Collection Detail View to Live Data

The collection-detail view currently reads from the static `Collection` type. Update it to:

- Read from the capsule store for collection metadata (name, target date)
- Query sample store for all samples in that collection
- Show a list of samples with their current stage, entry date, and deadline (reusing the existing `SampleStageCard` component)
- Allow clicking any sample to open its EJob Card

## 5. Wire EJob Card Launch to Store

The Dashboard currently has local `handleApprove`/`handleReject` that only fire toasts. Remove these and pass the sample's `id` to `EJobCard`, which already uses `useSampleStore` internally for approve/reject/redo actions.

## Technical Details

### Files Modified

1. **`src/pages/Index.tsx`** -- Remove all imports of `mockCollections`, `mockSamples`, `mockMetrics`. Import `useSampleStore`, `useCapsuleStore`, `detectBottlenecks`. Compute metrics inline. Add sample search dialog. Rewire collection-detail to use capsule + sample stores. Remove local approve/reject handlers (EJobCard handles this internally).

2. **`src/components/LiveDashboard.tsx`** -- No interface changes needed; it already accepts `collections`, `metrics`, and callbacks as props. The parent (`Index.tsx`) will pass computed data instead of mocks.

3. **`src/data/mockData.ts`** -- Keep the file (sampleStore still seeds from `mockSamples`), but `Index.tsx` will no longer import `mockCollections` or `mockMetrics`.

### Computed Metrics Logic (in Index.tsx)

```text
const samples = useSampleStore(state => state.samples);
const capsules = useCapsuleStore(state => state.capsules);
const today = format(new Date(), 'yyyy-MM-dd');

const metrics = {
  totalSamples: samples.length,
  dueToday: samples.filter(s => s.stageDeadline === today).length,
  overdue: samples.filter(s => s.stageDeadline < today && s.approvalStatus === 'pending').length,
  bottleneckAlert: detectBottlenecks(...).bottlenecks[0]?.stageName || 'No bottlenecks'
};

const collections = Object.values(capsules).map(capsule => {
  const collSamples = samples.filter(s => s.collectionName === capsule.collectionName);
  return {
    name: capsule.collectionName,
    slot: capsule.lineId,
    totalSamples: collSamples.length,
    samplesCompleted: collSamples.filter(s => s.approvalStatus === 'approved').length,
    // ... derived status, delay, location, lastUpdate
  };
});
```

### Sample Search Component

A simple `CommandDialog` (already available via the installed `cmdk` package) that:
- Opens on button click or Ctrl+K
- Searches samples by number, designer name, or collection name
- Shows matching results with current stage badge
- Clicking a result navigates to the EJob Card view

