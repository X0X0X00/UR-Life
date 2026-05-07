# Human-Computer Interaction — CSC 212

> University of Rochester · CSC 212 · 2022–2025 · Python / Web / OpenFace

Course repository: selected homework and the final project from CSC 212
(Human-Computer Interaction) at the University of Rochester.

## Course Overview
Survey of human-computer interaction: user research, prototyping, design
heuristics, evaluation, and building interactive systems. Coursework
combines design exercises with hands-on coding — from sensor-driven
gesture recognition to a full web-based campus app.

## Assignments
- [`HW7/`](HW7) — **Homework 7 · OpenFaceVision**: real-time head-gesture
  recognizer built on top of the **OpenFace** facial-behavior toolkit.
  A Python driver invokes OpenFace, parses CSV landmark/pose output,
  and classifies head gestures from a sliding window over pitch/yaw/roll.
- [`FinalProject/`](FinalProject) — **Final Project · UR-Life**: campus-life
  web app for UofR students with task management, degree-progress tracking,
  weekly course calendar, and a mailing-list manager. HTML/CSS/JS front end,
  Python `http.server` REST backend, JSON-file persistence, ngrok demo.

Each assignment has its own README inside its folder with build/run
instructions.

## Tech Stack
Python · HTML · CSS · JavaScript · OpenFace · Bash · ngrok

## Notes
Coursework archive — kept as personal reference. Code reflects assignment constraints, not production style. Originally two separate repositories (`OpenFaceVision` for HW7 and `UR-Life` for the final project); merged here via `git subtree` so both histories are preserved.
