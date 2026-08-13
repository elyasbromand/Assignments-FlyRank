# FlyRank BE-01 Task API

## What this is

This project is a small Express.js REST API for managing a task list. It follows a clean three-layer design:

- Routes handle the HTTP requests
- Services contain the business logic
- Repositories talk to PostgreSQL

The app is containerized with Docker Compose and includes Swagger for API exploration.

---

## Run everything

From the project root, clone it and start the stack with one command:

```bash
git clone <repo-url>
cd BE-01
docker compose up
```

This starts:

- the PostgreSQL database container
- the API container

Once it is running, the app is available at:

```text
http://localhost:3000
```

Swagger is available at:

```text
http://localhost:3000/docs
```

---

## Environment variables

Use the sample file at `.env.example` as the reference for required variables.

```bash
cp .env.example .env
```

Then update the values in `.env` to match your local setup.

Example:

```env
DATABASE_URL=postgres://username:password@localhost:5432/database_name
```

For the Docker Compose setup, the app already uses:

```env
DATABASE_URL=postgres://postgres:dev@db:5432/tasks
```

---

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/:id` | Get one task by ID |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update an existing task |
| DELETE | `/tasks/:id` | Delete a task |

---

## Example request

```bash
curl -i \
  -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn Docker Compose"}'
```

Example response:

```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "id": 1,
  "title": "Learn Docker Compose",
  "done": false
}
```

---

## Database view

Inspect the database from Docker with:

```bash
docker compose exec db psql -U postgres -d tasks -c "\dt"
docker compose exec db psql -U postgres -d tasks -c "SELECT * FROM tasks ORDER BY id;"
```

### Database look

![Database screenshot](./db_screenshot.png)

---

## Project structure

```text
BE-01/
├── compose.yaml
├── Dockerfile
├── .env.example
├── index.js
├── package.json
├── openapi.json
├── src/
│   ├── app.js
│   ├── db/
│   │   └── database.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── repositories/
│   │   └── tasks.repository.js
│   ├── routes/
│   │   └── tasks.router.js
│   └── services/
│       └── tasks.services.js
└── README.md
```

---

## Notes

- The app is designed for local development and learning.
- PostgreSQL is created and initialized automatically when the containers start.
- The `ai-version` folder contains a comparison implementation created with AI assistance.

---

## Author

**Elyas Bromand**
