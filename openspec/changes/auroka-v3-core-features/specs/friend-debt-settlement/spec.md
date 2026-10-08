# Spec Delta: Friend Debt Settlement

## Purpose
Provides a centralized debt settlement dashboard and tracker for expenses flagged as friend orders (`isFriendOrder`).

## ADDED Requirements

### Requirement: Query and filter friend order items
The system SHALL provide an authenticated API endpoint `GET /api/v1/debts` returning all transaction items where `is_friend_order = true`, grouped or filterable by settlement status.

#### Scenario: Fetch pending friend debts
- **WHEN** user requests `GET /api/v1/debts?status=unsettled`
- **THEN** system returns list of friend items, debtor name, amount, purchase date, and transaction context

### Requirement: Settle friend order debt
The system SHALL provide an endpoint `POST /api/v1/debts/:id/settle` allowing users to mark a friend's order as paid and optionally record a matching incoming transaction to a specified wallet.

#### Scenario: Settle friend order debt
- **WHEN** user marks an item as settled and specifies receiving wallet
- **THEN** system updates item status to `settled`, logs settlement timestamp, and creates an `IN` ledger entry in the destination wallet
