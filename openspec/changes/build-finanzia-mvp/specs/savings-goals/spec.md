# Savings Goals Specification

## Purpose
Define savings pockets/goals and progress tracking.

## Requirements

### Requirement: Goal management
The system MUST let users create savings goals with name, target amount, current amount, and optional target date.

#### Scenario: Create savings goal
- GIVEN an authenticated user provides a positive target amount
- WHEN the goal is saved
- THEN it SHALL appear with calculated progress
- AND status SHALL reflect whether the target is reached

#### Scenario: Invalid target
- GIVEN the target amount is missing or not positive
- WHEN the user submits the goal
- THEN the system MUST reject it with validation feedback

### Requirement: Contributions
The system SHOULD allow users to update current saved amount without exceeding clear ownership boundaries.

#### Scenario: Update progress
- GIVEN a user owns a savings goal
- WHEN the current amount changes
- THEN progress percentage and status SHALL update for that user only
