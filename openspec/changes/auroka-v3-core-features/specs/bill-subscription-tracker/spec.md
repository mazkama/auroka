# Spec Delta: Bill & Subscription Tracker

## Purpose
Enables users to manage recurring bills (utilities, rent, subscriptions) with billing cycle tracking, due date reminders, and one-click payment settlement.

## ADDED Requirements

### Requirement: Recurring bill CRUD operations
The system SHALL provide authenticated CRUD endpoints under `/api/v1/bills` to manage recurring bill items with category, amount, due day (1-31), billing cycle (MONTHLY/YEARLY), and auto-settlement wallet association.

#### Scenario: Create recurring bill
- **WHEN** user posts bill name, amount, due day, and wallet ID to `POST /api/v1/bills`
- **THEN** system saves the bill in PostgreSQL and returns HTTP 201 with the created bill record

#### Scenario: Mark bill as paid for current cycle
- **WHEN** user calls `POST /api/v1/bills/:id/pay`
- **THEN** system marks bill status as PAID for current month and records an EXPENSE transaction in the associated wallet ledger

### Requirement: Frontend bills interface
The frontend SHALL provide a dedicated `/bills` page displaying upcoming obligations, due date countdown badges, and monthly recurring totals.

#### Scenario: View and pay bill in UI
- **WHEN** user visits `/bills` and clicks "Bayar Sekarang"
- **THEN** frontend triggers settlement API and updates the bill status badge from PENDING to PAID
