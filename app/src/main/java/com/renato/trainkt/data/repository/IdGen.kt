package com.renato.trainkt.data.repository

import java.util.UUID

/** Central UUID source for new entity ids. */
object IdGen {
    fun uuid(): String = UUID.randomUUID().toString()
}
