package com.renato.trainkt.ui.day

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.renato.trainkt.data.model.DayDetail
import com.renato.trainkt.data.model.SectionDetail
import com.renato.trainkt.ui.components.ExerciseCard
import com.renato.trainkt.ui.exercise.EditExerciseSheet
import com.renato.trainkt.ui.theme.Amber
import com.renato.trainkt.ui.theme.LocalTrainColors
import com.renato.trainkt.ui.theme.toAccentColor

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DayScreen(
    onBack: () -> Unit,
    viewModel: DayViewModel = hiltViewModel(),
) {
    val day by viewModel.day.collectAsStateWithLifecycle()
    val editMode by viewModel.editMode.collectAsStateWithLifecycle()
    val completed by viewModel.completed.collectAsStateWithLifecycle()
    val editorTarget by viewModel.editorTarget.collectAsStateWithLifecycle()
    val colors = LocalTrainColors.current

    var showAddSection by remember { mutableStateOf(false) }
    var renameSectionId by remember { mutableStateOf<String?>(null) }
    var renameSectionText by remember { mutableStateOf("") }

    val accent = day?.day?.colorHex.toAccentColor()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(day?.day?.name ?: "Day") },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back") }
                },
                actions = {
                    IconButton(onClick = viewModel::resetSetCounters) {
                        Icon(Icons.Filled.Refresh, "Reset sets", tint = colors.textSecondary)
                    }
                    IconButton(onClick = viewModel::toggleEditMode) {
                        Icon(
                            imageVector = if (editMode) Icons.Filled.Check else Icons.Filled.Edit,
                            contentDescription = "Edit mode",
                            tint = if (editMode) Amber else colors.textSecondary,
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background),
            )
        },
    ) { padding ->
        val current = day
        if (current == null) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("Loading…", color = colors.textSecondary)
            }
            return@Scaffold
        }

        LazyColumn(
            modifier = Modifier.padding(padding).fillMaxSize(),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item { DayHero(day = current, accentHex = current.day.colorHex, editMode = editMode) }

            current.sections.forEach { section ->
                item(key = "header-${section.section.id}") {
                    SectionHeader(
                        section = section,
                        editMode = editMode,
                        onRename = {
                            renameSectionId = section.section.id
                            renameSectionText = section.section.title
                        },
                        onDelete = { viewModel.deleteSection(section.section.id) },
                    )
                }
                items(
                    items = section.exercises,
                    key = { it.exercise.id },
                ) { exDetail ->
                    val index = section.exercises.indexOf(exDetail)
                    ExerciseCard(
                        modifier = Modifier.animateItem(),
                        detail = exDetail,
                        accent = accent,
                        completedSets = completed[exDetail.exercise.id].orEmpty(),
                        onToggleSet = { i -> viewModel.toggleSet(exDetail.exercise.id, i) },
                        editMode = editMode,
                        canMoveUp = index > 0,
                        canMoveDown = index < section.exercises.lastIndex,
                        onEdit = { viewModel.openEditExercise(section.section.id, exDetail) },
                        onDelete = { viewModel.deleteExercise(exDetail.exercise.id) },
                        onMoveUp = { viewModel.moveExercise(section.section.id, exDetail.exercise.id, up = true) },
                        onMoveDown = { viewModel.moveExercise(section.section.id, exDetail.exercise.id, up = false) },
                    )
                }
                if (editMode) {
                    item(key = "add-ex-${section.section.id}") {
                        DashedAddButton("Add exercise") { viewModel.openAddExercise(section.section.id) }
                    }
                }
            }

            if (editMode) {
                item { DashedAddButton("New section") { showAddSection = true } }
            } else if (current.sections.isEmpty()) {
                item {
                    Text(
                        "No exercises yet. Tap the edit ✎ icon to add sections and exercises.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = colors.textSecondary,
                    )
                }
            }
        }
    }

    editorTarget?.let { target ->
        EditExerciseSheet(
            target = target,
            onDismiss = viewModel::closeEditor,
            onSubmit = viewModel::submitExercise,
        )
    }

    if (showAddSection) {
        TextInputDialog(
            title = "New section",
            label = "Section title",
            initial = "",
            onConfirm = { title -> viewModel.addSection(title); showAddSection = false },
            onDismiss = { showAddSection = false },
        )
    }

    renameSectionId?.let { id ->
        TextInputDialog(
            title = "Rename section",
            label = "Section title",
            initial = renameSectionText,
            onConfirm = { title -> viewModel.renameSection(id, title); renameSectionId = null },
            onDismiss = { renameSectionId = null },
        )
    }
}

@Composable
private fun DayHero(day: DayDetail, accentHex: String, editMode: Boolean) {
    val colors = LocalTrainColors.current
    val accent = accentHex.toAccentColor()
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(accent.copy(alpha = 0.12f))
            .border(
                width = if (editMode) 2.dp else 1.dp,
                color = if (editMode) Amber else accent.copy(alpha = 0.6f),
                shape = RoundedCornerShape(16.dp),
            )
            .padding(20.dp),
    ) {
        Text(day.day.dayLabel.uppercase(), style = MaterialTheme.typography.labelSmall, color = accent)
        Spacer(Modifier.size(6.dp))
        Text(day.day.name, style = MaterialTheme.typography.displaySmall, color = MaterialTheme.colorScheme.onBackground)
        Spacer(Modifier.size(8.dp))
        Text(
            "${day.exerciseCount} exercises" + if (editMode) " · editing" else "",
            style = MaterialTheme.typography.bodyMedium,
            color = if (editMode) Amber else colors.textSecondary,
        )
        if (day.day.note.isNotBlank()) {
            Spacer(Modifier.size(8.dp))
            Text(day.day.note, style = MaterialTheme.typography.bodyMedium, color = colors.textSecondary)
        }
    }
}

@Composable
private fun SectionHeader(
    section: SectionDetail,
    editMode: Boolean,
    onRename: () -> Unit,
    onDelete: () -> Unit,
) {
    val colors = LocalTrainColors.current
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(
            text = section.section.title,
            style = MaterialTheme.typography.headlineSmall,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.weight(1f),
        )
        if (editMode) {
            IconButton(onClick = onRename) { Icon(Icons.Filled.Edit, "Rename", tint = colors.textSecondary) }
            IconButton(onClick = onDelete) { Icon(Icons.Filled.Delete, "Delete section", tint = colors.danger) }
        }
    }
}

@Composable
private fun DashedAddButton(text: String, onClick: () -> Unit) {
    OutlinedButton(onClick = onClick, modifier = Modifier.fillMaxWidth()) {
        Icon(Icons.Filled.Add, null, modifier = Modifier.size(18.dp))
        Spacer(Modifier.size(8.dp))
        Text(text)
    }
}

@Composable
private fun TextInputDialog(
    title: String,
    label: String,
    initial: String,
    onConfirm: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    var text by remember { mutableStateOf(initial) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            OutlinedTextField(
                value = text,
                onValueChange = { text = it },
                label = { Text(label) },
                singleLine = true,
            )
        },
        confirmButton = { TextButton(onClick = { onConfirm(text) }) { Text("OK") } },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancel") } },
    )
}
