# ⚡ Pokédex Web Application — Kanto Edition

![Pokédex Hero Banner](https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png)

A high-performance, responsive, and visually stunning **Pokédex Web Application** built with modern **vanilla HTML5, CSS3, and ES6+ JavaScript**. It features an animated Fire Hero section, official high-resolution artwork, audio cry playback, glassmorphic UI design, instant multi-field search & sorting, and local storage favorites management.

---

## 🔥 Key Features

- **🔥 Animated Fire Hero Section**:
  - Dynamic fire aura animation (`@keyframes flamePulse`) with levitating Charizard official artwork.
  - Interactive call-to-action button that smoothly glides down to the index catalog.
  - "Inspect Random Pokémon" dice button that randomly picks and opens any Pokémon's detail view.

- **🎨 Modern Glassmorphic Design System**:
  - Dark mode aesthetics with glassmorphic cards (`backdrop-filter: blur()`).
  - WCAG contrast-tested color system for all 18 elemental Pokémon types.
  - Shimmering skeleton screen loading animations while fetching dataset.

- **🖼️ High-Definition Official Artwork**:
  - Displays official Pokémon artwork (`sprites.other['official-artwork']`) for high visual quality across mobile and desktop displays.

- **🔊 Live Audio Cry Playback**:
  - Listen to authentic Pokémon cries directly inside the details modal via PokéAPI audio files (`cries.latest`).

- **❤️ Favorites Management & Persistence**:
  - Heart toggle button on every card with persistent state saved to browser `localStorage`.
  - Dedicated "❤️ Favorites" filter button to view only favorited Pokémon with live count badge.

- **🔍 Advanced Search & Multi-Criteria Sorting**:
  - Filter by Name or `#ID`.
  - Sort by ID (Ascending/Descending), Name, Highest Attack, Total Base Stats, Height, and Weight.

- **⌨️ Keyboard Shortcuts**:
  - `/` — Focus search input box instantly.
  - `ESC` — Close details modal.
  - `Left Arrow` / `Right Arrow` — Navigate previous/next Pokémon inside the modal.

---

## 📁 Project Directory Structure

```text
pokemon-pokedex-api-app/
├── index.html          # Main HTML5 entry point & semantic markup
├── css/
│   └── styles.css      # Design system, glassmorphic UI tokens & fire animations
├── js/
│   └── script.js       # Application state management & PokéAPI integration
└── README.md           # Project documentation
```

---

## 🚀 Quick Start & Local Setup

No external node dependencies or build tools required. You can serve the static files directly:

### Method 1: Python HTTP Server (Recommended)
```bash
# Clone the repository
git clone https://github.com/Bilyz26/pokemon-pokedex-api-app.git
cd pokemon-pokedex-api-app

# Run local HTTP server on port 8080
python -m http.server 8080
```
Then open **`http://localhost:8080`** in your browser.

### Method 2: VS Code Live Server
Open the project folder in VS Code and click **"Go Live"** via the Live Server extension.

---

## 🛠️ Technology Stack

- **HTML5**: Semantic elements, ARIA attributes, and accessible structure.
- **CSS3**: Custom CSS Variables, Flexbox/Grid, Glassmorphic effects, and Keyframe Animations.
- **JavaScript (ES6+)**: Async/Await fetch API, Centralized `appState`, LocalStorage API, and Event Delegation.
- **API**: Powered by [PokéAPI v2 REST Services](https://pokeapi.co/).

---

## 📜 License & Credits

- Artwork and Pokémon data provided by **[PokéAPI](https://pokeapi.co/)**.
- Fonts by **[Google Fonts (Outfit & Inter)](https://fonts.google.com/)**.
- Icons by **[Font Awesome 6](https://fontawesome.com/)**.
