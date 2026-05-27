package com.renato.trainkt.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

/**
 * Extended palette not covered by Material3's [androidx.compose.material3.ColorScheme].
 * Exposed through [LocalTrainColors] so any composable can reach the spec's exact tones.
 */
@Immutable
data class TrainColors(
    val border: Color = BorderSubtle,
    val textSecondary: Color = TextSecondary,
    val textMuted: Color = TextMuted,
    val surfaceElevated: Color = SurfaceElevated,
    val amber: Color = Amber,
    val danger: Color = DangerRed,
)

val LocalTrainColors = staticCompositionLocalOf { TrainColors() }

private val DarkColorScheme = darkColorScheme(
    primary = AccentDefault,
    onPrimary = Color.White,
    background = BackgroundDark,
    onBackground = TextPrimary,
    surface = SurfaceDark,
    onSurface = TextPrimary,
    surfaceVariant = SurfaceElevated,
    onSurfaceVariant = TextSecondary,
    error = DangerRed,
    outline = TextMuted,
)

@Composable
fun TrainKtTheme(content: @Composable () -> Unit) {
    // Dark-first, single scheme. Dynamic color intentionally left off (spec: optional).
    CompositionLocalProvider(LocalTrainColors provides TrainColors()) {
        MaterialTheme(
            colorScheme = DarkColorScheme,
            typography = Typography,
            content = content,
        )
    }
}
