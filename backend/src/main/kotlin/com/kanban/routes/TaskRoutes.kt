package com.kanban.routes

import com.kanban.database.DatabaseFactory.dbQuery
import com.kanban.database.Projects
import com.kanban.database.Tasks
import com.kanban.models.TaskRequest
import com.kanban.models.TaskResponse
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.routing.openapi.*
import io.ktor.openapi.*
import kotlinx.datetime.Clock
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq

fun Route.taskRoutes() {
    // GET /api/projects/{projectId}/tasks - list tasks for project
    route("/projects/{projectId}/tasks") {
        get {
            val projectId = call.parameters["projectId"]?.toIntOrNull()
                ?: throw IllegalArgumentException("Invalid project ID")

            val tasks = dbQuery {
                Tasks.selectAll().where { Tasks.projectId eq projectId }.map { row ->
                    TaskResponse(
                        id = row[Tasks.id],
                        projectId = row[Tasks.projectId],
                        title = row[Tasks.title],
                        description = row[Tasks.description],
                        status = row[Tasks.status],
                        startDate = row[Tasks.startDate],
                        endDate = row[Tasks.endDate],
                        createdAt = row[Tasks.createdAt].toString()
                    )
                }
            }
            call.respond(HttpStatusCode.OK, tasks)
        }.describe {
            tag("Tasks")
            summary = "List tasks for a project"
            operationId = "listTasks"
            parameters {
                path("projectId") {
                    description = "Project ID"
                    schema = jsonSchema<Int>()
                }
            }
            responses {
                HttpStatusCode.OK {
                    description = "List of tasks"
                    schema = jsonSchema<List<TaskResponse>>()
                }
                HttpStatusCode.BadRequest {
                    description = "Invalid project ID"
                }
            }
        }

        // POST /api/projects/{projectId}/tasks - create task
        post {
            val projectId = call.parameters["projectId"]?.toIntOrNull()
                ?: throw IllegalArgumentException("Invalid project ID")
            val request = call.receive<TaskRequest>()
            val now = Clock.System.now().toLocalDateTime(TimeZone.UTC)

            // Verify project exists
            dbQuery {
                Projects.selectAll().where { Projects.id eq projectId }.singleOrNull()
                    ?: throw NoSuchElementException("Project not found with id: $projectId")
            }

            val task = dbQuery {
                val insertStatement = Tasks.insert {
                    it[Tasks.projectId] = projectId
                    it[title] = request.title
                    it[description] = request.description
                    it[status] = request.status ?: "New"
                    it[startDate] = request.startDate
                    it[endDate] = request.endDate
                    it[createdAt] = now
                }
                val row = insertStatement.resultedValues!!.first()
                TaskResponse(
                    id = row[Tasks.id],
                    projectId = row[Tasks.projectId],
                    title = row[Tasks.title],
                    description = row[Tasks.description],
                    status = row[Tasks.status],
                    startDate = row[Tasks.startDate],
                    endDate = row[Tasks.endDate],
                    createdAt = row[Tasks.createdAt].toString()
                )
            }
            call.respond(HttpStatusCode.Created, task)
        }.describe {
            tag("Tasks")
            summary = "Create a new task"
            operationId = "createTask"
            parameters {
                path("projectId") {
                    description = "Project ID"
                    schema = jsonSchema<Int>()
                }
            }
            requestBody {
                description = "Task data"
                required = true
                schema = jsonSchema<TaskRequest>()
            }
            responses {
                HttpStatusCode.Created {
                    description = "Task created"
                    schema = jsonSchema<TaskResponse>()
                }
                HttpStatusCode.BadRequest {
                    description = "Invalid request"
                }
                HttpStatusCode.NotFound {
                    description = "Project not found"
                }
            }
        }
    }

    // PUT /api/tasks/{id} - update task
    put("/tasks/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
            ?: throw IllegalArgumentException("Invalid task ID")
        val request = call.receive<TaskRequest>()

        val updated = dbQuery {
            Tasks.update({ Tasks.id eq id }) {
                it[title] = request.title
                it[description] = request.description
                if (request.status != null) it[status] = request.status
                it[startDate] = request.startDate
                it[endDate] = request.endDate
            }
        }

        if (updated == 0) throw NoSuchElementException("Task not found with id: $id")

        val task = dbQuery {
            Tasks.selectAll().where { Tasks.id eq id }.single().let { row ->
                TaskResponse(
                    id = row[Tasks.id],
                    projectId = row[Tasks.projectId],
                    title = row[Tasks.title],
                    description = row[Tasks.description],
                    status = row[Tasks.status],
                    startDate = row[Tasks.startDate],
                    endDate = row[Tasks.endDate],
                    createdAt = row[Tasks.createdAt].toString()
                )
            }
        }
        call.respond(HttpStatusCode.OK, task)
    }.describe {
        tag("Tasks")
        summary = "Update a task"
        description = "Update task details including status. Used for drag-and-drop status changes."
        operationId = "updateTask"
        parameters {
            path("id") {
                description = "Task ID"
                schema = jsonSchema<Int>()
            }
        }
        requestBody {
            description = "Updated task data"
            required = true
            schema = jsonSchema<TaskRequest>()
        }
        responses {
            HttpStatusCode.OK {
                description = "Task updated"
                schema = jsonSchema<TaskResponse>()
            }
            HttpStatusCode.BadRequest {
                description = "Invalid request"
            }
            HttpStatusCode.NotFound {
                description = "Task not found"
            }
        }
    }

    // DELETE /api/tasks/{id} - delete task
    delete("/tasks/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
            ?: throw IllegalArgumentException("Invalid task ID")

        val deleted = dbQuery {
            Tasks.deleteWhere { Tasks.id eq id }
        }

        if (deleted == 0) throw NoSuchElementException("Task not found with id: $id")

        call.respond(HttpStatusCode.NoContent)
    }.describe {
        tag("Tasks")
        summary = "Delete a task"
        operationId = "deleteTask"
        parameters {
            path("id") {
                description = "Task ID"
                schema = jsonSchema<Int>()
            }
        }
        responses {
            HttpStatusCode.NoContent {
                description = "Task deleted"
            }
            HttpStatusCode.BadRequest {
                description = "Invalid task ID"
            }
            HttpStatusCode.NotFound {
                description = "Task not found"
            }
        }
    }
}
