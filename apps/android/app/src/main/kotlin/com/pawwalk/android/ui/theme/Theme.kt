package com.pawwalk.android.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily

// ponytail: the course's design handoff (ui/components/HudComponents.kt,
// MonoText) references a bundled "JetBrainsMono" font family, but no lesson
// ships the actual .ttf asset — vendoring a font file isn't something a
// lesson `code` step can teach anyway. FontFamily.Monospace is the platform
// monospace fallback; swap in a real bundled JetBrains Mono under
// res/font/ later if the visual match matters.
val JetBrainsMono = FontFamily.Monospace

val Typography = Typography()

private val LightColors = lightColorScheme(
    primary = LightBrand.accent,
    onPrimary = LightBrand.onInverse,
    background = LightBrand.canvas,
    onBackground = LightBrand.ink,
    surface = LightBrand.canvas,
    onSurface = LightBrand.ink,
)

private val DarkColors = darkColorScheme(
    primary = DarkBrand.accent,
    onPrimary = Color(0xFF120E24),
    background = DarkBrand.canvas,
    onBackground = DarkBrand.ink,
    surface = DarkBrand.canvas,
    onSurface = DarkBrand.ink,
)

@Composable
fun PawWalkTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    val brand = if (darkTheme) DarkBrand else LightBrand
    val colorScheme = if (darkTheme) DarkColors else LightColors
    CompositionLocalProvider(LocalBrand provides brand) {
        MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
    }
}
