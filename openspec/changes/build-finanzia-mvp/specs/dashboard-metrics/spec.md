# Dashboard Metrics Specification

## Purpose
Define summary metrics shown to authenticated users.

## Requirements

### Requirement: Financial summary
The system MUST show current balance, monthly income, monthly expenses, savings, and category summary for the selected period.

#### Scenario: View current month metrics
- GIVEN an authenticated user has transactions in the current month
- WHEN the dashboard loads
- THEN balance, income, expenses, and savings SHALL be calculated from that user's data
- AND categories SHALL show period totals

#### Scenario: Empty dashboard
- GIVEN the user has no transactions for the selected period
- WHEN the dashboard loads
- THEN metrics MUST show zero-value states
- AND no other user's data SHALL appear

### Requirement: Period comparison
The system SHOULD compare the selected period against a previous equivalent period.

#### Scenario: Compare months
- GIVEN data exists for two comparable months
- WHEN the user views the dashboard
- THEN the system SHALL show income and expense changes between periods
