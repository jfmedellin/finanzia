# Reports Specification

## Purpose
Define MVP reports for monthly, category, and period comparison views.

## Requirements

### Requirement: Report filters
The system MUST let users generate reports filtered by period, account, category, and transaction type where applicable.

#### Scenario: Monthly report
- GIVEN a user selects a month with transactions
- WHEN the report is generated
- THEN income, expenses, net savings, and category totals SHALL be shown

#### Scenario: Empty period
- GIVEN the selected period has no transactions
- WHEN the report is generated
- THEN the system MUST show an empty report state with zero totals

### Requirement: Period comparison report
The system SHOULD compare two periods using the same metric definitions.

#### Scenario: Compare selected periods
- GIVEN two valid periods are selected
- WHEN the comparison report is generated
- THEN changes in income, expenses, and savings SHALL be shown
