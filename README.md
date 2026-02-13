# Snake Game

A polished, browser-based implementation of the classic Snake game with clean state management and a lightweight UI.

## Project Overview

This project focuses on core gameplay quality:
- Deterministic game loop
- Clear separation of game logic and rendering
- Responsive controls (keyboard + on-screen)
- Persistent leaderboard for the last 10 completed games

It is intentionally dependency-free and built to demonstrate strong frontend fundamentals.

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 |
| Application Logic | Vanilla JavaScript (ES Modules) |
| Persistence | Browser `localStorage` |
| Serving Locally | Python static server (`python3 -m http.server`) |

## Highlights

- Classic Snake mechanics: movement, growth, food spawning, collision, restart
- Leaderboard page with player placeholders and ranking
- Mobile-friendly on-screen direction controls
- Minimal architecture that is easy to read, test, and extend

## Project Structure

```text
/Users/simontesfatsion/Desktop/codex_experiment
├── index.html      # App layout and page sections
├── styles.css      # Theme and component styling
├── app.js          # UI wiring, input handling, loop, leaderboard view
└── snakeLogic.js   # Pure game state + transition logic
```

## How To Run

1. Open a terminal:
2. Start a local server:
   `python3 -m http.server 4173`
3. Open:
   `http://localhost:4173`

## Controls

- Move: `Arrow Keys` or `W A S D`
- Pause/Resume: `Space`
- Restart: `R`
- Mobile/Touch: on-screen arrow buttons

## What To Verify

1. Snake moves one tile per tick in the selected direction.
2. Eating food increases score and snake length.
3. Wall collision and self-collision trigger game over.
4. Restart resets score/state correctly.
5. Leaderboard stores and shows the last 10 completed games.
6. Top-ranked entry is visually highlighted with a crown.

