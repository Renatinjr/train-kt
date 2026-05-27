package com.renato.trainkt.util

import com.renato.trainkt.data.model.PlanDetail

/** Outcome of parsing an import payload — drives the preview / error UI on ImportScreen. */
sealed interface ImportResult {
    data class Success(val plan: PlanDetail) : ImportResult
    data class Error(val message: String) : ImportResult
}
