package com.kanban.routes

import com.kanban.database.DatabaseFactory.dbQuery
import com.kanban.database.ProjectFiles
import com.kanban.database.Projects
import com.kanban.models.ProjectFileResponse
import io.ktor.http.*
import io.ktor.http.content.*
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
import java.util.UUID

fun Route.fileRoutes() {
    // POST /api/projects/{id}/files - upload file(s)
    post("/projects/{id}/files") {
        val projectId = call.parameters["id"]?.toIntOrNull()
            ?: throw IllegalArgumentException("Invalid project ID")

        // Verify project exists
        dbQuery {
            Projects.selectAll().where { Projects.id eq projectId }.singleOrNull()
                ?: throw NoSuchElementException("Project not found with id: $projectId")
        }

        val uploadsDir = File("uploads")
        if (!uploadsDir.exists()) uploadsDir.mkdirs()

        val multipartData = call.receiveMultipart()
        val uploadedFiles = mutableListOf<ProjectFileResponse>()
        val now = Clock.System.now().toLocalDateTime(TimeZone.UTC)

        multipartData.forEachPart { part ->
            when (part) {
                is PartData.FileItem -> {
                    val originalName = part.originalFileName ?: "unknown"
                    val extension = originalName.substringAfterLast('.', "")
                    val storedName = "${UUID.randomUUID()}${if (extension.isNotEmpty()) ".$extension" else ""}"
                    val contentType = part.contentType?.toString()

                    val file = File(uploadsDir, storedName)
                    part.streamProvider().use { input ->
                        file.outputStream().buffered().use { output ->
                            input.copyTo(output)
                        }
                    }

                    val fileResponse = dbQuery {
                        val insertStatement = ProjectFiles.insert {
                            it[ProjectFiles.projectId] = projectId
                            it[fileName] = storedName
                            it[ProjectFiles.originalName] = originalName
                            it[ProjectFiles.contentType] = contentType
                            it[uploadedAt] = now
                        }
                        val row = insertStatement.resultedValues!!.first()
                        ProjectFileResponse(
                            id = row[ProjectFiles.id],
                            projectId = row[ProjectFiles.projectId],
                            fileName = row[ProjectFiles.fileName],
                            originalName = row[ProjectFiles.originalName],
                            contentType = row[ProjectFiles.contentType],
                            uploadedAt = row[ProjectFiles.uploadedAt].toString()
                        )
                    }
                    uploadedFiles.add(fileResponse)
                }
                else -> {}
            }
            part.dispose()
        }

        call.respond(HttpStatusCode.Created, uploadedFiles)
    }.describe {
        tag("Files")
        summary = "Upload files to a project"
        description = "Upload one or more files as multipart form data."
        operationId = "uploadProjectFiles"
        parameters {
            path("id") {
                description = "Project ID"
                schema = jsonSchema<Int>()
            }
        }
        responses {
            HttpStatusCode.Created {
                description = "Files uploaded"
                schema = jsonSchema<List<ProjectFileResponse>>()
            }
            HttpStatusCode.BadRequest {
                description = "Invalid project ID"
            }
            HttpStatusCode.NotFound {
                description = "Project not found"
            }
        }
    }

    // GET /api/projects/{id}/files - list project files
    get("/projects/{id}/files") {
        val projectId = call.parameters["id"]?.toIntOrNull()
            ?: throw IllegalArgumentException("Invalid project ID")

        val files = dbQuery {
            ProjectFiles.selectAll().where { ProjectFiles.projectId eq projectId }.map { row ->
                ProjectFileResponse(
                    id = row[ProjectFiles.id],
                    projectId = row[ProjectFiles.projectId],
                    fileName = row[ProjectFiles.fileName],
                    originalName = row[ProjectFiles.originalName],
                    contentType = row[ProjectFiles.contentType],
                    uploadedAt = row[ProjectFiles.uploadedAt].toString()
                )
            }
        }
        call.respond(HttpStatusCode.OK, files)
    }.describe {
        tag("Files")
        summary = "List files for a project"
        operationId = "listProjectFiles"
        parameters {
            path("id") {
                description = "Project ID"
                schema = jsonSchema<Int>()
            }
        }
        responses {
            HttpStatusCode.OK {
                description = "List of project files"
                schema = jsonSchema<List<ProjectFileResponse>>()
            }
            HttpStatusCode.BadRequest {
                description = "Invalid project ID"
            }
        }
    }

    // GET /api/files/{id}/download - download a file
    get("/files/{id}/download") {
        val id = call.parameters["id"]?.toIntOrNull()
            ?: throw IllegalArgumentException("Invalid file ID")

        val fileRecord = dbQuery {
            ProjectFiles.selectAll().where { ProjectFiles.id eq id }.singleOrNull()
        } ?: throw NoSuchElementException("File not found with id: $id")

        val storedName = fileRecord[ProjectFiles.fileName]
        val originalName = fileRecord[ProjectFiles.originalName]

        val file = File("uploads/$storedName")
        if (!file.exists()) throw NoSuchElementException("File not found on disk: $originalName")

        call.response.header(
            HttpHeaders.ContentDisposition,
            ContentDisposition.Attachment.withParameter(ContentDisposition.Parameters.FileName, originalName).toString()
        )
        call.respondFile(file)
    }.describe {
        tag("Files")
        summary = "Download a file"
        operationId = "downloadFile"
        parameters {
            path("id") {
                description = "File ID"
                schema = jsonSchema<Int>()
            }
        }
        responses {
            HttpStatusCode.OK {
                description = "File content"
            }
            HttpStatusCode.BadRequest {
                description = "Invalid file ID"
            }
            HttpStatusCode.NotFound {
                description = "File not found"
            }
        }
    }

    // DELETE /api/files/{id} - delete a file
    delete("/files/{id}") {
        val id = call.parameters["id"]?.toIntOrNull()
            ?: throw IllegalArgumentException("Invalid file ID")

        val fileRecord = dbQuery {
            ProjectFiles.selectAll().where { ProjectFiles.id eq id }.singleOrNull()
        } ?: throw NoSuchElementException("File not found with id: $id")

        val storedName = fileRecord[ProjectFiles.fileName]

        // Delete from disk
        val file = File("uploads/$storedName")
        if (file.exists()) file.delete()

        // Delete from database
        dbQuery {
            ProjectFiles.deleteWhere { ProjectFiles.id eq id }
        }

        call.respond(HttpStatusCode.NoContent)
    }.describe {
        tag("Files")
        summary = "Delete a file"
        operationId = "deleteFile"
        parameters {
            path("id") {
                description = "File ID"
                schema = jsonSchema<Int>()
            }
        }
        responses {
            HttpStatusCode.NoContent {
                description = "File deleted"
            }
            HttpStatusCode.BadRequest {
                description = "Invalid file ID"
            }
            HttpStatusCode.NotFound {
                description = "File not found"
            }
        }
    }
}
