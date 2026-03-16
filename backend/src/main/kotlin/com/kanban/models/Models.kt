package com.kanban.models

import kotlinx.serialization.Serializable

@Serializable
data class ProjectRequest(
    val title: String,
    val description: String? = null,
    val status: String? = null,
    val startDate: String? = null,
    val endDate: String? = null,
    val deadline: String? = null,
    val country: String? = null
)

@Serializable
data class ProjectResponse(
    val id: Int,
    val title: String,
    val description: String?,
    val status: String,
    val startDate: String?,
    val endDate: String?,
    val deadline: String?,
    val country: String?,
    val createdAt: String,
    val totalTasks: Int = 0,
    val completedTasks: Int = 0
)

@Serializable
data class TaskRequest(
    val title: String,
    val description: String? = null,
    val status: String? = null,
    val startDate: String? = null,
    val endDate: String? = null
)

@Serializable
data class TaskResponse(
    val id: Int,
    val projectId: Int,
    val title: String,
    val description: String?,
    val status: String,
    val startDate: String?,
    val endDate: String?,
    val createdAt: String
)

@Serializable
data class ProjectFileResponse(
    val id: Int,
    val projectId: Int,
    val fileName: String,
    val originalName: String,
    val contentType: String?,
    val uploadedAt: String
)
