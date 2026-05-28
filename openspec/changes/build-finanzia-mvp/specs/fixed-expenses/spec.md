# Fixed Expenses Specification

## Purpose
Define recurring fixed expense tracking and payment states.

## Requirements

### Requirement: Recurring expenses
The system MUST let users create fixed expenses with amount, recurrence, due date, category, and optional account.

#### Scenario: Create fixed expense
- GIVEN an authenticated user provides valid recurring expense details
- WHEN the expense is saved
- THEN it SHALL appear in that user's fixed expenses list
- AND its initial state SHALL be pending unless marked paid

#### Scenario: Missing due date
- GIVEN a fixed expense has no valid due date
- WHEN the user submits it
- THEN the system MUST reject it with validation feedback

### Requirement: Payment state
The system MUST represent fixed expenses as paid, pending, or overdue and MAY include reminder placeholders.

#### Scenario: Overdue unpaid expense
- GIVEN an unpaid fixed expense has a due date before today
- WHEN expenses are evaluated
- THEN its state SHALL be overdue
