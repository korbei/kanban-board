package com.kanban.routes

import com.kanban.database.DatabaseFactory.dbQuery
import com.kanban.database.ProjectFiles
import com.kanban.database.Projects
import com.kanban.database.Tasks
import com.kanban.models.ProjectRequest
import com.kanban.models.ProjectResponse
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
import java.io.File

fun Route.projectRoutes() {
    route("/projects") {
        // GET /api/projects - list all projects with task counts
        get {
            val projects = dbQuery {
                Projects.selectAll().orderBy(Projects.id to SortOrder.DESC).map { row ->
                    val projectId = row[Projects.id]
                    val totalTasks = Tasks.selectAll().where { Tasks.projectId eq projectId }.count().toInt()
                    val completedTasks = Tasks.selectAll().where {
                        (Tasks.projectId eq projectId) and (Tasks.status eq "Done")
                    }.count().toInt()

                    ProjectResponse(
                        id = row[Projects.id],
                        title = row[Projects.title],
                        description = row[Projects.description],
                        status = row[Projects.status],
                        startDate = row[Projects.startDate],
                        endDate = row[Projects.endDate],
                        deadline = row[Projects.deadline],
                        country = row[Projects.country],
                        createdAt = row[Projects.createdAt].toString(),
                        totalTasks = totalTasks,
                        completedTasks = completedTasks
                    )
                }
            }
            call.respond(HttpStatusCode.OK, projects)
        }.describe {
            tag("Projects")
            summary = "List all projects"
            description = "Returns all projects ordered by ID descending, including task progress counts."
            operationId = "listProjects"
            responses {
                HttpStatusCode.OK {
                    description = "List of projects"
                    schema = jsonSchema<List<ProjectResponse>>()
                }
            }
        }

        // POST /api/projects - create project
        post {
            val request = call.receive<ProjectRequest>()
            val now = Clock.System.now().toLocalDateTime(TimeZone.UTC)

            val project = dbQuery {
                val insertStatement = Projects.insert {
                    it[title] = request.title
                    it[description] = request.description
                    it[status] = request.status ?: "Active"
                    it[startDate] = request.startDate
                    it[endDate] = request.endDate
                    it[deadline] = request.deadline
                    it[country] = request.country
                    it[createdAt] = now
                }
                val row = insertStatement.resultedValues!!.first()
                ProjectResponse(
                    id = row[Projects.id],
                    title = row[Projects.title],
                    description = row[Projects.description],
                    status = row[Projects.status],
                    startDate = row[Projects.startDate],
                    endDate = row[Projects.endDate],
                    deadline = row[Projects.deadline],
                    country = row[Projects.country],
                    createdAt = row[Projects.createdAt].toString()
                )
            }
            call.respond(HttpStatusCode.Created, project)
        }.describe {
            tag("Projects")
            summary = "Create a new project"
            operationId = "createProject"
            requestBody {
                description = "Project data"
                required = true
                schema = jsonSchema<ProjectRequest>()
            }
            responses {
                HttpStatusCode.Created {
                    description = "Project created"
                    schema = jsonSchema<ProjectResponse>()
                }
                HttpStatusCode.BadRequest {
                    description = "Invalid request"
                }
            }
        }

        // GET /api/projects/{id} - get project details
        get("/{id}") {
            val id = call.parameters["id"]?.toIntOrNull()
                ?: throw IllegalArgumentException("Invalid project ID")

            val project = dbQuery {
                Projects.selectAll().where { Projects.id eq id }.singleOrNull()?.let { row ->
                    val totalTasks = Tasks.selectAll().where { Tasks.projectId eq id }.count().toInt()
                    val completedTasks = Tasks.selectAll().where {
                        (Tasks.projectId eq id) and (Tasks.status eq "Done")
                    }.count().toInt()

                    ProjectResponse(
                        id = row[Projects.id],
                        title = row[Projects.title],
                        description = row[Projects.description],
                        status = row[Projects.status],
                        startDate = row[Projects.startDate],
                        endDate = row[Projects.endDate],
                        deadline = row[Projects.deadline],
                        country = row[Projects.country],
                        createdAt = row[Projects.createdAt].toString(),
                        totalTasks = totalTasks,
                        completedTasks = completedTasks
                    )
                }
            } ?: throw NoSuchElementException("Project not found with id: $id")

            call.respond(HttpStatusCode.OK, project)
        }.describe {
            tag("Projects")
            summary = "Get project by ID"
            description = "Returns a single project with task progress counts."
            operationId = "getProject"
            parameters {
                path("id") {
                    description = "Project ID"
                    schema = jsonSchema<Int>()
                }
            }
            responses {
                HttpStatusCode.OK {
                    description = "Project details"
                    schema = jsonSchema<ProjectResponse>()
                }
                HttpStatusCode.BadRequest {
                    description = "Invalid project ID"
                }
                HttpStatusCode.NotFound {
                    description = "Project not found"
                }
            }
        }

        // PUT /api/projects/{id} - update project
        put("/{id}") {
            val id = call.parameters["id"]?.toIntOrNull()
                ?: throw IllegalArgumentException("Invalid project ID")
            val request = call.receive<ProjectRequest>()

            val updated = dbQuery {
                Projects.update({ Projects.id eq id }) {
                    it[title] = request.title
                    it[description] = request.description
                    if (request.status != null) it[status] = request.status
                    it[startDate] = request.startDate
                    it[endDate] = request.endDate
                    it[deadline] = request.deadline
                    it[country] = request.country
                }
            }

            if (updated == 0) throw NoSuchElementException("Project not found with id: $id")

            val project = dbQuery {
                Projects.selectAll().where { Projects.id eq id }.single().let { row ->
                    val totalTasks = Tasks.selectAll().where { Tasks.projectId eq id }.count().toInt()
                    val completedTasks = Tasks.selectAll().where {
                        (Tasks.projectId eq id) and (Tasks.status eq "Done")
                    }.count().toInt()

                    ProjectResponse(
                        id = row[Projects.id],
                        title = row[Projects.title],
                        description = row[Projects.description],
                        status = row[Projects.status],
                        startDate = row[Projects.startDate],
                        endDate = row[Projects.endDate],
                        deadline = row[Projects.deadline],
                        country = row[Projects.country],
                        createdAt = row[Projects.createdAt].toString(),
                        totalTasks = totalTasks,
                        completedTasks = completedTasks
                    )
                }
            }
            call.respond(HttpStatusCode.OK, project)
        }.describe {
            tag("Projects")
            summary = "Update a project"
            operationId = "updateProject"
            parameters {
                path("id") {
                    description = "Project ID"
                    schema = jsonSchema<Int>()
                }
            }
            requestBody {
                description = "Updated project data"
                required = true
                schema = jsonSchema<ProjectRequest>()
            }
            responses {
                HttpStatusCode.OK {
                    description = "Project updated"
                    schema = jsonSchema<ProjectResponse>()
                }
                HttpStatusCode.BadRequest {
                    description = "Invalid request"
                }
                HttpStatusCode.NotFound {
                    description = "Project not found"
                }
            }
        }

        // DELETE /api/projects/{id} - delete project (cascade: tasks, files)
        delete("/{id}") {
            val id = call.parameters["id"]?.toIntOrNull()
                ?: throw IllegalArgumentException("Invalid project ID")

            dbQuery {
                // Delete uploaded files from disk
                val files = ProjectFiles.selectAll().where { ProjectFiles.projectId eq id }.map {
                    it[ProjectFiles.fileName]
                }
                files.forEach { fileName ->
                    val file = File("uploads/$fileName")
                    if (file.exists()) file.delete()
                }

                // Delete from database
                ProjectFiles.deleteWhere { projectId eq id }
                Tasks.deleteWhere { projectId eq id }
                val deleted = Projects.deleteWhere { Projects.id eq id }
                if (deleted == 0) throw NoSuchElementException("Project not found with id: $id")
            }

            call.respond(HttpStatusCode.NoContent)
        }.describe {
            tag("Projects")
            summary = "Delete a project"
            description = "Deletes the project and all associated tasks and files."
            operationId = "deleteProject"
            parameters {
                path("id") {
                    description = "Project ID"
                    schema = jsonSchema<Int>()
                }
            }
            responses {
                HttpStatusCode.NoContent {
                    description = "Project deleted"
                }
                HttpStatusCode.BadRequest {
                    description = "Invalid project ID"
                }
                HttpStatusCode.NotFound {
                    description = "Project not found"
                }
            }
        }
    }
}
