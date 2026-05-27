package com.renato.trainkt.ui.importexport

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.renato.trainkt.data.db.dao.PlanSummary
import com.renato.trainkt.data.model.PlanDetail
import com.renato.trainkt.data.repository.PlanRepository
import com.renato.trainkt.util.PlanExporter
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ExportUiState(
    val selected: PlanDetail? = null,
    val json: String = "",
) {
    val fileName: String get() = selected?.let { PlanExporter.fileName(it) } ?: "plan.json"
}

@HiltViewModel
class ExportViewModel @Inject constructor(
    private val planRepository: PlanRepository,
) : ViewModel() {

    val plans: StateFlow<List<PlanSummary>> = planRepository.observePlanSummaries()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    private val _state = MutableStateFlow(ExportUiState())
    val state: StateFlow<ExportUiState> = _state.asStateFlow()

    fun select(planId: String) = viewModelScope.launch {
        val detail = planRepository.getPlanDetail(planId)
        _state.value = ExportUiState(
            selected = detail,
            json = detail?.let { PlanExporter.toJson(it) } ?: "",
        )
    }
}
