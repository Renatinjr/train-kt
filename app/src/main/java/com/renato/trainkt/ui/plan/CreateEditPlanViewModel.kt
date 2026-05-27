package com.renato.trainkt.ui.plan

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.renato.trainkt.data.db.entities.WorkoutDay
import com.renato.trainkt.data.db.entities.WorkoutPlan
import com.renato.trainkt.data.repository.IdGen
import com.renato.trainkt.data.repository.PlanRepository
import com.renato.trainkt.ui.navigation.Routes
import com.renato.trainkt.ui.theme.DayColorPalette
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Editable representation of a day while building/editing a plan (sections live elsewhere). */
data class DayDraft(
    val id: String,
    val name: String,
    val label: String,
    val colorHex: String,
    val note: String,
)

data class PlanEditState(
    val planId: String? = null,
    val name: String = "",
    val description: String = "",
    val days: List<DayDraft> = emptyList(),
    val createdAt: Long = System.currentTimeMillis(),
    val wasActive: Boolean = false,
    val isNew: Boolean = true,
    val loaded: Boolean = false,
    val saved: Boolean = false,
) {
    val canSave: Boolean get() = name.isNotBlank()
}

@HiltViewModel
class CreateEditPlanViewModel @Inject constructor(
    private val planRepository: PlanRepository,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val planId: String? = savedStateHandle[Routes.ARG_PLAN_ID]

    private val _state = MutableStateFlow(PlanEditState(planId = planId, isNew = planId == null))
    val state: StateFlow<PlanEditState> = _state.asStateFlow()

    init {
        if (planId != null) {
            viewModelScope.launch {
                planRepository.getPlanDetail(planId)?.let { detail ->
                    _state.value = PlanEditState(
                        planId = detail.plan.id,
                        name = detail.plan.name,
                        description = detail.plan.description,
                        days = detail.days.map {
                            DayDraft(it.day.id, it.day.name, it.day.dayLabel, it.day.colorHex, it.day.note)
                        },
                        createdAt = detail.plan.createdAt,
                        wasActive = detail.plan.isActive,
                        isNew = false,
                        loaded = true,
                    )
                } ?: run { _state.update { it.copy(loaded = true) } }
            }
        } else {
            _state.update { it.copy(loaded = true) }
        }
    }

    fun setName(value: String) = _state.update { it.copy(name = value) }
    fun setDescription(value: String) = _state.update { it.copy(description = value) }

    fun addDay() = _state.update { s ->
        val index = s.days.size
        val color = DayColorPalette[index % DayColorPalette.size]
        s.copy(
            days = s.days + DayDraft(
                id = IdGen.uuid(),
                name = "",
                label = "Day ${index + 1}",
                colorHex = color,
                note = "",
            ),
        )
    }

    fun updateDay(id: String, transform: (DayDraft) -> DayDraft) = _state.update { s ->
        s.copy(days = s.days.map { if (it.id == id) transform(it) else it })
    }

    fun removeDay(id: String) = _state.update { s -> s.copy(days = s.days.filterNot { it.id == id }) }

    fun moveDay(id: String, up: Boolean) = _state.update { s ->
        val list = s.days.toMutableList()
        val i = list.indexOfFirst { it.id == id }
        if (i < 0) return@update s
        val target = if (up) i - 1 else i + 1
        if (target < 0 || target > list.lastIndex) return@update s
        list[i] = list[target].also { list[target] = list[i] }
        s.copy(days = list)
    }

    fun save(activate: Boolean) {
        val s = _state.value
        if (!s.canSave) return
        val id = s.planId ?: IdGen.uuid()
        val plan = WorkoutPlan(
            id = id,
            name = s.name.trim(),
            description = s.description.trim(),
            createdAt = s.createdAt,
            isActive = s.wasActive,
        )
        val days = s.days.mapIndexed { index, d ->
            WorkoutDay(
                id = d.id,
                planId = id,
                name = d.name.ifBlank { "Day ${index + 1}" },
                dayLabel = d.label.ifBlank { "Day ${index + 1}" },
                colorHex = d.colorHex,
                position = index,
                note = d.note,
            )
        }
        viewModelScope.launch {
            planRepository.savePlanWithDays(plan, days, activate = activate || s.wasActive)
            _state.update { it.copy(saved = true) }
        }
    }
}
