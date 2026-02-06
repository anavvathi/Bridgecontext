plugins {
    id("java")
    id("org.jetbrains.kotlin.jvm") version "2.0.0"
    id("org.jetbrains.intellij.platform") version "2.0.1"
}

group = "com.bridgecontext"
version = "1.0.0"

repositories {
    mavenCentral()
    intellijPlatform {
        defaultRepositories()
    }
}

dependencies {
    intellijPlatform {
        intellijIdeaCommunity("2023.2")
        bundledPlugin("com.intellij.java")
        instrumentationTools()
    }
}

intellijPlatform {
    projectName.set("BridgeContext")
    pluginConfiguration {
        id.set("com.bridgecontext")
        name.set("BridgeContext")
        version.set("1.0.0")
    }
}

tasks {
    patchPluginXml {
        sinceBuild.set("232")
        untilBuild.set("242.*")
    }
}
