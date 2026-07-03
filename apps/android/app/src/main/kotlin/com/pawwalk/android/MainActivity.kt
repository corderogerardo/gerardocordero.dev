package com.pawwalk.android

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.pawwalk.android.data.TokenStore
import com.pawwalk.android.data.Walker
import com.pawwalk.android.ui.screens.AssistantScreen
import com.pawwalk.android.ui.screens.AuthScreen
import com.pawwalk.android.ui.screens.AuthViewModel
import com.pawwalk.android.ui.screens.BookingsScreen
import com.pawwalk.android.ui.screens.CreateBookingScreen
import com.pawwalk.android.ui.screens.HomeScreen
import com.pawwalk.android.ui.screens.LiveScreen
import com.pawwalk.android.ui.screens.PetsScreen
import com.pawwalk.android.ui.screens.ProfileScreen
import com.pawwalk.android.ui.screens.WalkerScreen
import com.pawwalk.android.ui.screens.WalkersScreen
import com.pawwalk.android.ui.theme.Hud
import com.pawwalk.android.ui.theme.PawWalkTheme

// The real navigation model: a private sealed interface instead of
// androidx.navigation, since every destination in this course either takes
// no arguments or takes a value already in memory (a Walker, a Booking id) —
// no deep links, no back-stack persistence across process death needed.
// lessons-android/09-lists-navigation.js.
private sealed interface Screen {
    data object Home : Screen
    // ponytail: the lesson's Screen.Live carries a dogName (09-lists-navigation.js,
    // `data class Live(val dogName: String? = null)`), but LiveViewModel.connect()
    // needs a *booking id* to open `/ws/track/$bookingId` (11-live-tracking.js) — a
    // dog name can't open that socket. Reconciled here on bookingId, the value the
    // screen actually needs; HomeScreen still hands over the upcoming booking's id.
    data class Live(val bookingId: String? = null) : Screen
    data object Walkers : Screen
    data class CreateBooking(val walker: Walker) : Screen
    data object Bookings : Screen
    data object Profile : Screen
    data object Pets : Screen
    data object Assistant : Screen
}

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        TokenStore.init(this)
        enableEdgeToEdge()
        setContent {
            PawWalkTheme {
                Surface(Modifier.fillMaxSize(), color = Hud.colors.canvas) {
                    val authViewModel: AuthViewModel = viewModel()
                    val signedIn by authViewModel.signedIn.collectAsState()
                    val currentUser by authViewModel.currentUser.collectAsState()

                    if (!signedIn) {
                        AuthScreen(authViewModel)
                        return@Surface
                    }

                    var screen by remember { mutableStateOf<Screen>(Screen.Home) }
                    Crossfade(targetState = screen, label = "screen") { current ->
                        when (current) {
                            // ponytail: the course models two roles (owner, walker —
                            // see 00-welcome.js) but MainActivity's own nav fragment
                            // ("…the rest of the cases…") never shows the branch. A
                            // walker's Home is WalkerScreen (their bookings + profile
                            // editor), everyone else gets the owner HomeScreen.
                            is Screen.Home -> if (currentUser?.role == "walker") {
                                WalkerScreen(onTrack = { booking -> screen = Screen.Live(booking.id) })
                            } else {
                                HomeScreen(
                                    user = currentUser,
                                    onTrack = { bookingId -> screen = Screen.Live(bookingId) },
                                    onBook = { screen = Screen.Walkers },
                                    onProfile = { screen = Screen.Profile },
                                    onAssistant = { screen = Screen.Assistant },
                                    onViewBookings = { screen = Screen.Bookings },
                                )
                            }
                            is Screen.Walkers -> WalkersScreen(
                                onWalkerSelected = { walker -> screen = Screen.CreateBooking(walker) },
                            )
                            is Screen.CreateBooking -> CreateBookingScreen(
                                walker = current.walker,
                                onClose = { screen = Screen.Walkers },
                                onBooked = { screen = Screen.Bookings },
                            )
                            is Screen.Bookings -> BookingsScreen()
                            is Screen.Live -> LiveScreen(bookingId = current.bookingId)
                            is Screen.Profile -> ProfileScreen(
                                user = currentUser,
                                onClose = { screen = Screen.Home },
                                onBookings = { screen = Screen.Bookings },
                                onPets = { screen = Screen.Pets },
                                onLogout = { authViewModel.logout(); screen = Screen.Home },
                            )
                            is Screen.Pets -> PetsScreen()
                            is Screen.Assistant -> AssistantScreen(
                                onClose = { screen = Screen.Home },
                                onBook = { walker -> screen = Screen.CreateBooking(walker) },
                            )
                        }
                    }
                }
            }
        }
    }
}
