# Categories Rules Specification

## Purpose
Define default/custom categories and basic classification rules.

## Requirements

### Requirement: Category management
The system MUST provide default categories and allow users to create, edit, and disable custom categories.

#### Scenario: Use default category
- GIVEN a new authenticated user starts using FinanzIA
- WHEN categories are displayed
- THEN default income and expense categories SHALL be available

#### Scenario: Disable category in use
- GIVEN a category is referenced by existing transactions
- WHEN the user disables it
- THEN historical transactions SHALL keep their category reference
- AND the category SHOULD be hidden from new selection

### Requirement: Classification rules
The system MUST let users define keyword-based rules that suggest categories for imported or OCR rows.

#### Scenario: Apply matching rule
- GIVEN a staged row description matches a user rule
- WHEN suggestions are generated
- THEN the matching category SHALL be suggested without auto-confirming
