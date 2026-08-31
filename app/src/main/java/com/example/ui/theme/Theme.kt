package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = BluePrimaryLight,
    onPrimary = BentoBackgroundDark,
    primaryContainer = BlueContainerDark,
    onPrimaryContainer = BlueContainer,
    secondary = TealAccentLight,
    onSecondary = BentoBackgroundDark,
    secondaryContainer = TealContainerDark,
    onSecondaryContainer = TealContainer,
    tertiary = StatusWarning,
    background = BentoBackgroundDark,
    surface = BentoSurfaceDark,
    onBackground = BentoTextPrimaryDark,
    onSurface = BentoTextPrimaryDark,
    surfaceVariant = BentoSurfaceVariantDark,
    onSurfaceVariant = BentoTextSecondaryDark,
    outline = BentoBorderDark
)

private val LightColorScheme = lightColorScheme(
    primary = BluePrimary,
    onPrimary = Color.White,
    primaryContainer = BentoBlueContainer,
    onPrimaryContainer = BentoBlueOnContainer,
    secondary = TealAccent,
    onSecondary = Color.White,
    secondaryContainer = BentoTealContainer,
    onSecondaryContainer = BentoTealOnContainer,
    tertiary = StatusWarning,
    background = BentoBackground,
    surface = BentoSurface,
    onBackground = BentoTextPrimary,
    onSurface = BentoTextPrimary,
    surfaceVariant = BentoSurfaceVariant,
    onSurfaceVariant = BentoTextSecondary,
    outline = BentoBorder
)

@Composable
fun SmartProcurementTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Use our designed high-contrast enterprise palette
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        shapes = Shapes,
        content = content
    )
}
