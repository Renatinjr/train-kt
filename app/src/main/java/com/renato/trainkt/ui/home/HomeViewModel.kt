package com.renato.trainkt.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.renato.trainkt.data.db.dao.PlanSummary
import com.renato.trainkt.data.model.PlanDetail
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

data class HomeUiState(
    val loading: Boolean = true,
    val hasAnyPlan: Boolean = false,
    val activePlan: PlanDetail? = null,
    val planSummaries: List<PlanSummary> = emptyList(),
    val settings: ScheduleSettings = ScheduleSettings(),
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val planRepository: PlanRepository,
    private val scheduleRepository: ScheduleRepository,
) : ViewModel() {

    val uiState: StateFlow<HomeUiState> = combine(
        planRepository.observePlanCount(),
        planRepository.observeActivePlan(),
        planRepository.observePlanSummaries(),
        scheduleRepository.settings,
    ) { count, active, summaries, settings ->
        HomeUiState(
            loading = false,
            hasAnyPlan = count > 0,
            activePlan = active,
            planSummaries = summaries,
            settings = settings,
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), HomeUiState())

    fun setActivePlan(planId: String) = viewModelScope.launch {
        planRepository.setActive(planId)
    }
}
