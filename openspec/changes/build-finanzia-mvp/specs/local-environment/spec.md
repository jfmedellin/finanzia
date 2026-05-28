# Local Environment Specification

## Purpose
Define local Docker and Supabase workflow expectations for development.

## Requirements

### Requirement: Reproducible local stack
The project MUST provide Docker/Docker Compose workflow to run frontend, backend/OCR boundaries, and Supabase-local dependencies where practical.

#### Scenario: Start local environment
- GIVEN dependencies are installed and environment variables are configured
- WHEN the developer runs the documented start command
- THEN the local app services SHALL become reachable

#### Scenario: Missing configuration
- GIVEN required environment variables are absent
- WHEN the local stack starts
- THEN startup MUST fail clearly or surface actionable configuration errors

### Requirement: Supabase local workflow
The project SHOULD document migration and seed workflows for local development.

#### Scenario: Reset local database
- GIVEN local Supabase is available
- WHEN the documented reset command is run
- THEN migrations SHALL be applied consistently
