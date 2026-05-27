package com.renato.trainkt.ui.plan

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.renato.trainkt.data.db.dao.PlanSummary
import com.renato.trainkt.data.repository.PlanRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PlanListViewModel @Inject constructor(
    private val planRepository: PlanRepository,
) : ViewModel() {

    val plans: StateFlow<List<PlanSummary>> = planRepository.observePlanSummaries()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    fun setActive(planId: String) = viewModelScope.launch { planRepository.setActive(planId) }

    fun delete(planId: String) = viewModelScope.launch { planRepository.deletePlan(planId) }
}
