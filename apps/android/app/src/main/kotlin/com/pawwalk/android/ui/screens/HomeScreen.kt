package com.pawwalk.android.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import com.pawwalk.android.data.User
import com.pawwalk.android.ui.components.CalendarIcon
import com.pawwalk.android.ui.components.DmText
import com.pawwalk.android.ui.components.HomeIcon
import com.pawwalk.android.ui.components.LocationArrowIcon
import com.pawwalk.android.ui.components.MonoText
import com.pawwalk.android.ui.components.PawIcon
import com.pawwalk.android.ui.theme.BrandColors
import com.pawwalk.android.ui.theme.Hud

@Composable
fun HomeScreen(
    user: User?,
    // ponytail: lesson's signature names this `dogName: String?`
    // (09-lists-navigation.js) but LiveScreen/LiveViewModel need a booking id
    // to open the tracking socket — see the Screen.Live note in
    // MainActivity.kt. Renamed to match what's actually threaded through.
    onTrack: (bookingId: String?) -> Unit,
    onBook: () -> Unit = {},
    onProfile: () -> Unit = {},
    onAssistant: () -> Unit = {},
    onViewBookings: () -> Unit = {},
    viewModel: HomeViewModel = viewModel(),
) {
    val c = Hud.colors
    val state by viewModel.state.collectAsState()
    Box(Modifier.fillMaxSize().background(c.canvas)) {
        Column(
            Modifier.fillMaxSize().verticalScroll(rememberScrollState())
                .statusBarsPadding().padding(horizontal = 24.dp).padding(top = 16.dp, bottom = 96.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp),
        ) {
            MonoText("Hi, ${user?.name ?: "there"}", c.ink.copy(alpha = 0.55f), sizeSp = 10f)

            state.upcoming?.let { upcoming ->
                Column(
                    Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(c.inverse)
                        .clickable { onViewBookings() }
                        .padding(16.dp),
                ) {
                    MonoText("Upcoming walk", c.onInverse.copy(alpha = 0.6f), sizeSp = 9f)
                    Spacer(Modifier.height(6.dp))
                    DmText(upcoming.booking.dogName, c.onInverse, sizeSp = 16f, weight = FontWeight.SemiBold)
                }
            }

            state.stats?.let { stats ->
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatCard(c, "Walks", stats.totalWalks.toString(), Modifier.weight(1f))
                    StatCard(c, "Spent", "$%.0f".format(stats.totalSpentCents / 100.0), Modifier.weight(1f))
                }
            }
        }

        HudTabBar(
            c, { onTrack(state.upcoming?.booking?.id) },
            onBook, onProfile,
            Modifier.align(Alignment.BottomCenter).navigationBarsPadding().padding(16.dp)
        )
    }
}

@Composable
private fun StatCard(c: BrandColors, label: String, value: String, modifier: Modifier = Modifier) {
    Column(
        modifier
            .clip(RoundedCornerShape(16.dp))
            .background(c.canvasDeep.copy(alpha = 0.4f))
            .padding(16.dp)
    ) {
        MonoText(label, c.ink.copy(alpha = 0.55f), sizeSp = 9f)
        Spacer(Modifier.height(4.dp))
        DmText(value, c.ink, sizeSp = 18f, weight = FontWeight.SemiBold)
    }
}

@Composable
private fun HudTabBar(
    c: BrandColors, onTrack: () -> Unit, onBook: () -> Unit, onProfile: () -> Unit, modifier: Modifier = Modifier,
) {
    val on = c.onInverse
    Row(
        modifier.clip(RoundedCornerShape(50)).background(c.inverse).padding(6.dp),
        horizontalArrangement = Arrangement.spacedBy(2.dp)
    ) {
        Tab("Home", active = true) { HomeIcon(on, 15.dp) }
        Tab("Book", onClick = onBook) { CalendarIcon(on.copy(alpha = 0.6f), 15.dp) }
        Tab("Track", onClick = onTrack) { LocationArrowIcon(on.copy(alpha = 0.6f), 15.dp) }
        Tab("Profile", onClick = onProfile) { PawIcon(on.copy(alpha = 0.6f), 15.dp) }
    }
}

@Composable
private fun RowScope.Tab(
    label: String, active: Boolean = false, onClick: () -> Unit = {}, icon: @Composable () -> Unit,
) {
    val c = Hud.colors
    val on = c.onInverse
    Column(
        Modifier.weight(1f).clip(RoundedCornerShape(50))
            .background(if (active) c.accent else Color.Transparent)
            .clickable { onClick() }.padding(vertical = 9.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        icon()
        Spacer(Modifier.height(3.dp))
        MonoText(label, if (active) on else on.copy(alpha = 0.6f), sizeSp = 8.5f, trackingEm = 0.08f)
    }
}
