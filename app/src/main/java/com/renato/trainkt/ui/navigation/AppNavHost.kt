package com.renato.trainkt.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.renato.trainkt.ui.day.DayScreen
import com.renato.trainkt.ui.home.HomeScreen
import com.renato.trainkt.ui.importexport.ExportScreen
import com.renato.trainkt.ui.importexport.ImportScreen
import com.renato.trainkt.ui.plan.CreateEditPlanScreen
import com.renato.trainkt.ui.plan.PlanListScreen
import com.renato.trainkt.ui.schedule.ScheduleScreen

@Composable
fun AppNavHost() {
    val nav = rememberNavController()
    NavHost(navController = nav, startDestination = Routes.HOME) {

        composable(Routes.HOME) {
            HomeScreen(
                onOpenDay = { dayId -> nav.navigate(Routes.day(dayId)) },
                onCreatePlan = { nav.navigate(Routes.planEdit()) },
                onManagePlans = { nav.navigate(Routes.PLANS) },
                onImport = { nav.navigate(Routes.IMPORT) },
                onSchedule = { nav.navigate(Routes.SCHEDULE) },
            )
        }

        composable(Routes.PLANS) {
            PlanListScreen(
                onBack = { nav.popBackStack() },
                onCreate = { nav.navigate(Routes.planEdit()) },
                onEdit = { planId -> nav.navigate(Routes.planEdit(planId)) },
                onImport = { nav.navigate(Routes.IMPORT) },
                onExport = { nav.navigate(Routes.EXPORT) },
            )
        }

        composable(
            route = "${Routes.PLAN_EDIT}?${Routes.ARG_PLAN_ID}={${Routes.ARG_PLAN_ID}}",
            arguments = listOf(
                navArgument(Routes.ARG_PLAN_ID) {
                    type = NavType.StringType
                    nullable = true
                    defaultValue = null
                },
            ),
        ) {
            CreateEditPlanScreen(onDone = { nav.popBackStack() })
        }

        composable(
            route = "${Routes.DAY}/{${Routes.ARG_DAY_ID}}",
            arguments = listOf(navArgument(Routes.ARG_DAY_ID) { type = NavType.StringType }),
        ) {
            DayScreen(onBack = { nav.popBackStack() })
        }

        composable(Routes.IMPORT) {
            ImportScreen(onBack = { nav.popBackStack() }, onImported = { nav.popBackStack() })
        }

        composable(Routes.EXPORT) {
            ExportScreen(onBack = { nav.popBackStack() })
        }

        composable(Routes.SCHEDULE) {
            ScheduleScreen(onBack = { nav.popBackStack() })
        }
    }
}
