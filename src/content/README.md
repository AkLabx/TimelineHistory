# Content Management Guide

This project uses a modular JSON file system to manage content. This makes it easy to add new Kings, Dynasties, or Eras without touching the application code.

## Folder Structure

- `src/content/parts/` - Contains the main dashboard configuration.
- `src/content/dynasties/` - Contains details for each Era or Dynasty.
- `src/content/kings/` - Contains profiles for individual Kings or Figures.

---

## How to Add Content

### 1. Adding a New King or Figure
Create a new JSON file in `src/content/kings/`.
**Filename:** `king-id.json` (e.g., `ashoka.json`)

**Format:**
```json
{
  "id": "ashoka",  // MUST match the filename/reference ID
  "type": "king-details enhanced-profile",
  "summary": {
    "title": "Ashoka the Great",
    "reign": "c. 268–232 BCE"
  },
  "imageUrl": "images/king_ashoka.jpg",
  "content": "<div class='royal-legacy-card'> ... HTML Content ... </div>"
}
```

### 2. Adding a New Dynasty
Create a new JSON file in `src/content/dynasties/`.
**Filename:** `dynasty-id.json` (e.g., `maurya.json`)

**Format:**
```json
{
  "id": "maurya",
  "title": "Part III: Mauryan Empire",
  "items": [
    {
      "type": "event-details",
      "summary": { "title": "Introduction" },
      "content": "..."
    },
    {
      "id": "maurya-dynasty-details",
      "type": "dynasty-details",
      "summary": {
          "title": "Maurya Dynasty",
          "period": "322-185 BCE",
          "founder": "Chandragupta"
      },
      "subItems": ["chandragupta-maurya", "bindusara", "ashoka"]
      // ^ These IDs must match the 'id' (or filename) in the kings/ folder
    }
  ]
}
```

### 3. Adding a New Part (Era) to the Dashboard
1. Open `src/content/parts/dashboard.json`.
2. Add a new object to the `timelineCards` array:
```json
{
  "target": "new-era-id", // This MUST match the ID of a file in content/dynasties/
  "title": "New Era Title",
  "subtitle": "Subtitle",
  "period": "1000-1200 CE",
  "imageUrl": "images/era_new.jpg"
}
```
3. Create the corresponding file: `src/content/dynasties/new-era-id.json`.

---

## Handling Complex Navigation (Nested Dynasties)

Example: **Delhi Sultanate** contains 5 sub-dynasties.

1. **The Parent Era:** `src/content/dynasties/sultanate.json`
   Inside its `items` array, it has a Link Card:
   ```json
   {
     "id": "delhi-sultanate-intro",
     "type": "timeline-link-card",
     "target": "sultanate-dynasties",
     "summary": { "title": "Dynasties of Delhi Sultanate" }
   }
   ```

2. **The Child Group:** `src/content/dynasties/sultanate-dynasties.json`
   This file contains the actual list of dynasties (Slave, Khilji, Tughlaq...).
   ```json
   {
     "id": "sultanate-dynasties", // Matches the 'target' above
     "parent": "sultanate",       // Points back to parent for 'Back' button
     "title": "Dynasties of the Delhi Sultanate",
     "items": [ ... ]
   }
   ```

**Key Rule:** The `target` in a link card must exactly match the `id` (or filename) of another JSON file in the `dynasties` folder.
