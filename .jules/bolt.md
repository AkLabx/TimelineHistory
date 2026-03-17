## 2024-05-22 - [Data Loading Patterns]
**Learning:** The project uses `import.meta.glob({ eager: true })` extensively in `contentLoader.ts`. This causes all content (JSON) to be bundled into the main JS chunk, leading to a large bundle size (868kB).
**Action:** For future large-scale optimizations, this should be refactored to use async imports or lazy loading, though it requires significant architectural changes to handling sync data in components.

## 2024-05-23 - [Code-splitting Modals and Detailed Views]
**Learning:** The application was bundling all React components into a single large JS chunk. Modals (like Search, Compare) and deep-dive views (EraDetail, FigureDetail) don't need to be loaded on the initial render of the Dashboard.
**Action:** Implemented React.lazy and Suspense in `App.tsx` to dynamically import components like `GlobalChat`, `SamvadChat`, `CompareModal`, `SearchModal`, and the detail views. This successfully split the single 1.38MB bundle into a 928KB main bundle and several smaller chunks, improving the initial load time significantly.
