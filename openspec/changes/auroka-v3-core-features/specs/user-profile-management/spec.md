# Spec Delta: User Profile Management

## Purpose
Enables users to update and persist their personal profile information (name, phone number, bio, and avatar) and account preferences.

## ADDED Requirements

### Requirement: User can update personal profile information
The system SHALL provide an authenticated API endpoint to update the user's name, phone number, bio, and avatar URL, and persist changes to the database.

#### Scenario: Successfully update profile
- **WHEN** an authenticated user submits valid name, phone, bio, or avatar data to `PUT /api/v1/auth/profile`
- **THEN** the system updates the user record in PostgreSQL and returns HTTP 200 with the updated user profile object

#### Scenario: Unauthorized profile update attempt
- **WHEN** an unauthenticated request is sent to `PUT /api/v1/auth/profile`
- **THEN** the system rejects the request with HTTP 401 Unauthorized

### Requirement: Frontend persists profile updates
The frontend profile page SHALL send updated profile details to the backend API and synchronize local session state upon successful response.

#### Scenario: User saves changes on profile page
- **WHEN** user edits fields on `/profile` and clicks "Simpan Perubahan"
- **THEN** frontend calls `PUT /api/v1/auth/profile`, displays a success toast notification, and updates local user storage
