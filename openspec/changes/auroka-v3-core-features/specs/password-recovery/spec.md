# Spec Delta: Password Recovery

## Purpose
Provides secure email OTP-based account recovery enabling users to reset forgotten passwords.

## ADDED Requirements

### Requirement: User can request password reset OTP
The system SHALL accept a registered email address, generate a 6-digit numeric OTP with 10-minute expiry, and dispatch it via Resend API to the user's email.

#### Scenario: Request OTP for registered email
- **WHEN** user submits registered email to `POST /api/v1/auth/forgot-password`
- **THEN** system generates an OTP, sends email via Resend API from `Auroka <no-reply@auroka.kuloalan.online>`, and returns HTTP 200 with success message

#### Scenario: Request OTP for non-existent email
- **WHEN** user submits unregistered email to `POST /api/v1/auth/forgot-password`
- **THEN** system returns HTTP 404 or sanitized 200 to prevent user enumeration

### Requirement: User can verify OTP and reset password
The system SHALL verify the 6-digit OTP code against the database record and update the user's password with bcrypt hashing upon valid submission.

#### Scenario: Valid OTP and new password submission
- **WHEN** user submits valid email, 6-digit OTP, and new password to `POST /api/v1/auth/reset-password`
- **THEN** system updates password hash, marks OTP as used, and returns HTTP 200 allowing immediate login
