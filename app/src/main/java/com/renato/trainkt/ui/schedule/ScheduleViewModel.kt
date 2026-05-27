package com.renato.trainkt.ui.schedule

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.renato.trainkt.data.model.DayDetail
import com.renato.trainkt.data.repository.PlanRepository
import com.renato.trainkt.data.repository.ScheduleRepository
import com.renato.trainkt.data.repository.ScheduleSettings
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ScheduleUiState(
    val settings: ScheduleSettings = ScheduleSettings(),
    val days: List<DayDetail> = emptyList(),
)

@HiltViewModel
class ScheduleViewModel @Inject constructor(
    private val scheduleRepository: ScheduleRepository,
    planRepository: PlanRepository,
) : ViewModel() {

    val uiState: StateFlow<ScheduleUiState> = combine(
        scheduleRepository.settings,
        planRepository.observeActivePlan(),
    ) { settings, activePlan ->
        ScheduleUiState(settings = settings, days = activePlan?.days ?: emptyList())
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ScheduleUiState())

    fun setStartWeekday(weekday: Int) = viewModelScope.launch {
        scheduleRepository.setStartWeekday(weekday)
    }

    fun setHasFifthDay(enabled: Boolean) = viewModelScope.launch {
        scheduleRepository.setHasFifthDay(enabled)
    }
}
