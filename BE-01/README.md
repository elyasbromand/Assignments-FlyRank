# BE-01 + BE-02

# ToDo Express API with Swagger

A simple RESTful CRUD API built with **Express.js** and documented using **Swagger (OpenAPI 3.1)**. The project follows a three-layer architecture (Routes → Services → Repositories) and persists data using a file-based SQLite database (`better-sqlite3`). It demonstrates API development, request validation, and interactive API documentation.

---

## Features

- CRUD operations for tasks
- Express.js REST API
- Swagger UI documentation
- OpenAPI 3.1 specification
- JSON request/response format
- SQLite file-based data storage (`better-sqlite3`)

---

## Tech Stack

- Node.js
- Express.js
- Swagger UI Express
- Swagger JSDoc
- SQLite (`better-sqlite3`)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/elyasbromand/Assignments-FlyRank.git
cd Assignments-FlyRank/BE-01
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

```bash
npm start
# or
node index.js
```

The server will start on:

```
http://localhost:3000
```

Swagger documentation is available at:

```
http://localhost:3000/docs
```

---

## Project Structure (high level)

```
BE-01/
  index.js            # app entry
  package.json
  src/
    app.js
    db/
      database.js     # SQLite connector (better-sqlite3)
    middleware/
      errorHandler.js
    repositories/
      tasks.repository.js
    routes/
      tasks.router.js
    services/
      tasks.services.js
```

This follows a three-layer architecture:
- Routes: HTTP layer and request validation
- Services: Business logic
- Repositories: Data access (SQLite)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/` | API information |
| GET    | `/health` | Health check |
| GET    | `/tasks` | Get all tasks |
| GET    | `/tasks/:id` | Get a task by ID |
| POST   | `/tasks` | Create a new task |
| PUT    | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

---

## Example Request

Create a task

```bash
curl -i \
  -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Swagger"}'
```

### Example Response

```http
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 45

{
  "id": 4,
  "title": "Learn Swagger",
  "done": false
}
```

---

## Available Commands

- `npm install` : Install project dependencies
- `npm start` or `node index.js` : Start the API server

---

## Swagger Documentation

Once the server is running, open:

```
http://localhost:3000/docs
```

to explore and test the API through the interactive Swagger UI.

## Database

- The app uses `better-sqlite3` to persist tasks to a local file named `tasks.db`.
- The `tasks.db` file is created automatically in the project root when the server starts.
- To clear all data, stop the server and delete `tasks.db` from the project root.

## Run with a fresh clone

To run the project from a fresh clone:

```bash
git clone https://github.com/elyasbromand/Assignments-FlyRank.git
cd Assignments-FlyRank/BE-01
npm install
npm start
```

Notes:
- The project is authored as ES modules (`type: "module"` in `package.json`). Use Node 18+.
- `tasks.db` is created automatically on first run; no separate migration step is required.

## Notes

- Data is persisted to `tasks.db` (SQLite) and will survive restarts unless the file is removed.
- Built for learning REST APIs and Swagger/OpenAPI documentation.
- The `ai-version` folder contains the code the author created using an AI tool for comparison.

## AI VS ME

While AI is better at documenting Swagger APIs and validating input fields, my code has better status codes and user experience.

---

## Author

**Elyas Bromand**