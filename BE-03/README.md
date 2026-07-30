# BE-03

BE-03 is an Express.js backend service that provides Supabase-based authentication and authorization. It exposes public, protected, and authentication endpoints, and uses Swagger UI for API documentation.

## Features

- User sign-up with Supabase Auth
- User login and token-based authentication
- Protected routes validated via Supabase JWT
- Public route for unauthenticated access
- Swagger UI documentation available at `/docs`

## Requirements

- Node.js 18 or later
- Supabase project with API credentials

## Environment Variables

The application requires the following environment variables in a `.env` file:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase service role or anon key
- `PORT` - Optional. Defaults to `3000`

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root and add your Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-key
PORT=3000
```

## Running the Application

Start the server with Node.js:

```bash
node index.js
```

The application listens on the configured `PORT` and exposes documentation at:

```text
http://localhost:3000/docs
```

## API Endpoints

### Authentication

- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Authenticate a user and receive tokens
- `POST /auth/logout` - Sign out the current user (requires bearer token)

### Public

- `GET /public/info` - Retrieve a public information payload

### Protected

- `GET /protected/profile` - Fetch the current user profile (requires bearer token)
- `GET /protected/dashboard` - Fetch the current user dashboard data (requires bearer token)

## Notes

- The project uses Supabase auth token validation on protected endpoints.
- Swagger/OpenAPI definitions are stored in `openapi.json` and served by `swagger-ui-express`.
- There are no automated tests included in this repository.

## Project Structure

- `index.js` - Application entry point
- `src/app.js` - Express application setup
- `src/routes/` - Route definitions
- `src/services/` - Authentication and validation logic
- `src/middleware/` - Error handling and request validation middleware
- `db/db.js` - Supabase client initialization
- `openapi.json` - OpenAPI specification for API documentation
