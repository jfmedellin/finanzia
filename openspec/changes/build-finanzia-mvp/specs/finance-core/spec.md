# Finance Core Specification

## Purpose
Define core accounts, categories, and transactions for personal finance tracking.

## Requirements

### Requirement: Accounts and transactions
The system MUST let authenticated users manage accounts and record income, expense, and transfer transactions. Transaction creation and balance effects MUST be atomic: either every required row and balance change commits, or none commits.

#### Scenario: Create an expense
- GIVEN an authenticated user has an account and active expense category
- WHEN the user records an expense with amount, date, and description
- THEN the transaction SHALL be saved under that user
- AND the account balance SHALL decrease by the expense amount in the same committed operation

#### Scenario: Create income
- GIVEN an authenticated user has an account and active income category
- WHEN the user records income with amount, date, and description
- THEN the transaction SHALL be saved under that user
- AND the account balance SHALL increase by the income amount in the same committed operation

#### Scenario: Transfer between accounts
- GIVEN the user has two accounts
- WHEN the user records a transfer amount
- THEN the source balance MUST decrease
- AND the destination balance MUST increase by the same amount

#### Scenario: Transfer rejects same account
- GIVEN an authenticated user has one account
- WHEN the user submits a transfer using the same source and destination account
- THEN the system MUST reject it with validation feedback
- AND no transaction or balance change SHALL be committed

### Requirement: Atomic failure rollback
The system MUST NOT leave partial transaction or balance state when any insert, update, ownership, or validation step fails.

#### Scenario: Expense insert failure rolls back balance
- GIVEN an authenticated user records an otherwise valid expense
- WHEN transaction row creation fails
- THEN no account balance change SHALL be committed
- AND the caller SHALL receive an operation error

#### Scenario: Income insert failure rolls back balance
- GIVEN an authenticated user records an otherwise valid income
- WHEN transaction row creation fails
- THEN no account balance change SHALL be committed
- AND the caller SHALL receive an operation error

#### Scenario: Transfer partial failure rolls back both accounts
- GIVEN an authenticated user records a transfer between distinct accounts
- WHEN any transaction row or balance update in the transfer fails
- THEN neither account balance SHALL change
- AND no partial transfer transaction SHALL be committed

### Requirement: Data validation
The system MUST reject transactions with missing account, invalid amount, invalid type, inactive category, wrong category type, or inaccessible account/category.

#### Scenario: Invalid amount
- GIVEN a transaction amount is zero or negative where not allowed
- WHEN the transaction is submitted
- THEN the system MUST reject it with validation feedback

#### Scenario: Inactive category
- GIVEN an authenticated user submits a transaction with an inactive category
- WHEN the transaction is submitted
- THEN the system MUST reject it with category validation feedback
- AND no transaction or balance change SHALL be committed

#### Scenario: Category type mismatch
- GIVEN an authenticated user submits an expense using an income-only category
- WHEN the transaction is submitted
- THEN the system MUST reject it with category validation feedback
- AND no transaction or balance change SHALL be committed

### Requirement: Server action error contract
Finance server actions MUST convert atomic operation outcomes into a stable result contract for callers: success with committed data, or failure with a safe error code/message and no partial state.

#### Scenario: Successful action response
- GIVEN a valid expense, income, or transfer is submitted
- WHEN the atomic operation commits
- THEN the server action MUST return success with the committed transaction result

#### Scenario: Validation error response
- GIVEN invalid finance input is submitted
- WHEN validation rejects the operation
- THEN the server action MUST return a validation error code and field-safe message
- AND it MUST NOT expose database internals

#### Scenario: Operation error response
- GIVEN a database or ownership failure occurs during the atomic operation
- WHEN the operation rolls back
- THEN the server action MUST return an operation error code and safe message
- AND no partial balance update SHALL be visible afterward
