package com.renato.trainkt.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.renato.trainkt.ui.theme.LocalTrainColors
import com.renato.trainkt.ui.theme.TextPrimary

/** Small colored category badge (e.g. "Compound", "Priority"). */
@Composable
fun BadgePill(
    label: String,
    accent: Color,
    modifier: Modifier = Modifier,
) {
    if (label.isBlank()) return
    Text(
        text = label.uppercase(),
        style = androidx.compose.material3.MaterialTheme.typography.labelSmall,
        color = accent,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis,
        modifier = modifier
            .clip(RoundedCornerShape(6.dp))
            .background(accent.copy(alpha = 0.16f))
            .padding(horizontal = 8.dp, vertical = 4.dp),
    )
}

/** Neutral pill used for sets / reps / rest. */
@Composable
fun InfoPill(
    text: String,
    modifier: Modifier = Modifier,
    contentColor: Color = TextPrimary,
) {
    if (text.isBlank()) return
    val colors = LocalTrainColors.current
    Text(
        text = text,
        style = androidx.compose.material3.MaterialTheme.typography.labelLarge,
        color = contentColor,
        maxLines = 1,
        overflow = TextOverflow.Ellipsis,
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(colors.surfaceElevated)
            .padding(horizontal = 10.dp, vertical = 5.dp),
    )
}
