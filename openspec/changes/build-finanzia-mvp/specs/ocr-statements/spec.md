# OCR Statements Specification

## Purpose
Define statement upload, extraction, suggestion, and review-before-confirm behavior.

## Requirements

### Requirement: Statement upload and extraction
The system MUST accept PDF, JPG, and PNG statement uploads from authenticated users and stage extracted rows for review.

#### Scenario: Upload supported statement
- GIVEN an authenticated user selects a PDF, JPG, or PNG statement
- WHEN upload and extraction complete
- THEN extracted rows SHALL be staged as draft items
- AND no transaction SHALL be confirmed automatically

#### Scenario: Unsupported file
- GIVEN a user selects an unsupported file type
- WHEN upload is attempted
- THEN the system MUST reject the file before extraction

### Requirement: Review and classification
The system SHOULD suggest transaction type/category using available rules, but MUST require user confirmation.

#### Scenario: Confirm extracted row
- GIVEN a staged row has extracted amount, date, and suggested category
- WHEN the user reviews and confirms it
- THEN a transaction SHALL be created from the reviewed values
