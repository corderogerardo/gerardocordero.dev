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
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.pawwalk.android.data.Booking
import com.pawwalk.android.ui.components.DmText
import com.pawwalk.android.ui.components.MonoText
import com.pawwalk.android.ui.theme.BrandColors
import com.pawwalk.android.ui.theme.Hud

@Composable
fun BookingsScreen(viewModel: BookingsViewModel = viewModel()) {
    val c = Hud.colors
    val state by viewModel.state.collectAsState()

    when (val s = state) {
        is BookingsViewModel.UiState.Loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = c.accent)
        }
        is BookingsViewModel.UiState.Error -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            MonoText("Couldn't load bookings: ${s.message}", c.ink.copy(alpha = 0.6f), upper = false)
        }
        is BookingsViewModel.UiState.Success -> LazyColumn(
            modifier = Modifier.fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(s.bookings, key = { it.id }) { booking ->
                BookingCard(c, booking, onCancel = { viewModel.cancel(booking.id) })
            }
        }
    }
}

@Composable
private fun BookingCard(c: BrandColors, booking: Booking, onCancel: () -> Unit) {
    val cancellable = booking.status == "pending" || booking.status == "confirmed"
    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(c.canvasDeep.copy(alpha = 0.4f))
            .padding(16.dp),
    ) {
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            DmText(booking.dogName, c.ink, sizeSp = 15f, weight = FontWeight.SemiBold)
            StatusPill(c, booking.status)
        }
        Spacer(Modifier.height(6.dp))
        MonoText("$%.2f".format(booking.priceCents / 100.0), c.ink.copy(alpha = 0.6f), sizeSp = 9f, upper = false)
        if (cancellable) {
            Spacer(Modifier.height(10.dp))
            MonoText("Cancel", c.pinAmber, sizeSp = 9f, modifier = Modifier.clickable { onCancel() })
        }
    }
}

@Composable
private fun StatusPill(c: BrandColors, status: String) {
    val color = when (status) {
        "completed" -> c.signalGreen
        "cancelled" -> Color(0xFFC0392B)
        "in_progress" -> c.pinBlue
        else -> c.accent
    }
    Row(
        Modifier.clip(RoundedCornerShape(50)).background(color.copy(alpha = 0.16f)).padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        MonoText(status.replace('_', ' '), color, sizeSp = 8.5f, trackingEm = 0.08f)
    }
}
