package com.kanban.database

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.kotlin.datetime.datetime

object Projects : Table("projects") {
    val id = integer("id").autoIncrement()
    val title = varchar("title", 255)
    val description = text("description").nullable()
    val status = varchar("status", 50).default("Active")
    val startDate = varchar("start_date", 30).nullable()
    val endDate = varchar("end_date", 30).nullable()
    val deadline = varchar("deadline", 30).nullable()
    val country = varchar("country", 2).nullable()
    val createdAt = datetime("created_at")

    override val primaryKey = PrimaryKey(id)
}

object Tasks : Table("tasks") {
    val id = integer("id").autoIncrement()
    val projectId = integer("project_id").references(Projects.id)
    val title = varchar("title", 255)
    val description = text("description").nullable()
    val status = varchar("status", 50).default("New")
    val startDate = varchar("start_date", 30).nullable()
    val endDate = varchar("end_date", 30).nullable()
    val createdAt = datetime("created_at")

    override val primaryKey = PrimaryKey(id)
}

object ProjectFiles : Table("project_files") {
    val id = integer("id").autoIncrement()
    val projectId = integer("project_id").references(Projects.id)
    val fileName = varchar("file_name", 500)
    val originalName = varchar("original_name", 500)
    val contentType = varchar("content_type", 255).nullable()
    val uploadedAt = datetime("uploaded_at")

    override val primaryKey = PrimaryKey(id)
}
