# ToDo Express API with Swagger

A simple RESTful CRUD API built with **Express.js** and documented using **Swagger (OpenAPI 3.1)**. This project demonstrates basic API development, request validation, and interactive API documentation.

---

## Features

- CRUD operations for tasks
- Express.js REST API
- Swagger UI documentation
- OpenAPI 3.1 specification
- JSON request/response format
- In-memory data storage (no database)

---

## Tech Stack

- Node.js
- Express.js
- Swagger UI Express
- Swagger JSDoc

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/elyasbromand/Assignments-FlyRank.git
cd Assignments-FlyRank
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server

```bash
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

## Project Structure

```
.
├── index.js
├── package.json
└── README.md
```

---

# API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/:id` | Get a task by ID |
| POST | `/tasks` | Create a new task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

---

# Example Request

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

# Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `node index.js` | Start the API server |

---

# Swagger Documentation

Once the server is running, open:

```
http://localhost:3000/docs
```

to explore and test the API through the interactive Swagger UI.

# Notes

- Data is stored in memory and resets whenever the server restarts.
- No database is required.
- Built for learning REST APIs and Swagger/OpenAPI documentation.

---

## Author

**Elyas Bromand**