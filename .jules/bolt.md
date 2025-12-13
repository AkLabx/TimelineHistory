## 2024-05-22 - [Data Loading Patterns]
**Learning:** The project uses `import.meta.glob({ eager: true })` extensively in `contentLoader.ts`. This causes all content (JSON) to be bundled into the main JS chunk, leading to a large bundle size (868kB).
**Action:** For future large-scale optimizations, this should be refactored to use async imports or lazy loading, though it requires significant architectural changes to handling sync data in components.
