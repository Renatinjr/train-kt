package com.renato.trainkt.util

/** Picks JSON vs. plain-text parsing by content (leading `{` ⇒ JSON). */
object ImportParser {
    fun parseAuto(raw: String): ImportResult {
        val trimmed = raw.trim()
        if (trimmed.isEmpty()) return ImportResult.Error("Nothing to import.")
        return if (trimmed.startsWith("{")) JsonParser.parse(trimmed) else TextParser.parse(trimmed)
    }
}
