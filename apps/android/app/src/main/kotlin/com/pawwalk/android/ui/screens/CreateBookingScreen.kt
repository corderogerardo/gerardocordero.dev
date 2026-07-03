package com.pawwalk.android.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.pawwalk.android.data.Pet
import com.pawwalk.android.data.PetRepository
import com.pawwalk.android.data.Walker
import com.pawwalk.android.ui.components.DmText
import com.pawwalk.android.ui.components.MonoText
import com.pawwalk.android.ui.theme.Hud
import java.time.Instant
import java.time.temporal.ChronoUnit

@Composable
fun CreateBookingScreen(
    walker: Walker,
    onClose: () -> Unit,
    onBooked: () -> Unit,
    viewModel: CreateBookingViewModel = androidx.lifecycle.viewmodel.compose.viewModel(),
) {
    val c = Hud.colors
    val state by viewModel.state.collectAsState()

    var dogName by remember { mutableStateOf("") }
    var pets by remember { mutableStateOf<List<Pet>>(emptyList()) }
    var duration by remember { mutableStateOf(30) }
    var hoursFromNow by remember { mutableStateOf(2) }
    var validationError by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        pets = runCatching { PetRepository.list() }.getOrDefault(emptyList())
        if (dogName.isBlank()) pets.firstOrNull()?.let { dogName = it.name }
    }

    val startTime = Instant.now().plus(hoursFromNow.toLong(), ChronoUnit.HOURS)

    fun submit() {
        validationError = if (dogName.isBlank()) "Enter your dog's name" else null
        if (validationError != null) return
        viewModel.book(walker.id, dogName.trim(), startTime.toString(), duration)
    }

    LaunchedEffect(state) {
        if (state is CreateBookingViewModel.UiState.Success) onBooked()
    }

    Column(Modifier.fillMaxSize().background(c.canvas).padding(24.dp)) {
        MonoText("Book ${walker.name}", c.ink, sizeSp = 13f)
        Spacer(Modifier.height(20.dp))

        MonoText("Dog", c.ink.copy(alpha = 0.55f), sizeSp = 9.5f)
        Spacer(Modifier.height(6.dp))
        if (pets.isEmpty()) {
            OutlinedTextField(
                value = dogName,
                onValueChange = { dogName = it },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
        } else {
            Row {
                pets.forEach { pet ->
                    val selected = pet.name == dogName
                    Row(
                        Modifier
                            .clip(RoundedCornerShape(50))
                            .background(if (selected) c.accent else c.canvasDeep)
                            .clickable { dogName = pet.name }
                            .padding(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        DmText(pet.name, if (selected) c.onInverse else c.ink)
                    }
                }
            }
        }

        Spacer(Modifier.height(20.dp))
        MonoText("Duration: $duration min", c.ink.copy(alpha = 0.55f), sizeSp = 9.5f)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf(30, 60).forEach { minutes ->
                val selected = duration == minutes
                MonoText(
                    "$minutes",
                    if (selected) c.accent else c.ink.copy(alpha = 0.5f),
                    sizeSp = 10f,
                    modifier = Modifier.clickable { duration = minutes },
                )
            }
        }

        Spacer(Modifier.height(20.dp))
        MonoText("Start: in $hoursFromNow h", c.ink.copy(alpha = 0.55f), sizeSp = 9.5f)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            MonoText(
                "−", c.accent, sizeSp = 12f,
                modifier = Modifier.clickable { hoursFromNow = (hoursFromNow - 1).coerceAtLeast(1) },
            )
            MonoText(
                "+", c.accent, sizeSp = 12f,
                modifier = Modifier.clickable { hoursFromNow += 1 },
            )
        }

        validationError?.let {
            Spacer(Modifier.height(12.dp))
            MonoText(it, c.pinAmber, sizeSp = 9.5f, upper = false)
        }
        (state as? CreateBookingViewModel.UiState.Error)?.let {
            Spacer(Modifier.height(12.dp))
            MonoText(it.message, c.pinAmber, sizeSp = 9.5f, upper = false)
        }

        Spacer(Modifier.height(20.dp))
        Button(
            onClick = ::submit,
            enabled = state !is CreateBookingViewModel.UiState.Loading,
            modifier = Modifier.fillMaxWidth(),
        ) {
            if (state is CreateBookingViewModel.UiState.Loading) {
                CircularProgressIndicator(modifier = Modifier.height(18.dp))
            } else {
                Text("Book — ${walker.priceLabel}")
            }
        }
    }
}
