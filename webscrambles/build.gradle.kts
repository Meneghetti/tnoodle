import configurations.CompilerSettings.KOTLIN_JVM_TARGET
import configurations.FileUtils.symlink
import configurations.Frameworks.configureJUnit5
import configurations.Languages.attachRemoteRepositories
import configurations.ProjectVersions.gitVersionTag

import dependencies.Libraries.APACHE_COMMONS_LANG3
import dependencies.Libraries.BATIK_TRANSCODER
import dependencies.Libraries.BOUNCYCASTLE
import dependencies.Libraries.ITEXTPDF
import dependencies.Libraries.KOTLIN_ARGPARSER
import dependencies.Libraries.MARKDOWNJ_CORE
import dependencies.Libraries.SNAKEYAML
import dependencies.Libraries.SYSTEM_TRAY
import dependencies.Libraries.TESTING_MOCKK
import dependencies.Libraries.ZIP4J

import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

description = "An extension over the core server to provide a user-friendly UI. Also draws PDFs."

attachRemoteRepositories()

buildscript {
    repositories {
        maven(url = "$rootDir/gradle/repository")
    }

    dependencies {
        classpath(WCA_I18N)
    }
}

plugins {
    kotlin("jvm")
    application
    SHADOW
    GIT_VERSION_TAG
    KOTLIN_SERIALIZATION
}

dependencies {
    implementation(kotlin("stdlib-jdk8"))

    implementation(project(":tnoodle-server"))

    implementation(ZIP4J)
    implementation(MARKDOWNJ_CORE)
    implementation(ITEXTPDF)
    implementation(BATIK_TRANSCODER)
    implementation(SNAKEYAML)
    implementation(KOTLIN_ARGPARSER)
    implementation(SYSTEM_TRAY)
    implementation(APACHE_COMMONS_LANG3)

    runtimeOnly(BOUNCYCASTLE)
    runtimeOnly(project(":tnoodle-ui"))

    testImplementation(TESTING_MOCKK)
}

configureJUnit5()

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = KOTLIN_JVM_TARGET
}

application {
    mainClassName = "org.worldcubeassociation.tnoodle.server.webscrambles.WebscramblesServer"
}

tasks.create<JavaExec>("i18nCheck") {
    val i18nDir = "$projectDir/src/main/resources/i18n"
    val baseFile = file("$i18nDir/en.yml")

    val ymlFiles = fileTree(i18nDir).files - baseFile

    main = "JarMain" // Warbler gives *fantastic* class names to the jruby bundles :/
    classpath = buildscript.configurations["classpath"]

    setArgs(listOf(baseFile) + ymlFiles)
}

tasks.getByName("check") {
    dependsOn("i18nCheck")
}

tasks.create("registerManifest") {
    tasks.withType<Jar> {
        dependsOn("registerManifest")
    }

    doLast {
        tasks.withType<Jar> {
            manifest {
                val tnoodleTitle = project.findProperty("TNOODLE_IMPL")
                    ?: "TNoodle-LOCAL"

                val tnoodleVersion = project.findProperty("TNOODLE_VERSION")
                    ?: "devel-${project.gitVersionTag()}"

                attributes(
                    "Implementation-Title" to tnoodleTitle,
                    "Implementation-Version" to tnoodleVersion
                )
            }
        }
    }
}

tasks.getByName("shadowJar") {
    doLast {
        val targetProject = project.name

        val originFile = file("$buildDir/libs/$targetProject-$version-all.jar")
        val targetLn = rootProject.file("TNoodle-Docker-latest.jar")

        val created = symlink(targetLn, originFile)

        if (!created) {
            logger.warn("Unable to (re-)create symlink for Docker container! Building a Docker image might result in out-of-date deployments")
        }
    }
}
