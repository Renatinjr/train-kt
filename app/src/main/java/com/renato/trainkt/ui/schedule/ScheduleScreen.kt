package com.renato.trainkt.ui.schedule

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.renato.trainkt.ui.theme.LocalTrainColors
import com.renato.trainkt.ui.theme.toAccentColor
import com.renato.trainkt.util.ScheduleCalc

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun ScheduleScreen(
    onBack: () -> Unit,
    viewModel: ScheduleViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val colors = LocalTrainColors.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Schedule") },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back") }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background),
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier.padding(padding).fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp),
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("CYCLE STARTS ON", style = MaterialTheme.typography.labelSmall, color = colors.textMuted)
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    ScheduleCalc.allWeekdaysMondayFirst.forEach { weekday ->
                        FilterChip(
                            selected = state.settings.startWeekday == weekday,
                            onClick = { viewModel.setStartWeekday(weekday) },
                            label = { Text(ScheduleCalc.weekdayName(weekday).take(3)) },
                        )
                    }
                }
                Text(
                    "Day 1 of your plan falls on ${ScheduleCalc.weekdayName(state.settings.startWeekday)}.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.textSecondary,
                )
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("Include a 5th training day", color = MaterialTheme.colorScheme.onBackground)
                    Text(
                        if (state.settings.hasFifthDay) "Up to 5 workout days per week" else "Up to 4 workout days per week",
                        style = MaterialTheme.typography.bodyMedium,
                        color = colors.textSecondary,
                    )
                }
                Switch(
                    checked = state.settings.hasFifthDay,
                    onCheckedChange = { viewModel.setHasFifthDay(it) },
                )
            }

            Text("WEEK PREVIEW", style = MaterialTheme.typography.labelSmall, color = colors.textMuted)
            val slots = ScheduleCalc.week(state.settings, state.days.size)
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                slots.forEach { slot ->
                    val day = slot.dayIndex?.let { state.days.getOrNull(it) }
                    val accent = day?.day?.colorHex.toAccentColor()
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(MaterialTheme.colorScheme.surface)
                            .border(
                                1.dp,
                                if (slot.isToday) accent else colors.border,
                                RoundedCornerShape(10.dp),
                            )
                            .padding(14.dp),
                    ) {
                        Text(
                            text = ScheduleCalc.weekdayName(slot.weekdayCalendar),
                            modifier = Modifier.weight(1f),
                            color = if (slot.isToday) accent else MaterialTheme.colorScheme.onSurface,
                            style = MaterialTheme.typography.titleMedium,
                        )
                        if (day != null) {
                            androidx.compose.foundation.layout.Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(androidx.compose.foundation.shape.CircleShape)
                                    .background(accent),
                            )
                            Spacer(Modifier.size(8.dp))
                            Text(day.day.name, color = colors.textSecondary)
                        } else {
                            Text("Rest", color = colors.textMuted)
                        }
                    }
                }
            }
        }
    }
}
