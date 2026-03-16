plugins {
    alias(libs.plugins.ktor)
    id("org.jetbrains.kotlin.jvm") version "2.3.0"
    id("org.jetbrains.kotlin.plugin.serialization") version "2.3.0"
}

group = "com.kanban"
version = "0.0.1"

application {
    mainClass.set("com.kanban.ApplicationKt")
}

dependencies {
    implementation(libs.server.core)
    implementation(libs.server.netty)
    implementation(libs.server.contentNegotiation)
    implementation(libs.serialization.kotlinx.json)
    implementation(libs.server.config.yaml)
    implementation(libs.server.cors)
    implementation(libs.server.statusPages)
    implementation(libs.server.openapi)
    implementation(libs.server.swagger)
    implementation(libs.server.routingOpenapi)

    implementation("ch.qos.logback:logback-classic:1.5.18")

    implementation("org.jetbrains.exposed:exposed-core:0.61.0")
    implementation("org.jetbrains.exposed:exposed-dao:0.61.0")
    implementation("org.jetbrains.exposed:exposed-jdbc:0.61.0")
    implementation("org.jetbrains.exposed:exposed-kotlin-datetime:0.61.0")

    implementation("com.h2database:h2:2.3.232")
}
