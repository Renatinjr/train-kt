package com.renato.trainkt.ui.theme

import androidx.compose.ui.graphics.Color
import androidx.core.graphics.toColorInt

/**
 * Parse a stored hex string ("#RRGGBB" or "#AARRGGBB") into a Compose [Color].
 * Falls back to [AccentDefault] on anything malformed so the UI never crashes on bad data.
 */
fun String?.toAccentColor(fallback: Color = AccentDefault): Color =
    if (this.isNullOrBlank()) fallback
    else runCatching { Color(this.trim().toColorInt()) }.getOrDefault(fallback)
