package com.pawwalk.android.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.pawwalk.android.data.Pet
import com.pawwalk.android.data.PetRepository
import com.pawwalk.android.data.User
import com.pawwalk.android.ui.components.DmText
import com.pawwalk.android.ui.components.MonoText
import com.pawwalk.android.ui.theme.Hud

@Composable
fun ProfileScreen(
    user: User?,
    onClose: () -> Unit,
    onBookings: () -> Unit,
    onPets: () -> Unit,
    onLogout: () -> Unit,
) {
    val c = Hud.colors
    var pets by remember { mutableStateOf<List<Pet>>(emptyList()) }
    LaunchedEffect(Unit) { pets = runCatching { PetRepository.list() }.getOrDefault(emptyList()) }
    Box(Modifier.fillMaxSize().background(c.canvas)) {
        Column(
            Modifier.fillMaxSize().verticalScroll(rememberScrollState())
                .statusBarsPadding().padding(horizontal = 24.dp).padding(top = 16.dp, bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp),
        ) {
            DmText(user?.name ?: "PawWalk", c.ink, sizeSp = 20f, weight = FontWeight.SemiBold)
            MonoText(user?.email ?: "", c.ink.copy(alpha = 0.55f), sizeSp = 9.5f, upper = false)
            MonoText(user?.role ?: "", c.accent, sizeSp = 9f)

            ProfileRow(c, "Bookings", onClick = onBookings)
            ProfileRow(c, "Pets (${pets.size})", onClick = onPets)
            ProfileRow(c, "Log out", onClick = onLogout, danger = true)
        }
    }
}

@Composable
private fun ProfileRow(
    c: com.pawwalk.android.ui.theme.BrandColors,
    label: String,
    onClick: () -> Unit,
    danger: Boolean = false,
) {
    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(c.canvasDeep.copy(alpha = 0.4f))
            .clickable { onClick() }
            .padding(16.dp),
    ) {
        MonoText(label, if (danger) c.pinAmber else c.ink, sizeSp = 10.5f)
    }
}
