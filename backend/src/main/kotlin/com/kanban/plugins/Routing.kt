package com.kanban.plugins

import com.kanban.routes.fileRoutes
import com.kanban.routes.projectRoutes
import com.kanban.routes.taskRoutes
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.plugins.openapi.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.plugins.swagger.*
import io.ktor.server.http.content.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.server.routing.openapi.*
import io.ktor.openapi.*

fun Application.configureRouting() {
    install(StatusPages) {
        exception<IllegalArgumentException> { call, cause ->
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to (cause.message ?: "Bad request")))
        }
        exception<NoSuchElementException> { call, cause ->
            call.respond(HttpStatusCode.NotFound, mapOf("error" to (cause.message ?: "Not found")))
        }
        exception<Throwable> { call, cause ->
            call.respond(
                HttpStatusCode.InternalServerError,
                mapOf("error" to (cause.message ?: "Internal server error"))
            )
        }
    }

    routing {
        swaggerUI("swagger") {
            info = OpenApiInfo("Kanban Board API", "1.0.0")
            source = OpenApiDocSource.Routing()
        }

        route("/api") {
            projectRoutes()
            taskRoutes()
            fileRoutes()
        }

        // Serve frontend static files (for Docker / production)
        staticFiles("/", java.io.File("static")) {
            default("index.html")
        }
    }
}
