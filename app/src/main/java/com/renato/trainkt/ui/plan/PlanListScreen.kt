package com.renato.trainkt.ui.plan

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.FileUpload
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.renato.trainkt.data.db.dao.PlanSummary
import com.renato.trainkt.ui.theme.AccentDefault
import com.renato.trainkt.ui.theme.LocalTrainColors
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlanListScreen(
    onBack: () -> Unit,
    onCreate: () -> Unit,
    onEdit: (String) -> Unit,
    onImport: () -> Unit,
    onExport: () -> Unit,
    viewModel: PlanListViewModel = hiltViewModel(),
) {
    val plans by viewModel.plans.collectAsStateWithLifecycle()
    var menuOpen by remember { mutableStateOf(false) }
    var pendingDelete by remember { mutableStateOf<PlanSummary?>(null) }
    val colors = LocalTrainColors.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Plans") },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back") }
                },
                actions = {
                    IconButton(onClick = onExport) { Icon(Icons.Filled.FileUpload, "Export") }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background),
            )
        },
        floatingActionButton = {
            Box {
                FloatingActionButton(onClick = { menuOpen = true }, containerColor = AccentDefault) {
                    Icon(Icons.Filled.Add, "Add")
                }
                DropdownMenu(expanded = menuOpen, onDismissRequest = { menuOpen = false }) {
                    DropdownMenuItem(text = { Text("New plan") }, onClick = { menuOpen = false; onCreate() })
                    DropdownMenuItem(text = { Text("Import") }, onClick = { menuOpen = false; onImport() })
                }
            }
        },
    ) { padding ->
        if (plans.isEmpty()) {
            Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                Text("No plans yet. Tap + to create or import one.", color = colors.textSecondary)
            }
        } else {
            LazyColumn(
                modifier = Modifier.padding(padding).fillMaxSize(),
                contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(plans, key = { it.plan.id }) { summary ->
                    PlanRow(
                        summary = summary,
                        onSetActive = { viewModel.setActive(summary.plan.id) },
                        onEdit = { onEdit(summary.plan.id) },
                        onDelete = { pendingDelete = summary },
                    )
                }
            }
        }
    }

    pendingDelete?.let { target ->
        AlertDialog(
            onDismissRequest = { pendingDelete = null },
            title = { Text("Delete plan?") },
            text = { Text("\"${target.plan.name}\" and all its days will be removed. This can't be undone.") },
            confirmButton = {
                TextButton(onClick = { viewModel.delete(target.plan.id); pendingDelete = null }) {
                    Text("Delete", color = colors.danger)
                }
            },
            dismissButton = { TextButton(onClick = { pendingDelete = null }) { Text("Cancel") } },
        )
    }
}

@Composable
private fun PlanRow(
    summary: PlanSummary,
    onSetActive: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
) {
    val colors = LocalTrainColors.current
    val dateFmt = remember { SimpleDateFormat("MMM d, yyyy", Locale.getDefault()) }
    val active = summary.plan.isActive
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(MaterialTheme.colorScheme.surface)
            .border(1.dp, if (active) AccentDefault else colors.border, RoundedCornerShape(14.dp))
            .clickable(onClick = onSetActive)
            .padding(16.dp),
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = summary.plan.name,
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                if (active) {
                    Spacer(Modifier.size(8.dp))
                    Icon(Icons.Filled.CheckCircle, "Active", tint = AccentDefault, modifier = Modifier.size(18.dp))
                }
            }
            Spacer(Modifier.size(4.dp))
            Text(
                text = "${summary.dayCount} day${if (summary.dayCount == 1) "" else "s"} · ${dateFmt.format(Date(summary.plan.createdAt))}",
                style = MaterialTheme.typography.bodyMedium,
                color = colors.textMuted,
            )
        }
        IconButton(onClick = onEdit) { Icon(Icons.Filled.Edit, "Edit", tint = colors.textSecondary) }
        IconButton(onClick = onDelete) { Icon(Icons.Filled.Delete, "Delete", tint = colors.danger) }
    }
}
