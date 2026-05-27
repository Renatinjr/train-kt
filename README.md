# TrainKT

A native Android workout tracker (Kotlin + Jetpack Compose) that ships with **zero
pre-defined data**. You build your own split — plans, days, sections, exercises, variations —
by hand or by importing a JSON / plain-text file you wrote yourself.

## Stack

Kotlin · Jetpack Compose (Material 3) · MVVM + Repository · Room · Hilt · Compose Navigation ·
DataStore · Kotlinx Serialization · Storage Access Framework. Dark-first theme. `minSdk 26`,
`compileSdk 35`.

## Features

- Create plans with multiple days, sections and exercises; reorder and edit inline.
- Per-exercise primary variations + collapsible "gym is busy" alternatives.
- In-memory set counter (tap dots to mark sets done; resets when you leave the day).
- Multiple plans, exactly one active at a time.
- Week schedule (which weekday is "Day 1", 4- vs 5-day weeks) → today's workout is highlighted.
- Import from a JSON **or** plain-text file (SAF picker) or by pasting text, with a preview.
- Export a plan to JSON (share sheet or copy to clipboard).

## Build & run

The project uses the Gradle wrapper. An Android SDK and JDK 17+ are required; this machine
uses the asdf-managed Temurin 21:

```bash
export JAVA_HOME=/home/renatojr/.asdf/installs/java/adoptopenjdk-21.0.10+7.0.LTS
./gradlew assembleDebug        # builds app/build/outputs/apk/debug/app-debug.apk
./gradlew testDebugUnitTest    # parser unit tests
```

The SDK path is pinned in `local.properties` (`sdk.dir=~/Android/Sdk`). To run it, open the
project in Android Studio and launch on a device/emulator, or `adb install` the debug APK.
(No emulator AVD/system image is installed on this machine, so the app can't be launched
headless from the CLI here.)

## Import formats

### JSON

```json
{
  "version": 1,
  "plan": {
    "name": "Push Pull Legs",
    "description": "6-month aesthetic focus",
    "days": [
      {
        "name": "Push", "label": "Day 1", "color": "#4a9eff", "note": "Chest, shoulders, triceps",
        "sections": [
          {
            "title": "Upper Chest — Priority",
            "exercises": [
              {
                "name": "Incline Bench Press", "badge": "Compound", "badgeColor": "#4a9eff",
                "sets": "3 sets", "reps": "6–8 reps", "rest": "2–3 min rest", "numSets": 3,
                "tip": "Control the descent 2–3 sec.",
                "variations": [
                  { "label": "Dumbbell incline press", "isAlternative": false },
                  { "label": "Incline machine press", "isAlternative": true }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### Plain text

```
PLAN: My Workout
DAY: Push | color:#4a9eff
SECTION: Chest
- Incline Bench Press | 3 sets | 6-8 reps | 2 min rest
  ALT: Incline machine press
SECTION: Shoulders
- Lateral Raise | 3 sets | 10-12 reps | 1 min rest
DAY: Pull | color:#2dd4a0
SECTION: Back Width
- Pull-up | 3 sets | 6-8 reps | 2-3 min rest
```

`numSets` (the set-counter dot count) is parsed from the leading number in the `sets` field.
The importer auto-detects JSON vs. text by the leading `{`.

## Module layout

```
app/src/main/java/com/renato/trainkt/
  data/{db/{entities,dao,relations}, model, repository}   # Room, domain tree, DTOs, repos
  util/                                                   # JsonParser, TextParser, FileUtils, ScheduleCalc
  ui/{theme, navigation, components, home, plan, day, exercise, importexport, schedule}
  di/AppModule.kt                                         # Hilt
```

Not yet implemented (deferred): drag-and-drop reordering, rest-countdown timer, exercise
history log, cross-plan search, QR import/export.
