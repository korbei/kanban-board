package com.kanban

import com.kanban.database.DatabaseFactory
import com.kanban.plugins.configureCORS
import com.kanban.plugins.configureRouting
import com.kanban.plugins.configureSerialization
import io.ktor.server.application.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    DatabaseFactory.init(environment)
    configureSerialization()
    configureCORS()
    configureRouting()
}
