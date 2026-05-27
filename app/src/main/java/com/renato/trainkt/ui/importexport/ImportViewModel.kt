package com.renato.trainkt.ui.importexport

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.renato.trainkt.data.repository.PlanRepository
import com.renato.trainkt.util.ImportParser
import com.renato.trainkt.util.ImportResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import javax.inject.Inject

data class ImportUiState(
    val raw: String = "",
    val result: ImportResult? = null,
    val importing: Boolean = false,
    val done: Boolean = false,
)

@HiltViewModel
class ImportViewModel @Inject constructor(
    private val planRepository: PlanRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(ImportUiState())
    val state: StateFlow<ImportUiState> = _state.asStateFlow()

    fun setText(raw: String) = _state.update { it.copy(raw = raw, result = null) }

    fun parse() = viewModelScope.launch {
        val raw = _state.value.raw
        val result = withContext(Dispatchers.Default) { ImportParser.parseAuto(raw) }
        _state.update { it.copy(result = result) }
    }

    /** Called after a file is read into text by the screen. */
    fun onFileLoaded(text: String) {
        _state.update { it.copy(raw = text) }
        parse()
    }

    fun confirm(activate: Boolean) {
        val result = _state.value.result
        if (result !is ImportResult.Success) return
        _state.update { it.copy(importing = true) }
        viewModelScope.launch {
            planRepository.insertPlanTree(result.plan, activate)
            _state.update { it.copy(importing = false, done = true) }
        }
    }
}
