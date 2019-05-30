import configurations.Languages.attachRemoteRepositories
import configurations.Languages.configureJava

import dependencies.Versions.GWT

import dependencies.Libraries.GWT_USER

import org.wisepersist.gradle.plugins.gwt.Style

description = "Compiles the scramble java code to javascript using GWT."

attachRemoteRepositories()

plugins {
    java
    GWT
}

configureJava()

dependencies {
    implementation(project(":scrambles"))
    implementation(project(":utils"))

    implementation(GWT_USER)

    gwt(files("$projectDir/src/main/java"))

    val dependentSourceProjects = listOf("scrambles", "svglite", "utils", "min2phase", "sq12phase", "threephase")

    for (depProject in dependentSourceProjects) {
        gwt(files("$rootDir/$depProject/src/main/java"))
    }
}

gwt {
    gwtVersion = GWT

    modules("scrambles")

    compiler.strict = true
    compiler.style = Style.PRETTY
}