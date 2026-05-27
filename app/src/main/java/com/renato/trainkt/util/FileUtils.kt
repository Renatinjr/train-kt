package com.renato.trainkt.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import java.io.File

/** SAF / FileProvider helpers for reading imported files and sharing exported JSON. */
object FileUtils {

    /** Read the full text content of a user-picked document. */
    fun readText(context: Context, uri: Uri): String? =
        context.contentResolver.openInputStream(uri)?.use { stream ->
            stream.bufferedReader().readText()
        }

    /**
     * Write [json] to `cacheDir/exports/<fileName>` and return a shareable content:// Uri
     * via the app's FileProvider (authority `${applicationId}.fileprovider`).
     */
    fun writeExport(context: Context, fileName: String, json: String): Uri {
        val dir = File(context.cacheDir, "exports").apply { mkdirs() }
        val file = File(dir, fileName)
        file.writeText(json)
        return FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", file)
    }

    /** Build a share-sheet chooser intent for an exported plan file. */
    fun shareIntent(uri: Uri, subject: String): Intent {
        val send = Intent(Intent.ACTION_SEND).apply {
            type = "application/json"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, subject)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        return Intent.createChooser(send, "Share plan")
    }
}
