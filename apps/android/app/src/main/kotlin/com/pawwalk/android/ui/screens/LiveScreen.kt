package com.pawwalk.android.ui.screens

import android.Manifest
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.pawwalk.android.ui.components.MonoText
import com.pawwalk.android.ui.theme.Hud
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min

@Composable
fun LiveScreen(bookingId: String?, viewModel: LiveViewModel = viewModel()) {
    val c = Hud.colors
    val state by viewModel.state.collectAsState()

    val permLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { grants ->
        if (grants.values.any { it }) viewModel.startLocationUpdates() else viewModel.onPermissionDenied()
    }
    LaunchedEffect(Unit) {
        viewModel.connect(bookingId)
        permLauncher.launch(
            arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
        )
    }

    Box(Modifier.fillMaxSize().background(c.canvas)) {
        when (state.phase) {
            LiveViewModel.Phase.CONNECTING -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = c.accent)
            }
            LiveViewModel.Phase.NO_BOOKING -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                MonoText("No active walk to track", c.ink.copy(alpha = 0.6f), upper = false)
            }
            LiveViewModel.Phase.DENIED -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                MonoText("Location permission denied", c.ink.copy(alpha = 0.6f), upper = false)
            }
            LiveViewModel.Phase.FAILED -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                MonoText("Couldn't connect", c.ink.copy(alpha = 0.6f), upper = false)
            }
            LiveViewModel.Phase.TRACKING -> RouteCanvas(state.fixes)
        }

        Box(Modifier.statusBarsPadding().padding(16.dp).align(Alignment.TopStart)) {
            MonoText(distanceLabel(state.fixes), c.ink, sizeSp = 11f)
        }
        Box(Modifier.statusBarsPadding().padding(16.dp).align(Alignment.TopEnd)) {
            var nowMs by remember { mutableStateOf(System.currentTimeMillis()) }
            LaunchedEffect(state.startedAtMs) {
                while (true) {
                    nowMs = System.currentTimeMillis()
                    kotlinx.coroutines.delay(1000)
                }
            }
            MonoText(elapsedLabel(state.startedAtMs, nowMs), c.ink.copy(alpha = 0.6f), sizeSp = 11f)
        }
    }
}

private fun distanceLabel(fixes: List<LiveViewModel.Fix>): String {
    val m = LiveViewModel.distanceMeters(fixes)
    return if (m < 1000) "${m.toInt()} m" else "%.2f km".format(m / 1000)
}

private fun elapsedLabel(startedAtMs: Long?, nowMs: Long): String {
    if (startedAtMs == null) return "00:00"
    val s = ((nowMs - startedAtMs) / 1000).coerceAtLeast(0)
    return "%02d:%02d".format(s / 60, s % 60)
}

@Composable
private fun RouteCanvas(fixes: List<LiveViewModel.Fix>) {
    val c = Hud.colors
    val on = c.onInverse
    val t = rememberInfiniteTransition(label = "ping")
    val ping by t.animateFloat(
        0f, 1f,
        infiniteRepeatable(tween(1400, easing = LinearEasing), RepeatMode.Restart), label = "ping"
    )

    Canvas(Modifier.fillMaxSize()) {
        if (fixes.isEmpty()) return@Canvas

        val midLat = (fixes.minOf { it.lat } + fixes.maxOf { it.lat }) / 2
        val cosLat = cos(Math.toRadians(midLat))
        fun projX(f: LiveViewModel.Fix) = f.lng * cosLat
        fun projY(f: LiveViewModel.Fix) = f.lat
        val minX = fixes.minOf { projX(it) }; val maxX = fixes.maxOf { projX(it) }
        val minY = fixes.minOf { projY(it) }; val maxY = fixes.maxOf { projY(it) }
        val spanX = max(maxX - minX, 1e-12); val spanY = max(maxY - minY, 1e-12)
        val rect = Rect(60f, 200f, size.width - 60f, size.height - 220f)
        val sc = min(rect.width / spanX, rect.height / spanY)

        fun toScreen(f: LiveViewModel.Fix): Offset {
            val x = rect.left + ((projX(f) - minX) * sc).toFloat()
            // Screen Y grows downward; latitude grows "up" — flip it.
            val y = rect.bottom - ((projY(f) - minY) * sc).toFloat()
            return Offset(x, y)
        }

        val pts = fixes.map(::toScreen)
        if (pts.size > 1) {
            val path = Path().apply {
                moveTo(pts.first().x, pts.first().y)
                pts.drop(1).forEach { lineTo(it.x, it.y) }
            }
            drawPath(path, color = c.accent, style = Stroke(width = 6f, cap = androidx.compose.ui.graphics.StrokeCap.Round))
        }

        val cp = pts.last()
        drawCircle(c.accent.copy(alpha = 0.45f * (1f - ping)), 12f + 22f * ping, cp)
        drawCircle(c.accent, 8f, cp)
        drawCircle(on, 8f, cp, style = Stroke(2.5f))
    }
}
