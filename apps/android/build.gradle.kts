// Root build file. Plugin versions are declared here (with apply false) and
// applied per-module in app/build.gradle.kts — the standard AGP/Kotlin DSL setup.
plugins {
    id("com.android.application") version "8.13.2" apply false
    id("org.jetbrains.kotlin.android") version "2.1.20" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.1.20" apply false
    id("org.jetbrains.kotlin.plugin.serialization") version "2.1.20" apply false
}
