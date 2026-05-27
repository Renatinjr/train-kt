package com.renato.trainkt.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.unit.dp
import com.renato.trainkt.data.model.ExerciseDetail
import com.renato.trainkt.ui.theme.LocalTrainColors
import com.renato.trainkt.ui.theme.toAccentColor

/**
 * Expandable exercise card. In view mode it expands to show tip, variations, alternatives
 * and the set counter. In [editMode] it collapses to a name row with reorder / edit / delete controls.
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ExerciseCard(
    detail: ExerciseDetail,
    accent: Color,
    completedSets: Set<Int>,
    onToggleSet: (Int) -> Unit,
    modifier: Modifier = Modifier,
    editMode: Boolean = false,
    canMoveUp: Boolean = false,
    canMoveDown: Boolean = false,
    onEdit: () -> Unit = {},
    onDelete: () -> Unit = {},
    onMoveUp: () -> Unit = {},
    onMoveDown: () -> Unit = {},
) {
    val colors = LocalTrainColors.current
    val exercise = detail.exercise
    val badgeAccent = exercise.badgeColor.toAccentColor(accent)
    var expanded by remember { mutableStateOf(false) }

    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(MaterialTheme.colorScheme.surface)
            .border(1.dp, colors.border, RoundedCornerShape(12.dp))
            .animateContentSize()
            .then(if (!editMode) Modifier.clickable { expanded = !expanded } else Modifier)
            .padding(14.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = exercise.name,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                )
                if (exercise.badgeLabel.isNotBlank()) {
                    Spacer(Modifier.size(6.dp))
                    BadgePill(label = exercise.badgeLabel, accent = badgeAccent)
                }
            }
            if (editMode) {
                IconButton(onClick = onMoveUp, enabled = canMoveUp) {
                    Icon(Icons.Filled.KeyboardArrowUp, "Move up", tint = if (canMoveUp) colors.textSecondary else colors.textMuted)
                }
                IconButton(onClick = onMoveDown, enabled = canMoveDown) {
                    Icon(Icons.Filled.KeyboardArrowDown, "Move down", tint = if (canMoveDown) colors.textSecondary else colors.textMuted)
                }
                IconButton(onClick = onEdit) {
                    Icon(Icons.Filled.Edit, "Edit", tint = accent)
                }
                IconButton(onClick = onDelete) {
                    Icon(Icons.Filled.Delete, "Delete", tint = colors.danger)
                }
            } else {
                Icon(
                    imageVector = if (expanded) Icons.Filled.ExpandLess else Icons.Filled.ExpandMore,
                    contentDescription = if (expanded) "Collapse" else "Expand",
                    tint = colors.textSecondary,
                )
            }
        }

        if (!editMode) {
            Spacer(Modifier.size(10.dp))
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                InfoPill(exercise.sets)
                InfoPill(exercise.reps)
                InfoPill(exercise.rest)
            }

            AnimatedVisibility(visible = expanded) {
                Column {
                    if (exercise.tip.isNotBlank()) {
                        Spacer(Modifier.size(12.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(colors.surfaceElevated)
                                .padding(12.dp),
                        ) {
                            Text(
                                text = exercise.tip,
                                style = MaterialTheme.typography.bodyMedium.copy(fontStyle = FontStyle.Italic),
                                color = colors.textSecondary,
                            )
                        }
                    }

                    val primaries = detail.primaryVariations
                    if (primaries.isNotEmpty()) {
                        Spacer(Modifier.size(12.dp))
                        SectionLabel("Variations")
                        Spacer(Modifier.size(6.dp))
                        primaries.forEach { v -> BulletRow(v.label, accent) }
                    }

                    val alternatives = detail.alternativeVariations.map { it.label }
                    if (alternatives.isNotEmpty()) {
                        Spacer(Modifier.size(12.dp))
                        AlternativesSection(alternatives)
                    }

                    if (exercise.numSets > 0) {
                        Spacer(Modifier.size(14.dp))
                        SectionLabel("Sets")
                        Spacer(Modifier.size(8.dp))
                        SetCounterDots(
                            numSets = exercise.numSets,
                            completed = completedSets,
                            accent = accent,
                            onToggle = onToggleSet,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SectionLabel(text: String) {
    Text(
        text = text.uppercase(),
        style = MaterialTheme.typography.labelSmall,
        color = LocalTrainColors.current.textMuted,
    )
}

@Composable
private fun BulletRow(label: String, accent: Color) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.padding(vertical = 3.dp),
    ) {
        Box(
            modifier = Modifier
                .size(5.dp)
                .clip(CircleShape)
                .background(accent),
        )
        Spacer(Modifier.size(10.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = LocalTrainColors.current.textSecondary,
        )
    }
}
