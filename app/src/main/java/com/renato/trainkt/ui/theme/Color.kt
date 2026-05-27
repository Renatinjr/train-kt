package com.renato.trainkt.ui.theme

import androidx.compose.ui.graphics.Color

// --- Core dark palette (from the product spec) ---
val BackgroundDark = Color(0xFF0A0A0F)
val SurfaceDark = Color(0xFF18181F)
val SurfaceElevated = Color(0xFF202028)
val BorderSubtle = Color(0x14FFFFFF)        // rgba(255,255,255,0.08)
val TextPrimary = Color(0xFFF0F0F5)
val TextSecondary = Color(0xFF888896)
val TextMuted = Color(0xFF55555F)

// Default accent (used when a day has no color yet) and edit-mode / alternatives amber.
val AccentDefault = Color(0xFF4A9EFF)
val Amber = Color(0xFFE0A53D)
val DangerRed = Color(0xFFE05656)

// Curated palette offered in the per-day color picker.
val DayColorPalette = listOf(
    "#4a9eff", // blue
    "#2dd4a0", // teal
    "#e0a53d", // amber
    "#e05656", // red
    "#a974ff", // purple
    "#ff7eb6", // pink
    "#5ad1e8", // cyan
    "#9ccc4a", // lime
    "#ff9d4a", // orange
    "#8891a0", // slate
)
