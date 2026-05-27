package com.renato.trainkt

import com.renato.trainkt.util.ImportResult
import com.renato.trainkt.util.JsonParser
import com.renato.trainkt.util.TextParser
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ParserTest {

    private val sampleJson = """
        {
          "version": 1,
          "plan": {
            "name": "Push Pull Legs",
            "description": "6-month aesthetic focus",
            "days": [
              {
                "name": "Push",
                "label": "Day 1",
                "color": "#4a9eff",
                "note": "Chest, shoulders, triceps",
                "sections": [
                  {
                    "title": "Upper Chest — Priority",
                    "exercises": [
                      {
                        "name": "Incline Bench Press",
                        "badge": "Compound",
                        "badgeColor": "#4a9eff",
                        "sets": "3 sets",
                        "reps": "6–8 reps",
                        "rest": "2–3 min rest",
                        "numSets": 3,
                        "tip": "Control the descent.",
                        "variations": [
                          { "label": "Dumbbell incline press", "isAlternative": false },
                          { "label": "Barbell incline press", "isAlternative": false },
                          { "label": "Incline machine press", "isAlternative": true },
                          { "label": "High-to-low cable fly", "isAlternative": true }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
    """.trimIndent()

    private val sampleText = """
        PLAN: My Workout
        DAY: Push | color:#4a9eff
        SECTION: Chest
        - Incline Bench Press | 3 sets | 6-8 reps | 2 min rest
          ALT: Incline machine press
          ALT: Cable fly high to low
        SECTION: Shoulders
        - Lateral Raise | 3 sets | 10-12 reps | 1 min rest
        DAY: Pull | color:#2dd4a0
        SECTION: Back Width
        - Pull-up | 3 sets | 6-8 reps | 2-3 min rest
    """.trimIndent()

    @Test
    fun jsonParse_buildsExpectedTree() {
        val result = JsonParser.parse(sampleJson)
        assertTrue(result is ImportResult.Success)
        val plan = (result as ImportResult.Success).plan
        assertEquals("Push Pull Legs", plan.plan.name)
        assertEquals(1, plan.days.size)
        val day = plan.days.first()
        assertEquals(1, day.sections.size)
        val exercise = day.sections.first().exercises.first()
        assertEquals("Incline Bench Press", exercise.exercise.name)
        assertEquals(3, exercise.exercise.numSets)
        assertEquals(4, exercise.variations.size)
        assertEquals(2, exercise.primaryVariations.size)
        assertEquals(2, exercise.alternativeVariations.size)
    }

    @Test
    fun textParse_buildsDaysSectionsAndAlternatives() {
        val result = TextParser.parse(sampleText)
        assertTrue(result is ImportResult.Success)
        val plan = (result as ImportResult.Success).plan
        assertEquals("My Workout", plan.plan.name)
        assertEquals(2, plan.days.size)

        val push = plan.days[0]
        assertEquals("Push", push.day.name)
        assertEquals("#4a9eff", push.day.colorHex)
        assertEquals(2, push.sections.size)

        val incline = push.sections[0].exercises.first()
        assertEquals(3, incline.exercise.numSets)
        assertEquals(2, incline.alternativeVariations.size)

        assertEquals("Pull", plan.days[1].day.name)
    }

    @Test
    fun jsonParse_emptyPayload_returnsError() {
        assertTrue(JsonParser.parse("") is ImportResult.Error)
        assertTrue(JsonParser.parse("{ not json") is ImportResult.Error)
    }
}
