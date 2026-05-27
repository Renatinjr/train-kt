package com.renato.trainkt.ui.home

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.LibraryBooks
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.renato.trainkt.data.model.DayDetail
import com.renato.trainkt.ui.components.DayCard
import com.renato.trainkt.ui.components.EmptyState
import com.renato.trainkt.ui.components.WeekDayCell
import com.renato.trainkt.ui.components.WeekStrip
import com.renato.trainkt.ui.theme.AccentDefault
import com.renato.trainkt.ui.theme.LocalTrainColors
import com.renato.trainkt.ui.theme.toAccentColor
import com.renato.trainkt.util.ScheduleCalc

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onOpenDay: (String) -> Unit,
    onCreatePlan: () -> Unit,
    onManagePlans: () -> Unit,
    onImport: () -> Unit,
    onSchedule: () -> Unit,
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val colors = LocalTrainColors.current
    var planMenuOpen by remember { mutableStateOf(false) }
    var fabMenuOpen by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    if (state.activePlan != null) {
                        Box {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.clickable(enabled = state.planSummaries.size > 1) {
                                    planMenuOpen = true
                                },
                            ) {
                                Text(
                                    text = state.activePlan!!.plan.name,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis,
                                )
                                if (state.planSummaries.size > 1) {
                                    Icon(Icons.Filled.ExpandMore, "Switch plan")
                                }
                            }
                            DropdownMenu(expanded = planMenuOpen, onDismissRequest = { planMenuOpen = false }) {
                                state.planSummaries.forEach { summary ->
                                    DropdownMenuItem(
                                        text = { Text(summary.plan.name) },
                                        onClick = {
                                            viewModel.setActivePlan(summary.plan.id)
                                            planMenuOpen = false
                                        },
                                    )
                                }
                            }
                        }
                    } else {
                        Text("TrainKT")
                    }
                },
                actions = {
                    IconButton(onClick = onSchedule) { Icon(Icons.Filled.CalendarMonth, "Schedule") }
                    IconButton(onClick = onManagePlans) { Icon(Icons.Filled.LibraryBooks, "Plans") }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background,
                ),
            )
        },
        floatingActionButton = {
            if (state.hasAnyPlan) {
                Box {
                    FloatingActionButton(
                        onClick = { fabMenuOpen = true },
                        containerColor = AccentDefault,
                    ) { Icon(Icons.Filled.Add, "Add") }
                    DropdownMenu(expanded = fabMenuOpen, onDismissRequest = { fabMenuOpen = false }) {
                        DropdownMenuItem(text = { Text("New plan") }, onClick = { fabMenuOpen = false; onCreatePlan() })
                        DropdownMenuItem(text = { Text("Import") }, onClick = { fabMenuOpen = false; onImport() })
                    }
                }
            }
        },
    ) { padding ->
        when {
            state.loading -> Unit
            !state.hasAnyPlan -> EmptyState(
                onCreate = onCreatePlan,
                onImport = onImport,
                modifier = Modifier.padding(padding),
            )
            else -> {
                val plan = state.activePlan
                val days = plan?.days ?: emptyList()
                val slots = ScheduleCalc.week(state.settings, days.size)
                val cells = slots.map { slot ->
                    val d = slot.dayIndex?.let { days.getOrNull(it) }
                    WeekDayCell(
                        weekdayLabel = slot.label,
                        workoutName = d?.day?.name,
                        accentHex = d?.day?.colorHex,
                        isToday = slot.isToday,
                        dayId = d?.day?.id,
                    )
                }
                val todayDay = ScheduleCalc.todayDayIndex(state.settings, days.size)
                    ?.let { days.getOrNull(it) }

                LazyColumn(
                    modifier = Modifier
                        .padding(padding)
                        .fillMaxWidth(),
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(20.dp),
                ) {
                    item {
                        SectionTitle("This week")
                        Spacer(Modifier.size(10.dp))
                        WeekStrip(cells = cells, onClick = onOpenDay)
                    }
                    item {
                        SectionTitle("Today")
                        Spacer(Modifier.size(10.dp))
                        TodayCard(todayDay = todayDay, onOpenDay = onOpenDay)
                    }
                    if (days.isNotEmpty()) {
                        item {
                            SectionTitle("All days")
                            Spacer(Modifier.size(10.dp))
                            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                days.chunked(2).forEach { rowDays ->
                                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                        rowDays.forEach { d ->
                                            DayCard(
                                                name = d.day.name,
                                                dayLabel = d.day.dayLabel,
                                                accentHex = d.day.colorHex,
                                                exerciseCount = d.exerciseCount,
                                                isToday = d.day.id == todayDay?.day?.id,
                                                onClick = { onOpenDay(d.day.id) },
                                                modifier = Modifier.weight(1f),
                                            )
                                        }
                                        if (rowDays.size == 1) Spacer(Modifier.weight(1f))
                                    }
                                }
                            }
                        }
                    } else {
                        item {
                            Text(
                                "This plan has no days yet. Edit it from the Plans screen to add some.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = colors.textSecondary,
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(
        text = text.uppercase(),
        style = MaterialTheme.typography.labelSmall,
        color = LocalTrainColors.current.textMuted,
    )
}

@Composable
private fun TodayCard(todayDay: DayDetail?, onOpenDay: (String) -> Unit) {
    val colors = LocalTrainColors.current
    if (todayDay == null) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(MaterialTheme.colorScheme.surface)
                .border(1.dp, colors.border, RoundedCornerShape(14.dp))
                .padding(20.dp),
        ) {
            Text("Rest day — no workout scheduled.", color = colors.textSecondary)
        }
        return
    }
    val accent = todayDay.day.colorHex.toAccentColor()
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(accent.copy(alpha = 0.12f))
            .border(1.dp, accent, RoundedCornerShape(14.dp))
            .clickable { onOpenDay(todayDay.day.id) }
            .padding(20.dp),
    ) {
        Text(
            text = todayDay.day.dayLabel.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            color = accent,
        )
        Spacer(Modifier.size(6.dp))
        Text(
            text = todayDay.day.name,
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.onBackground,
        )
        Spacer(Modifier.size(6.dp))
        Text(
            text = "${todayDay.exerciseCount} exercises",
            style = MaterialTheme.typography.bodyMedium,
            color = colors.textSecondary,
        )
    }
}
