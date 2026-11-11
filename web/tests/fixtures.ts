// Same fixtures as app/src/test/java/com/renato/trainkt/ParserTest.kt
export const sampleJson = `{
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
}`;

export const sampleText = `PLAN: My Workout
DAY: Push | color:#4a9eff
SECTION: Chest
- Incline Bench Press | 3 sets | 6-8 reps | 2 min rest
  ALT: Incline machine press
  ALT: Cable fly high to low
SECTION: Shoulders
- Lateral Raise | 3 sets | 10-12 reps | 1 min rest
DAY: Pull | color:#2dd4a0
SECTION: Back Width
- Pull-up | 3 sets | 6-8 reps | 2-3 min rest`;
