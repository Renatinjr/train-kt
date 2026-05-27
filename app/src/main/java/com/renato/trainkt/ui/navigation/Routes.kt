package com.renato.trainkt.ui.navigation

/** Centralised route strings + argument keys for the Compose nav graph. */
object Routes {
    const val HOME = "home"
    const val PLANS = "plans"
    const val SCHEDULE = "schedule"
    const val IMPORT = "import"
    const val EXPORT = "export"

    const val ARG_PLAN_ID = "planId"
    const val ARG_DAY_ID = "dayId"

    // planEdit?planId={planId} — planId absent ⇒ creating a new plan.
    const val PLAN_EDIT = "planEdit"
    fun planEdit(planId: String? = null): String =
        if (planId == null) PLAN_EDIT else "$PLAN_EDIT?$ARG_PLAN_ID=$planId"

    const val DAY = "day"
    fun day(dayId: String): String = "$DAY/$dayId"
}
