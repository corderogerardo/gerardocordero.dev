package com.pawwalk.android.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.pawwalk.android.data.Booking
import com.pawwalk.android.data.Walker
import com.pawwalk.android.data.WalkerProfileUpdate
import com.pawwalk.android.ui.components.DmText
import com.pawwalk.android.ui.components.MonoText
import com.pawwalk.android.ui.theme.BrandColors
import com.pawwalk.android.ui.theme.Hud

@Composable
fun WalkerScreen(
    onTrack: (Booking) -> Unit,
    viewModel: WalkerViewModel = viewModel(),
) {
    val c = Hud.colors
    val state by viewModel.state.collectAsState()
    var showEdit by remember { mutableStateOf(false) }

    Column(Modifier.fillMaxSize().background(c.canvas).padding(16.dp)) {
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            MonoText("Your bookings", c.ink, sizeSp = 12f)
            MonoText("Edit", c.accent, sizeSp = 10f, modifier = Modifier.clickable { showEdit = true })
        }
        Spacer(Modifier.height(16.dp))

        when {
            state.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = c.accent)
            }
            state.error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                MonoText("Couldn't load: ${state.error}", c.ink.copy(alpha = 0.6f), upper = false)
            }
            else -> LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(state.bookings, key = { it.id }) { b ->
                    WalkCard(c, b, onTrack = { onTrack(b) }) { action -> viewModel.act(b.id, action) }
                }
            }
        }
    }

    if (showEdit) {
        EditProfileDialog(state.profile, onDismiss = { showEdit = false }) { update ->
            viewModel.updateProfile(update); showEdit = false
        }
    }
}

@Composable
private fun WalkCard(c: BrandColors, booking: Booking, onTrack: () -> Unit, onAction: (String) -> Unit) {
    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(c.canvasDeep.copy(alpha = 0.4f))
            .padding(16.dp),
    ) {
        DmText(booking.dogName, c.ink, sizeSp = 15f, weight = FontWeight.SemiBold)
        Spacer(Modifier.height(4.dp))
        MonoText(booking.status.replace('_', ' '), c.accent, sizeSp = 9f)
        Spacer(Modifier.height(10.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            when (booking.status) {
                "pending" -> {
                    MonoText("Accept", c.signalGreen, sizeSp = 9f, modifier = Modifier.clickable { onAction("accept") })
                    MonoText("Decline", c.pinAmber, sizeSp = 9f, modifier = Modifier.clickable { onAction("decline") })
                }
                "confirmed" -> MonoText("Start", c.accent, sizeSp = 9f, modifier = Modifier.clickable { onAction("start") })
                "in_progress" -> {
                    MonoText("Track", c.pinBlue, sizeSp = 9f, modifier = Modifier.clickable { onTrack() })
                    MonoText("Complete", c.signalGreen, sizeSp = 9f, modifier = Modifier.clickable { onAction("complete") })
                }
            }
        }
    }
}

@Composable
private fun EditProfileDialog(profile: Walker?, onDismiss: () -> Unit, onSave: (WalkerProfileUpdate) -> Unit) {
    var bio by remember(profile) { mutableStateOf(profile?.bio ?: "") }
    var priceDollars by remember(profile) { mutableStateOf(((profile?.pricePer30MinCents ?: 0) / 100).toString()) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Edit profile") },
        text = {
            Column {
                OutlinedTextField(value = bio, onValueChange = { bio = it }, label = { Text("Bio") })
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = priceDollars,
                    onValueChange = { priceDollars = it.filter(Char::isDigit) },
                    label = { Text("Price per 30 min ($)") },
                )
            }
        },
        confirmButton = {
            Button(onClick = {
                onSave(
                    WalkerProfileUpdate(
                        bio = bio,
                        neighborhoods = profile?.neighborhoods ?: emptyList(),
                        pricePer30MinCents = (priceDollars.toIntOrNull() ?: 0) * 100,
                    )
                )
            }) { Text("Save") }
        },
        dismissButton = { Button(onClick = onDismiss) { Text("Cancel") } },
    )
}
