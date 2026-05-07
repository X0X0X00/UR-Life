# OpenFaceVision — CSC 212 (HW7)

> University of Rochester · CSC 212 · 2022–2025 · Python + OpenFace toolkit

Course repository: labs, projects, and selected homework from CSC 212
(Human-Computer Interaction) at the University of Rochester. This repo is
the HW7 head-gesture submission.

## Course Overview
HCI homework that builds a real-time head-gesture recognizer on top of the
OpenFace facial-behavior toolkit. A Python driver invokes OpenFace, parses
its CSV landmark / pose output, and classifies head gestures from a sliding
window over pitch, yaw, and roll.

## Topics Covered
- Facial landmark and head-pose estimation
- Sliding-window time-series analysis
- Pitch / yaw / roll thresholds for gesture detection (nod, shake, tilt)
- Subprocess integration with an external CV toolkit
- Parsing OpenFace's CSV output format

## What's in this Repo
- `p4-skeleton.py` — main Python driver (runs OpenFace, sliding-window detection)
- `OpenFace-master/` — vendored OpenFace toolkit source
- `of2_out.csv`, `of2_out_of_details.txt` — sample OpenFace output captures

## Tech Stack
Python (subprocess, glob, deque), OpenFace (C++ / MATLAB toolkit)

## Notes
Coursework archive — kept as personal reference. Code reflects assignment constraints, not production style.
