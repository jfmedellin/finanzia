# Security RLS Specification

## Purpose
Define user data isolation, storage privacy, and secret handling expectations.

## Requirements

### Requirement: User data isolation
The system MUST enforce Supabase RLS so users can only read and mutate their own finance data.

#### Scenario: Read own records
- GIVEN an authenticated user owns finance records
- WHEN the user requests those records
- THEN the records SHALL be returned

#### Scenario: Block another user's records
- GIVEN records belong to another user
- WHEN access is attempted through normal client credentials
- THEN the system MUST deny read and write access

### Requirement: Private storage and service role safety
Statement files MUST be private and service role credentials MUST NOT be exposed to the frontend.

#### Scenario: Access private upload
- GIVEN a statement file belongs to user A
- WHEN user B requests the file
- THEN access MUST be denied
