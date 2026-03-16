pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositories {
        mavenCentral()
    }
    versionCatalogs {
        create("libs") {
            from("io.ktor:ktor-version-catalog:3.4.1")
        }
    }
}

rootProject.name = "kanban-backend"
