package com.renato.trainkt.util

import com.renato.trainkt.data.model.PlanFileDto
import com.renato.trainkt.data.model.toPlanDetail
import kotlinx.serialization.json.Json

/** Parses the wrapped `{ "version", "plan": { ... } }` import JSON into a [PlanDetail]. */
object JsonParser {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    fun parse(raw: String): ImportResult {
        val text = raw.trim()
        if (text.isEmpty()) return ImportResult.Error("The file is empty.")
        return try {
            val dto = json.decodeFromString<PlanFileDto>(text)
            if (dto.plan.days.isEmpty()) {
                return ImportResult.Error("No workout days found in the JSON. Check the \"days\" array.")
            }
            ImportResult.Success(dto.toPlanDetail())
        } catch (e: Exception) {
            ImportResult.Error("Couldn't parse JSON: ${e.message ?: "invalid format"}")
        }
    }
}
