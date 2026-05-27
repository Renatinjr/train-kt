package com.renato.trainkt.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Human-writable JSON shape for import/export (see the product spec). All fields carry
 * defaults so a hand-crafted file with omissions still parses; validation happens in
 * [com.renato.trainkt.util.JsonParser].
 */
@Serializable
data class PlanFileDto(
    val version: Int = 1,
    val plan: PlanDto,
)

@Serializable
data class PlanDto(
    val name: String = "",
    val description: String = "",
    val days: List<DayDto> = emptyList(),
)

@Serializable
data class DayDto(
    val name: String = "",
    val label: String = "",
    val color: String = "",
    val note: String = "",
    val sections: List<SectionDto> = emptyList(),
)

@Serializable
data class SectionDto(
    val title: String = "",
    val exercises: List<ExerciseDto> = emptyList(),
)

@Serializable
data class ExerciseDto(
    val name: String = "",
    val badge: String = "",
    val badgeColor: String = "",
    val sets: String = "",
    val reps: String = "",
    val rest: String = "",
    val numSets: Int = 0,
    val tip: String = "",
    val variations: List<VariationDto> = emptyList(),
)

@Serializable
data class VariationDto(
    val label: String = "",
    @SerialName("isAlternative") val isAlternative: Boolean = false,
)
