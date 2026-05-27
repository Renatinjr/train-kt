package com.renato.trainkt.util

import com.renato.trainkt.data.model.DayDto
import com.renato.trainkt.data.model.ExerciseDto
import com.renato.trainkt.data.model.PlanDto
import com.renato.trainkt.data.model.PlanFileDto
import com.renato.trainkt.data.model.SectionDto
import com.renato.trainkt.data.model.VariationDto
import com.renato.trainkt.data.model.toPlanDetail

/**
 * Parses the simplified line-based plan format:
 *
 * ```
 * PLAN: My Workout
 * DAY: Push | color:#4a9eff
 * SECTION: Chest
 * - Incline Bench Press | 3 sets | 6-8 reps | 2 min rest
 *   ALT: Incline machine press
 * ```
 *
 * Reuses [PlanFileDto] + [toPlanDetail] so JSON and text imports converge on one path.
 */
object TextParser {

    private val numberRegex = Regex("""\d+""")

    fun parse(raw: String): ImportResult {
        if (raw.isBlank()) return ImportResult.Error("The text is empty.")

        var planName = ""
        val days = mutableListOf<MutableDay>()

        raw.lineSequence().forEach { rawLine ->
            val line = rawLine.trim()
            if (line.isEmpty()) return@forEach
            when {
                line.startsWith("PLAN:", ignoreCase = true) -> {
                    planName = line.substringAfter(":").trim()
                }

                line.startsWith("DAY:", ignoreCase = true) -> {
                    val body = line.substringAfter(":").trim()
                    val parts = body.split("|").map { it.trim() }
                    val name = parts.firstOrNull().orEmpty()
                    val color = parts.drop(1)
                        .firstOrNull { it.startsWith("color:", ignoreCase = true) }
                        ?.substringAfter(":")?.trim()
                        .orEmpty()
                    days += MutableDay(name = name, color = color)
                }

                line.startsWith("SECTION:", ignoreCase = true) -> {
                    val title = line.substringAfter(":").trim()
                    val day = days.lastOrNull() ?: MutableDay(name = "Day 1").also { days += it }
                    day.sections += MutableSection(title = title)
                }

                line.startsWith("ALT:", ignoreCase = true) -> {
                    val label = line.substringAfter(":").trim()
                    days.lastOrNull()?.sections?.lastOrNull()?.exercises?.lastOrNull()
                        ?.variations?.add(VariationDto(label = label, isAlternative = true))
                }

                line.startsWith("-") -> {
                    val body = line.removePrefix("-").trim()
                    val parts = body.split("|").map { it.trim() }
                    val name = parts.getOrNull(0).orEmpty()
                    val sets = parts.getOrNull(1).orEmpty()
                    val reps = parts.getOrNull(2).orEmpty()
                    val rest = parts.getOrNull(3).orEmpty()
                    val numSets = numberRegex.find(sets)?.value?.toIntOrNull() ?: 0
                    val day = days.lastOrNull() ?: MutableDay(name = "Day 1").also { days += it }
                    val section = day.sections.lastOrNull()
                        ?: MutableSection(title = "Exercises").also { day.sections += it }
                    section.exercises += MutableExercise(name, sets, reps, rest, numSets)
                }
                // Unknown lines are ignored, keeping the format forgiving.
            }
        }

        if (days.isEmpty()) {
            return ImportResult.Error("No DAY: lines found. Start a day with \"DAY: Name\".")
        }

        val dto = PlanFileDto(
            plan = PlanDto(
                name = planName,
                days = days.map { d ->
                    DayDto(
                        name = d.name,
                        color = d.color,
                        sections = d.sections.map { s ->
                            SectionDto(
                                title = s.title,
                                exercises = s.exercises.map { e ->
                                    ExerciseDto(
                                        name = e.name,
                                        sets = e.sets,
                                        reps = e.reps,
                                        rest = e.rest,
                                        numSets = e.numSets,
                                        variations = e.variations,
                                    )
                                },
                            )
                        },
                    )
                },
            ),
        )
        return ImportResult.Success(dto.toPlanDetail())
    }

    private class MutableDay(
        val name: String,
        val color: String = "",
        val sections: MutableList<MutableSection> = mutableListOf(),
    )

    private class MutableSection(
        val title: String,
        val exercises: MutableList<MutableExercise> = mutableListOf(),
    )

    private class MutableExercise(
        val name: String,
        val sets: String,
        val reps: String,
        val rest: String,
        val numSets: Int,
        val variations: MutableList<VariationDto> = mutableListOf(),
    )
}
