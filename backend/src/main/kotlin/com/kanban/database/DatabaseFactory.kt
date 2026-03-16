package com.kanban.database

import io.ktor.server.application.*
import kotlinx.coroutines.Dispatchers
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.experimental.newSuspendedTransaction
import org.jetbrains.exposed.sql.transactions.transaction

object DatabaseFactory {
    fun init(environment: ApplicationEnvironment) {
        val url = environment.config.property("database.url").getString()
        val driver = environment.config.property("database.driver").getString()
        val user = environment.config.property("database.user").getString()
        val password = environment.config.property("database.password").getString()

        val database = Database.connect(
            url = url,
            driver = driver,
            user = user,
            password = password
        )

        transaction(database) {
            SchemaUtils.create(Projects, Tasks, ProjectFiles)
        }
    }

    suspend fun <T> dbQuery(block: suspend () -> T): T =
        newSuspendedTransaction(Dispatchers.IO) { block() }
}
