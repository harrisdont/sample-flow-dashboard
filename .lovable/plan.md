

# Move Add New Menu to Global Navigation

## What's Happening Now

The `AddNewMenu` component already uses the exact same form components (`NewDesignForm`, `NewSilhouetteForm`, `NewCollectionForm`) that the Design Hub uses. They are identical functions — not duplicates. The only issue is placement: the Add New button currently only appears on the home dashboard (`Index.tsx`) as a child of `MainNav`, instead of being globally accessible.

## The Fix

Move the `AddNewMenu` from `Index.tsx` into `MainNav.tsx` itself, so it renders on every page automatically.

### Files to Modify

**`src/components/MainNav.tsx`**
- Import `AddNewMenu`
- Render `<AddNewMenu />` inside the nav bar, before the `{children}` slot (right-aligned area)

**`src/pages/Index.tsx`**
- Remove the `<AddNewMenu />` from the `MainNav` children slot
- Remove the `AddNewMenu` import

**`src/pages/DesignHub.tsx`**
- Remove the standalone "New Design" button (line 153–156) since the global Add New menu already includes "New Design" plus the other two options
- Remove the `isNewDesignOpen` state and the `<NewDesignForm>` rendered at the bottom of the file (the global menu handles it)
- Keep the silhouette and fabric induction forms since those are triggered from within tabs, not from the header button

### Result

Every page gets the same Add New dropdown (New Design, New Silhouette, New Collection) in the top nav bar. The Design Hub loses its redundant standalone "New Design" button. All three actions use the same form components everywhere.

