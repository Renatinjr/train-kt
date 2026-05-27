package com.renato.trainkt.ui.plan

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.renato.trainkt.ui.components.ColorPickerRow
import com.renato.trainkt.ui.theme.AccentDefault
import com.renato.trainkt.ui.theme.LocalTrainColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateEditPlanScreen(
    onDone: () -> Unit,
    viewModel: CreateEditPlanViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val colors = LocalTrainColors.current

    LaunchedEffect(state.saved) { if (state.saved) onDone() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (state.isNew) "New plan" else "Edit plan") },
                navigationIcon = {
                    IconButton(onClick = onDone) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back") }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background),
            )
        },
        bottomBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.background)
                    .padding(16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                OutlinedButton(
                    onClick = { viewModel.save(activate = false) },
                    enabled = state.canSave,
                    modifier = Modifier.weight(1f),
                ) { Text("Save draft") }
                Button(
                    onClick = { viewModel.save(activate = true) },
                    enabled = state.canSave,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = AccentDefault),
                ) { Text(if (state.wasActive) "Save" else "Save & activate") }
            }
        },
    ) { padding ->
        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxWidth(),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                OutlinedTextField(
                    value = state.name,
                    onValueChange = viewModel::setName,
                    label = { Text("Plan name") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            item {
                OutlinedTextField(
                    value = state.description,
                    onValueChange = viewModel::setDescription,
                    label = { Text("Description (optional)") },
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            item {
                Text(
                    "WORKOUT DAYS",
                    style = MaterialTheme.typography.labelSmall,
                    color = colors.textMuted,
                )
            }
            items(state.days, key = { it.id }) { day ->
                DayEditorCard(
                    draft = day,
                    canMoveUp = state.days.first().id != day.id,
                    canMoveDown = state.days.last().id != day.id,
                    onChange = { transform -> viewModel.updateDay(day.id, transform) },
                    onMoveUp = { viewModel.moveDay(day.id, up = true) },
                    onMoveDown = { viewModel.moveDay(day.id, up = false) },
                    onDelete = { viewModel.removeDay(day.id) },
                )
            }
            item {
                OutlinedButton(onClick = viewModel::addDay, modifier = Modifier.fillMaxWidth()) {
                    Icon(Icons.Filled.Add, null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.size(8.dp))
                    Text("Add day")
                }
            }
        }
    }
}

@Composable
private fun DayEditorCard(
    draft: DayDraft,
    canMoveUp: Boolean,
    canMoveDown: Boolean,
    onChange: ((DayDraft) -> DayDraft) -> Unit,
    onMoveUp: () -> Unit,
    onMoveDown: () -> Unit,
    onDelete: () -> Unit,
) {
    val colors = LocalTrainColors.current
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(MaterialTheme.colorScheme.surface)
            .border(1.dp, colors.border, RoundedCornerShape(14.dp))
            .padding(14.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = draft.label.ifBlank { "Day" }.uppercase(),
                style = MaterialTheme.typography.labelSmall,
                color = colors.textSecondary,
                modifier = Modifier.weight(1f),
            )
            IconButton(onClick = onMoveUp, enabled = canMoveUp) {
                Icon(Icons.Filled.KeyboardArrowUp, "Move up", tint = if (canMoveUp) colors.textSecondary else colors.textMuted)
            }
            IconButton(onClick = onMoveDown, enabled = canMoveDown) {
                Icon(Icons.Filled.KeyboardArrowDown, "Move down", tint = if (canMoveDown) colors.textSecondary else colors.textMuted)
            }
            IconButton(onClick = onDelete) { Icon(Icons.Filled.Delete, "Delete", tint = colors.danger) }
        }
        OutlinedTextField(
            value = draft.name,
            onValueChange = { v -> onChange { it.copy(name = v) } },
            label = { Text("Day name (e.g. Push)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )
        OutlinedTextField(
            value = draft.label,
            onValueChange = { v -> onChange { it.copy(label = v) } },
            label = { Text("Label (e.g. Day 1, Monday)") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
        )
        Text("Accent color", style = MaterialTheme.typography.labelLarge, color = colors.textSecondary)
        ColorPickerRow(
            selectedHex = draft.colorHex,
            onSelect = { hex -> onChange { it.copy(colorHex = hex) } },
        )
        OutlinedTextField(
            value = draft.note,
            onValueChange = { v -> onChange { it.copy(note = v) } },
            label = { Text("Note (optional)") },
            modifier = Modifier.fillMaxWidth(),
        )
    }
}
