# Timeline History Viewer

An interactive, immersive journey through Indian History ("Bharat Itihas"). This application allows users to explore historical eras, dynasties, and key figures through a rich, visual timeline and detailed profiles.

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Features

*   **Interactive Dashboard**: A visual grid of major historical eras from Ancient Origins to the Mughal Empire.
*   **Timeline Visualization**: Scrollable horizontal timeline visualizing the duration and overlap of different dynasties.
*   **Deep Dive Details**:
    *   **Era View**: Detailed breakdown of dynasties and events within a specific period.
    *   **Figure Profiles**: Comprehensive profiles for kings and historical figures, including reign dates, achievements, and administration details.
*   **Smart Search**: A powerful search functionality to quickly find eras, dynasties, figures, or glossary terms.
*   **Comparison Tool**: Select and compare two historical figures side-by-side to analyze their reigns and contributions.
*   **AI Assistant (Aalok GPT)**: An integrated chatbot powered by Google Gemini to answer historical queries with context awareness. It supports text, image, and voice interactions.
*   **Voice Interaction (Samvad)**: A dedicated voice-enabled interface to "converse" with a simulated historical persona.
*   **Glossary**: Interactive glossary terms within content that provide instant definitions.

## Tech Stack

*   **Framework**: React (v18)
*   **Build Tool**: Vite
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Charts**: Recharts
*   **AI Integration**: Google GenAI SDK (`@google/genai`)

## Project Structure

*   `src/components/`: Reusable React components (Dashboard, Timeline, Modals, etc.).
*   `src/data/`: Static data files containing historical content (JSON-like structures).
*   `src/hooks/`: Custom React hooks for logic (Navigation, Search).
*   `src/types.ts`: TypeScript interfaces and type definitions.
*   `src/utils.ts`: Helper utility functions.

## Setup and Installation

**Prerequisites:**  Node.js (v16+)

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd timeline-history
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    *   Create a `.env.local` file in the root directory.
    *   Add your Google Gemini API key:
        ```
        GEMINI_API_KEY=your_api_key_here
        ```
        *Note: The application uses `define` in `vite.config.ts` to expose this key as `process.env.API_KEY` for the client-side demo. Ensure you secure your key for production deployments.*

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173/`).

## Usage Guide

*   **Navigation**: Click on an Era card on the Dashboard to enter the timeline view. Click on specific dynasties or figures to view details. Use the breadcrumbs or Home button to return.
*   **Search**: Click the search icon in the navbar or press `Ctrl + K` to open the search modal.
*   **Compare**: Use the "Compare" button in the navbar to open the comparison selection tool.
*   **AI Chat**: Click the floating action button (Gemini icon) in the bottom right to open the global AI assistant.
*   **Samvad**: On a specific figure's profile, click the "Samvad" button to start a voice conversation simulation.

## Deployment

The project is configured for deployment to GitHub Pages.

1.  **Build the project:**
    ```bash
    npm run build
    ```
2.  The build artifacts will be in the `dist` directory.

## License

[License Name]
