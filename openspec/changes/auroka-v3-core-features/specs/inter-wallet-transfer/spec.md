# Spec Delta: Inter-Wallet Transfer

## Purpose
Enables users to transfer funds between their own wallets (e.g. Bank to E-Wallet) in a single atomic double-entry ledger transaction with optional transfer fee.

## ADDED Requirements

### Requirement: Atomic inter-wallet fund transfer
The system SHALL execute inter-wallet transfers atomically by recording a `TRANSFER_OUT` debit from the source wallet, a `TRANSFER_IN` credit to the destination wallet, and an optional `EXPENSE` entry for admin fees.

#### Scenario: Successful inter-wallet transfer
- **WHEN** an authenticated user posts source wallet ID, destination wallet ID, amount, and optional fee to `POST /api/v1/transactions/transfer`
- **THEN** the system atomically updates both wallet ledgers within a database transaction and returns HTTP 201 with transfer details

#### Scenario: Transfer between same wallet error
- **WHEN** user specifies the same wallet ID as both source and destination
- **THEN** the system rejects the transfer with HTTP 400 Bad Request

### Requirement: Frontend transfer modal interface
The frontend transaction modal SHALL provide a "Transfer" transaction type allowing users to pick source wallet, target wallet, and transfer amount.

#### Scenario: User records transfer in UI
- **WHEN** user selects "Transfer", picks source and target wallets, enters amount, and submits
- **THEN** frontend invokes the transfer use case and refreshes balances across all affected wallet cards
