package com.renato.trainkt.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.renato.trainkt.ui.theme.LocalTrainColors
import com.renato.trainkt.ui.theme.toAccentColor

/** One column in the [WeekStrip]: a weekday and either a workout day or a rest label. */
data class WeekDayCell(
    val weekdayLabel: String,   // "Mon"
    val workoutName: String?,   // null ⇒ rest day
    val accentHex: String?,
    val isToday: Boolean,
    val dayId: String?,
)

/** Horizontal week calendar; today gets an accent ring, rest days are muted. */
@Composable
fun WeekStrip(
    cells: List<WeekDayCell>,
    onClick: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = LocalTrainColors.current
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        cells.forEach { cell ->
            val accent = cell.accentHex.toAccentColor()
            val isWorkout = cell.workoutName != null
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(10.dp))
                    .background(
                        if (cell.isToday) accent.copy(alpha = 0.12f)
                        else MaterialTheme.colorScheme.surface
                    )
                    .border(
                        width = 1.dp,
                        color = if (cell.isToday) accent else colors.border,
                        shape = RoundedCornerShape(10.dp),
                    )
                    .clickable(enabled = isWorkout && cell.dayId != null) {
                        cell.dayId?.let(onClick)
                    }
                    .padding(vertical = 8.dp, horizontal = 2.dp),
            ) {
                Text(
                    text = cell.weekdayLabel,
                    style = MaterialTheme.typography.labelSmall,
                    color = if (cell.isToday) accent else colors.textMuted,
                )
                Spacer(Modifier.size(6.dp))
                if (isWorkout) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(accent),
                    )
                    Spacer(Modifier.size(4.dp))
                    Text(
                        text = cell.workoutName!!,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurface,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        textAlign = TextAlign.Center,
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .border(1.dp, colors.textMuted, CircleShape),
                    )
                    Spacer(Modifier.size(4.dp))
                    Text(
                        text = "Rest",
                        style = MaterialTheme.typography.labelSmall,
                        color = colors.textMuted,
                    )
                }
            }
        }
    }
}
