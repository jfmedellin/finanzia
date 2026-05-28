# FinanzIA OCR boundary

This folder is the future home of statement extraction. Phase 1 only creates the boundary so later slices can add an OCR engine, extraction contract, tests, and upload/review integration without mixing backend code into the frontend.

## Current placeholder

- Docker Compose serves this folder with `python -m http.server 8010` only to prove the local service boundary exists.
- No OCR logic, parsing, storage access, or transaction confirmation is implemented in this slice.

## Future contract

`{ batchId, userId, storagePath, fileType, rows: [{ date, description, amount, direction, confidence, suggestedCategoryId, rawText }] }`
