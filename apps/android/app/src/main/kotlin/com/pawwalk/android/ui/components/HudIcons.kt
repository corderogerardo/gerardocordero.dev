package com.pawwalk.android.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * Small private helper shared by every icon in the file — draws a `Path`
 * built from the `block` lambda with a rounded stroke, so each icon composable
 * is just "list the points" (lessons-android/06-design-system.js).
 */
private fun DrawScope.strokePath(tint: Color, width: Float, block: Path.() -> Unit) {
    val p = Path().apply(block)
    drawPath(p, color = tint, style = Stroke(width = width, cap = StrokeCap.Round, join = StrokeJoin.Round))
}

@Composable
fun CheckIcon(tint: Color, size: Dp = 9.dp, modifier: Modifier = Modifier) = Canvas(modifier.size(size)) {
    val s = this.size.minDimension
    strokePath(tint, s * 0.16f) {
        moveTo(s * 0.20f, s * 0.52f); lineTo(s * 0.42f, s * 0.72f); lineTo(s * 0.80f, s * 0.28f)
    }
}

// ponytail: the tab-bar icons (HomeScreen.kt — HudTabBar) are referenced by
// name only (HomeIcon, CalendarIcon, LocationArrowIcon, PawIcon), never drawn
// in a lesson. Filled in with the same Canvas + strokePath recipe as
// CheckIcon/ChevronRightIcon so the whole icon set shares one visual language.

@Composable
fun ChevronRightIcon(tint: Color, size: Dp = 16.dp, modifier: Modifier = Modifier) = Canvas(modifier.size(size)) {
    val s = this.size.minDimension
    strokePath(tint, s * 0.14f) {
        moveTo(s * 0.36f, s * 0.20f); lineTo(s * 0.68f, s * 0.5f); lineTo(s * 0.36f, s * 0.80f)
    }
}

@Composable
fun HomeIcon(tint: Color, size: Dp = 15.dp, modifier: Modifier = Modifier) = Canvas(modifier.size(size)) {
    val s = this.size.minDimension
    strokePath(tint, s * 0.14f) {
        moveTo(s * 0.15f, s * 0.5f); lineTo(s * 0.5f, s * 0.18f); lineTo(s * 0.85f, s * 0.5f)
    }
    strokePath(tint, s * 0.14f) {
        moveTo(s * 0.28f, s * 0.42f); lineTo(s * 0.28f, s * 0.85f)
        moveTo(s * 0.72f, s * 0.42f); lineTo(s * 0.72f, s * 0.85f)
        moveTo(s * 0.28f, s * 0.85f); lineTo(s * 0.72f, s * 0.85f)
    }
}

@Composable
fun CalendarIcon(tint: Color, size: Dp = 15.dp, modifier: Modifier = Modifier) = Canvas(modifier.size(size)) {
    val s = this.size.minDimension
    drawRect(
        color = tint,
        topLeft = Offset(s * 0.14f, s * 0.22f),
        size = androidx.compose.ui.geometry.Size(s * 0.72f, s * 0.64f),
        style = Stroke(width = s * 0.12f),
    )
    strokePath(tint, s * 0.10f) {
        moveTo(s * 0.14f, s * 0.42f); lineTo(s * 0.86f, s * 0.42f)
    }
}

@Composable
fun LocationArrowIcon(tint: Color, size: Dp = 15.dp, modifier: Modifier = Modifier) = Canvas(modifier.size(size)) {
    val s = this.size.minDimension
    strokePath(tint, s * 0.12f) {
        moveTo(s * 0.20f, s * 0.85f); lineTo(s * 0.5f, s * 0.15f); lineTo(s * 0.80f, s * 0.85f)
        moveTo(s * 0.5f, s * 0.15f); lineTo(s * 0.5f, s * 0.65f)
    }
}

@Composable
fun PawIcon(tint: Color, size: Dp = 15.dp, modifier: Modifier = Modifier) = Canvas(modifier.size(size)) {
    val s = this.size.minDimension
    val pad = listOf(
        Offset(s * 0.30f, s * 0.30f), Offset(s * 0.50f, s * 0.22f),
        Offset(s * 0.70f, s * 0.30f), Offset(s * 0.5f, s * 0.60f),
    )
    pad.forEach { center -> drawCircle(color = tint, radius = s * 0.08f, center = center) }
    drawCircle(color = tint, radius = s * 0.16f, center = Offset(s * 0.5f, s * 0.82f))
}
