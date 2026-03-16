# Kanban Board

A fullstack Kanban Board application for managing projects and tasks with drag-and-drop support, file attachments, and a clean Nord-themed UI.

## Tech Stack

### Backend
- **Kotlin / Ktor 3.4.1** - REST API framework
- **Exposed 0.61.0** - ORM framework
- **H2 Database** - Embedded file-based database (configurable)
- **kotlinx.serialization** - JSON serialization
- **Runtime OpenAPI** - Auto-generated Swagger documentation from route annotations

### Frontend
- **React 19** - UI framework
- **Tailwind CSS 4** - Utility-first CSS with Nord color palette
- **Vite 6** - Build tool and dev server
- **@hello-pangea/dnd** - Drag and drop for task management
- **React Router 7** - Client-side routing
- **Lucide React** - Icon library

## Features

- **Projects** - Create, edit, delete projects with title, description, status, dates, and file attachments
- **Tasks** - Kanban board with three columns (New, In Progress, Done) and drag-and-drop
- **File Attachments** - Upload and download files per project
- **Dark/Light Theme** - Toggle between themes using the Nord color palette, persisted to localStorage
- **Responsive Design** - Adapts to mobile, tablet, and desktop screens
- **API Documentation** - Swagger UI generated at runtime from route annotations

## Project Structure

```
kanban-board/
├── backend/                          # Kotlin/Ktor REST API
│   ├── build.gradle.kts
│   ├── settings.gradle.kts
│   └── src/main/
│       ├── kotlin/com/kanban/
│       │   ├── Application.kt        # Entry point
│       │   ├── database/
│       │   │   ├── DatabaseFactory.kt # DB connection & init
│       │   │   └── Tables.kt         # Exposed table definitions
│       │   ├── models/
│       │   │   └── Models.kt         # Request/response data classes
│       │   ├── plugins/
│       │   │   ├── CORS.kt           # CORS configuration
│       │   │   ├── Routing.kt        # Route setup & Swagger UI
│       │   │   └── Serialization.kt  # JSON content negotiation
│       │   └── routes/
│       │       ├── ProjectRoutes.kt   # Project CRUD endpoints
│       │       ├── TaskRoutes.kt      # Task CRUD endpoints
│       │       └── FileRoutes.kt      # File upload/download endpoints
│       └── resources/
│           ├── application.yaml       # Application configuration
│           └── logback.xml            # Logging configuration
│
└── frontend/                          # React SPA
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css                  # Tailwind + Nord theme
        ├── api/                       # API client layer
        │   ├── client.js
        │   ├── projects.js
        │   ├── tasks.js
        │   └── files.js
        ├── components/
        │   ├── Layout.jsx             # Header, theme toggle
        │   ├── ThemeProvider.jsx       # Dark/light theme context
        │   ├── ProjectCard.jsx         # Project card with progress
        │   ├── ProjectDialog.jsx       # Create/edit project modal
        │   ├── TaskCard.jsx            # Draggable task card
        │   ├── TaskColumn.jsx          # Kanban column
        │   ├── TaskDialog.jsx          # Create/edit task modal
        │   ├── ProgressBar.jsx         # Task progress bar
        │   └── ConfirmDialog.jsx       # Delete confirmation
        └── pages/
            ├── ProjectsPage.jsx        # Projects grid view
            └── TasksPage.jsx           # Kanban board view
```

## Prerequisites

- **JDK 21+** - For the backend
- **Node.js 22+** - For the frontend

## Build & Run

### Backend

```bash
cd backend

# Run in development
./gradlew run

# Build a distribution
./gradlew build
```

The backend starts on **http://localhost:8080** by default.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build
```

The frontend dev server starts on **http://localhost:5173** and proxies API requests to the backend.

### Running Both

Open two terminals:

```bash
# Terminal 1 - Backend
cd backend && ./gradlew run

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Then open **http://localhost:5173** in your browser.

## Docker

Build and run the entire application in a single container:

```bash
# Build the image
docker build -t kanban-board .

# Run the container
docker run -d \
  -p 8080:8080 \
  -v kanban-data:/app/data \
  -v kanban-uploads:/app/uploads \
  --name kanban-board \
  kanban-board
```

Then open **http://localhost:8080** in your browser.

The Docker image uses a multi-stage build:
1. Builds the React frontend with Node.js
2. Builds the Kotlin backend with Gradle
3. Packages everything into a minimal JRE Alpine image (~200MB)

Named volumes `kanban-data` and `kanban-uploads` persist the database and uploaded files across container restarts.

## Configuration

### Backend Configuration

The backend is configured via `backend/src/main/resources/application.yaml`:

```yaml
ktor:
  application:
    modules:
      - com.kanban.ApplicationKt.module
  deployment:
    port: 8080        # Server port
    host: 0.0.0.0     # Server host

database:
  url: "jdbc:h2:file:./data/kanban;DB_CLOSE_DELAY=-1;AUTO_SERVER=TRUE"
  driver: "org.h2.Driver"
  user: "sa"
  password: ""
```

#### Database

By default, the application uses an embedded H2 database stored in `./data/kanban`. To use a different database, update the `database` section in `application.yaml`. For example, to use PostgreSQL:

```yaml
database:
  url: "jdbc:postgresql://localhost:5432/kanban"
  driver: "org.postgresql.Driver"
  user: "postgres"
  password: "your-password"
```

Note: When switching databases, add the appropriate JDBC driver dependency to `build.gradle.kts`.

### Frontend Configuration

The Vite dev server proxy is configured in `frontend/vite.config.js`. By default, it proxies `/api` requests to `http://localhost:8080`.

## API Documentation

Swagger UI is available at **http://localhost:8080/swagger** when the backend is running. The OpenAPI spec is generated at runtime from route annotations using Ktor's `.describe {}` DSL.

### API Endpoints

| Method | Endpoint                          | Description                  |
|--------|-----------------------------------|------------------------------|
| GET    | `/api/projects`                   | List all projects            |
| POST   | `/api/projects`                   | Create a project             |
| GET    | `/api/projects/{id}`              | Get project by ID            |
| PUT    | `/api/projects/{id}`              | Update a project             |
| DELETE | `/api/projects/{id}`              | Delete a project             |
| GET    | `/api/projects/{id}/files`        | List project files           |
| POST   | `/api/projects/{id}/files`        | Upload files to a project    |
| GET    | `/api/files/{id}/download`        | Download a file              |
| DELETE | `/api/files/{id}`                 | Delete a file                |
| GET    | `/api/projects/{projectId}/tasks` | List tasks for a project     |
| POST   | `/api/projects/{projectId}/tasks` | Create a task                |
| PUT    | `/api/tasks/{id}`                 | Update a task                |
| DELETE | `/api/tasks/{id}`                 | Delete a task                |

## AI Generated

This project was entirely created by [Claude](https://claude.ai), Anthropic's AI assistant, through iterative conversation and code generation using [Claude Code](https://claude.com/claude-code).
