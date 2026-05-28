# Auth Profile Specification

## Purpose
Define authentication, recovery, session, and profile behavior for one FinanzIA user.

## Requirements

### Requirement: Account access
The system MUST allow email/password registration, login, logout, password recovery, and authenticated profile access through Supabase Auth.

#### Scenario: Register and create profile
- GIVEN a visitor with a valid email and password
- WHEN registration succeeds
- THEN an authenticated user identity SHALL exist
- AND a profile record SHALL be available for onboarding data

#### Scenario: Reject invalid login
- GIVEN a visitor enters invalid credentials
- WHEN login is submitted
- THEN the system MUST keep the visitor unauthenticated
- AND show a non-sensitive error message

### Requirement: Session boundaries
The system MUST protect private pages and SHOULD redirect authenticated users away from public auth pages.

#### Scenario: Private route without session
- GIVEN no valid session exists
- WHEN a private route is requested
- THEN access MUST be denied or redirected to login
