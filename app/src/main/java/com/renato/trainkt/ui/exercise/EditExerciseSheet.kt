package com.renato.trainkt.ui.exercise

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.toMutableStateList
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.renato.trainkt.data.repository.IdGen
import com.renato.trainkt.ui.components.ColorPickerRow
import com.renato.trainkt.ui.day.EditorTarget
import com.renato.trainkt.ui.day.ExerciseFormResult
import com.renato.trainkt.ui.day.VariationDraft
import com.renato.trainkt.ui.theme.AccentDefault
import com.renato.trainkt.ui.theme.LocalTrainColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditExerciseSheet(
    target: EditorTarget,
    onDismiss: () -> Unit,
    onSubmit: (ExerciseFormResult) -> Unit,
) {
    val colors = LocalTrainColors.current
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val existing = target.existing?.exercise

    var name by remember { mutableStateOf(existing?.name ?: "") }
    var badge by remember { mutableStateOf(existing?.badgeLabel ?: "") }
    var badgeColor by remember { mutableStateOf(existing?.badgeColor?.ifBlank { "#4a9eff" } ?: "#4a9eff") }
    var sets by remember { mutableStateOf(existing?.sets ?: "") }
    var reps by remember { mutableStateOf(existing?.reps ?: "") }
    var rest by remember { mutableStateOf(existing?.rest ?: "") }
    var numSets by remember { mutableIntStateOf(existing?.numSets ?: 3) }
    var tip by remember { mutableStateOf(existing?.tip ?: "") }
    val variations = remember {
        (target.existing?.variations?.map { VariationDraft(it.id, it.label, it.isAlternative) } ?: emptyList())
            .toMutableStateList()
    }

    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .imePadding()
                .padding(horizontal = 20.dp)
                .padding(bottom = 28.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Text(
                text = if (existing == null) "New exercise" else "Edit exercise",
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.onSurface,
            )

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Name") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = badge,
                    onValueChange = { badge = it },
                    label = { Text("Badge (e.g. Compound)") },
                    singleLine = true,
                    modifier = Modifier.weight(1f),
                )
            }
            Text("Badge color", style = MaterialTheme.typography.labelLarge, color = colors.textSecondary)
            ColorPickerRow(selectedHex = badgeColor, onSelect = { badgeColor = it })

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedTextField(
                    value = sets,
                    onValueChange = { sets = it },
                    label = { Text("Sets") },
                    singleLine = true,
                    modifier = Modifier.weight(1f),
                )
                OutlinedTextField(
                    value = reps,
                    onValueChange = { reps = it },
                    label = { Text("Reps") },
                    singleLine = true,
                    modifier = Modifier.weight(1f),
                )
            }
            OutlinedTextField(
                value = rest,
                onValueChange = { rest = it },
                label = { Text("Rest (e.g. 2 min rest)") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )

            // Set-counter dot count stepper.
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Set counter dots", modifier = Modifier.weight(1f), color = colors.textSecondary)
                IconButton(onClick = { if (numSets > 0) numSets-- }) { Icon(Icons.Filled.Remove, "Fewer") }
                Text("$numSets", style = MaterialTheme.typography.titleMedium)
                IconButton(onClick = { if (numSets < 12) numSets++ }) { Icon(Icons.Filled.Add, "More") }
            }

            OutlinedTextField(
                value = tip,
                onValueChange = { tip = it },
                label = { Text("Execution tip (optional)") },
                modifier = Modifier.fillMaxWidth(),
            )

            Text("VARIATIONS", style = MaterialTheme.typography.labelSmall, color = colors.textMuted)
            variations.forEachIndexed { index, v ->
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = v.label,
                        onValueChange = { variations[index] = v.copy(label = it) },
                        label = { Text("Variation") },
                        singleLine = true,
                        modifier = Modifier.weight(1f),
                    )
                    FilterChip(
                        selected = v.isAlternative,
                        onClick = { variations[index] = v.copy(isAlternative = !v.isAlternative) },
                        label = { Text("Alt") },
                    )
                    IconButton(onClick = { variations.removeAt(index) }) {
                        Icon(Icons.Filled.Close, "Remove", tint = colors.danger)
                    }
                }
            }
            OutlinedButton(
                onClick = { variations.add(VariationDraft(IdGen.uuid(), "", false)) },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Icon(Icons.Filled.Add, null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.size(8.dp))
                Text("Add variation")
            }

            Spacer(Modifier.size(4.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                OutlinedButton(onClick = onDismiss, modifier = Modifier.weight(1f)) { Text("Cancel") }
                Button(
                    onClick = {
                        onSubmit(
                            ExerciseFormResult(
                                name = name,
                                badge = badge,
                                badgeColor = badgeColor,
                                sets = sets,
                                reps = reps,
                                rest = rest,
                                numSets = numSets,
                                tip = tip,
                                variations = variations.toList(),
                            )
                        )
                    },
                    enabled = name.isNotBlank(),
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentDefault),
                ) { Text("Save") }
            }
        }
    }
}
