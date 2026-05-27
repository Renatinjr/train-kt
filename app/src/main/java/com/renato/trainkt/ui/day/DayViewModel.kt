package com.renato.trainkt.ui.day

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.renato.trainkt.data.db.entities.Exercise
import com.renato.trainkt.data.db.entities.ExerciseVariation
import com.renato.trainkt.data.model.DayDetail
import com.renato.trainkt.data.model.ExerciseDetail
import com.renato.trainkt.data.repository.IdGen
import com.renato.trainkt.data.repository.PlanRepository
import com.renato.trainkt.ui.navigation.Routes
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** A variation row in the exercise editor form. */
data class VariationDraft(
    val id: String,
    val label: String,
    val isAlternative: Boolean,
)

/** Result the exercise editor sheet submits back to the view model. */
data class ExerciseFormResult(
    val name: String,
    val badge: String,
    val badgeColor: String,
    val sets: String,
    val reps: String,
    val rest: String,
    val numSets: Int,
    val tip: String,
    val variations: List<VariationDraft>,
)

/** What the editor sheet is currently editing: a new exercise in [sectionId], or [existing]. */
data class EditorTarget(
    val sectionId: String,
    val existing: ExerciseDetail?,
)

@HiltViewModel
class DayViewModel @Inject constructor(
    private val planRepository: PlanRepository,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val dayId: String = checkNotNull(savedStateHandle[Routes.ARG_DAY_ID])

    val day: StateFlow<DayDetail?> = planRepository.observeDay(dayId)
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

    private val _editMode = MutableStateFlow(false)
    val editMode: StateFlow<Boolean> = _editMode.asStateFlow()

    // In-memory set counter: exerciseId -> completed dot indices. Resets when this VM dies.
    private val _completed = MutableStateFlow<Map<String, Set<Int>>>(emptyMap())
    val completed: StateFlow<Map<String, Set<Int>>> = _completed.asStateFlow()

    private val _editorTarget = MutableStateFlow<EditorTarget?>(null)
    val editorTarget: StateFlow<EditorTarget?> = _editorTarget.asStateFlow()

    fun toggleEditMode() = _editMode.update { !it }

    fun toggleSet(exerciseId: String, index: Int) = _completed.update { map ->
        val current = map[exerciseId].orEmpty()
        val next = if (index in current) current - index else current + index
        map + (exerciseId to next)
    }

    fun resetSetCounters() {
        _completed.value = emptyMap()
    }

    // --- Section editing ---

    fun addSection(title: String) = viewModelScope.launch {
        planRepository.addSection(dayId, title.ifBlank { "New section" })
    }

    fun renameSection(sectionId: String, title: String) {
        val section = day.value?.sections?.firstOrNull { it.section.id == sectionId }?.section ?: return
        viewModelScope.launch { planRepository.updateSection(section.copy(title = title)) }
    }

    fun deleteSection(sectionId: String) = viewModelScope.launch {
        planRepository.deleteSection(sectionId)
    }

    // --- Exercise editing ---

    fun openAddExercise(sectionId: String) {
        _editorTarget.value = EditorTarget(sectionId, existing = null)
    }

    fun openEditExercise(sectionId: String, detail: ExerciseDetail) {
        _editorTarget.value = EditorTarget(sectionId, existing = detail)
    }

    fun closeEditor() {
        _editorTarget.value = null
    }

    fun submitExercise(form: ExerciseFormResult) {
        val target = _editorTarget.value ?: return
        viewModelScope.launch {
            val existing = target.existing?.exercise
            val exerciseId = existing?.id ?: IdGen.uuid()
            val position = existing?.position ?: planRepository.nextExercisePosition(target.sectionId)
            val exercise = Exercise(
                id = exerciseId,
                sectionId = target.sectionId,
                name = form.name.trim(),
                sets = form.sets.trim(),
                reps = form.reps.trim(),
                rest = form.rest.trim(),
                numSets = form.numSets.coerceIn(0, 12),
                tip = form.tip.trim(),
                badgeLabel = form.badge.trim(),
                badgeColor = form.badgeColor,
                position = position,
            )
            val variations = form.variations
                .filter { it.label.isNotBlank() }
                .mapIndexed { i, v ->
                    ExerciseVariation(
                        id = v.id,
                        exerciseId = exerciseId,
                        label = v.label.trim(),
                        isAlternative = v.isAlternative,
                        position = i,
                    )
                }
            planRepository.saveExercise(exercise, variations)
            closeEditor()
        }
    }

    fun deleteExercise(exerciseId: String) = viewModelScope.launch {
        planRepository.deleteExercise(exerciseId)
    }

    fun moveExercise(sectionId: String, exerciseId: String, up: Boolean) {
        val section = day.value?.sections?.firstOrNull { it.section.id == sectionId } ?: return
        val list = section.exercises.map { it.exercise }.toMutableList()
        val i = list.indexOfFirst { it.id == exerciseId }
        if (i < 0) return
        val target = if (up) i - 1 else i + 1
        if (target < 0 || target > list.lastIndex) return
        list[i] = list[target].also { list[target] = list[i] }
        viewModelScope.launch { planRepository.reorderExercises(list) }
    }
}
