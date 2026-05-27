package com.renato.trainkt.ui.importexport

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.FileOpen
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.renato.trainkt.data.model.PlanDetail
import com.renato.trainkt.ui.theme.AccentDefault
import com.renato.trainkt.ui.theme.LocalTrainColors
import com.renato.trainkt.util.FileUtils
import com.renato.trainkt.util.ImportResult

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ImportScreen(
    onBack: () -> Unit,
    onImported: () -> Unit,
    viewModel: ImportViewModel = hiltViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    val colors = LocalTrainColors.current

    LaunchedEffect(state.done) { if (state.done) onImported() }

    val picker = rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocument()
    ) { uri ->
        if (uri != null) {
            val text = FileUtils.readText(context, uri)
            if (text != null) viewModel.onFileLoaded(text)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Import plan") },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back") }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background),
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            OutlinedButton(
                onClick = { picker.launch(arrayOf("application/json", "text/plain")) },
                modifier = Modifier.fillMaxWidth(),
            ) {
                Icon(Icons.Filled.FileOpen, null, modifier = Modifier.size(18.dp))
                Spacer(Modifier.size(8.dp))
                Text("Choose a JSON or text file")
            }

            Text("OR PASTE", style = MaterialTheme.typography.labelSmall, color = colors.textMuted)
            OutlinedTextField(
                value = state.raw,
                onValueChange = viewModel::setText,
                label = { Text("Paste JSON or plain text") },
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = 160.dp),
            )
            OutlinedButton(
                onClick = viewModel::parse,
                enabled = state.raw.isNotBlank(),
                modifier = Modifier.fillMaxWidth(),
            ) { Text("Preview") }

            when (val result = state.result) {
                is ImportResult.Error -> ErrorBox(result.message)
                is ImportResult.Success -> PreviewBox(
                    plan = result.plan,
                    importing = state.importing,
                    onImport = { viewModel.confirm(activate = false) },
                    onImportActive = { viewModel.confirm(activate = true) },
                )
                null -> Unit
            }
        }
    }
}

@Composable
private fun ErrorBox(message: String) {
    val colors = LocalTrainColors.current
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(colors.danger.copy(alpha = 0.1f))
            .border(1.dp, colors.danger.copy(alpha = 0.5f), RoundedCornerShape(12.dp))
            .padding(14.dp),
    ) {
        Icon(Icons.Filled.ErrorOutline, null, tint = colors.danger)
        Spacer(Modifier.size(10.dp))
        Text(message, style = MaterialTheme.typography.bodyMedium, color = colors.danger)
    }
}

@Composable
private fun PreviewBox(
    plan: PlanDetail,
    importing: Boolean,
    onImport: () -> Unit,
    onImportActive: () -> Unit,
) {
    val colors = LocalTrainColors.current
    val exerciseCount = plan.days.sumOf { it.exerciseCount }
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(MaterialTheme.colorScheme.surface)
            .border(1.dp, AccentDefault.copy(alpha = 0.5f), RoundedCornerShape(14.dp))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Filled.CheckCircle, null, tint = AccentDefault)
            Spacer(Modifier.size(8.dp))
            Text(plan.plan.name, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface)
        }
        Text(
            "${plan.dayCount} day${if (plan.dayCount == 1) "" else "s"} · $exerciseCount exercise${if (exerciseCount == 1) "" else "s"}",
            style = MaterialTheme.typography.bodyMedium,
            color = colors.textSecondary,
        )
        plan.days.forEach { d ->
            Text("• ${d.day.name} (${d.exerciseCount})", style = MaterialTheme.typography.bodyMedium, color = colors.textMuted)
        }
        Spacer(Modifier.size(6.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedButton(onClick = onImport, enabled = !importing, modifier = Modifier.weight(1f)) {
                Text("Import")
            }
            Button(
                onClick = onImportActive,
                enabled = !importing,
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(containerColor = AccentDefault),
            ) { Text("Import & activate") }
        }
    }
}
