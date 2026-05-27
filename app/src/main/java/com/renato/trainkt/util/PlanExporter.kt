package com.renato.trainkt.util

import com.renato.trainkt.data.model.PlanDetail
import com.renato.trainkt.data.model.toFileDto
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/** Serializes a stored plan tree to pretty-printed import JSON (round-trips with [JsonParser]). */
object PlanExporter {

    private val json = Json {
        prettyPrint = true
        encodeDefaults = true
    }

    fun toJson(plan: PlanDetail): String = json.encodeToString(plan.toFileDto())

    /** Filesystem-safe base name derived from the plan name, e.g. "Push Pull Legs" -> "push-pull-legs". */
    fun fileName(plan: PlanDetail): String {
        val slug = plan.plan.name.lowercase()
            .replace(Regex("[^a-z0-9]+"), "-")
            .trim('-')
            .ifBlank { "plan" }
        return "$slug.json"
    }
}
