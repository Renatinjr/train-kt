package com.renato.trainkt.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.renato.trainkt.ui.theme.LocalTrainColors

/**
 * Row of tappable set dots. [completed] holds the indices the user has marked done;
 * tapping a dot toggles it (fills with [accent] + checkmark, animated).
 */
@Composable
fun SetCounterDots(
    numSets: Int,
    completed: Set<Int>,
    accent: Color,
    onToggle: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    if (numSets <= 0) return
    val colors = LocalTrainColors.current
    Row(
        modifier = modifier,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        repeat(numSets) { index ->
            val done = index in completed
            val fill by animateColorAsState(
                targetValue = if (done) accent else Color.Transparent,
                label = "dotFill",
            )
            val checkScale by animateFloatAsState(
                targetValue = if (done) 1f else 0f,
                label = "checkScale",
            )
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(30.dp)
                    .clip(CircleShape)
                    .background(fill)
                    .border(
                        width = 1.5.dp,
                        color = if (done) accent else colors.border,
                        shape = CircleShape,
                    )
                    .clickable { onToggle(index) },
            ) {
                if (checkScale > 0.01f) {
                    Icon(
                        imageVector = Icons.Filled.Check,
                        contentDescription = "Set ${index + 1} done",
                        tint = Color.White,
                        modifier = Modifier
                            .size(16.dp)
                            .scale(checkScale),
                    )
                } else {
                    Text(
                        text = "${index + 1}",
                        style = androidx.compose.material3.MaterialTheme.typography.labelLarge,
                        color = colors.textSecondary,
                    )
                }
            }
        }
    }
}
