package com.pawwalk.android.ui.screens

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.pawwalk.android.data.Booking
import com.pawwalk.android.data.BookingRepository
import com.pawwalk.android.data.OwnerStats
import com.pawwalk.android.data.Pet
import com.pawwalk.android.data.PetRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

// ponytail: HomeScreen.kt's signature (09-lists-navigation.js) references
// `viewModel.state` with `.upcoming?.booking?.dogName` and `.pets`, but
// HomeViewModel itself is never shown — this is the minimal state shape that
// satisfies both call sites, built from repositories every other screen
// already uses (BookingRepository, PetRepository).
class HomeViewModel : ViewModel() {

    data class UpcomingWalk(val booking: Booking)

    data class State(
        val loading: Boolean = true,
        val upcoming: UpcomingWalk? = null,
        val pets: List<Pet> = emptyList(),
        val stats: OwnerStats? = null,
    )

    private val _state = MutableStateFlow(State())
    val state: StateFlow<State> = _state.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = _state.value.copy(loading = true)
            val bookings = runCatching { BookingRepository.fetchBookings() }.getOrDefault(emptyList())
            val pets = runCatching { PetRepository.list() }.getOrDefault(emptyList())
            val stats = runCatching { com.pawwalk.android.data.Network.api.ownerStats() }.getOrNull()
            _state.value = State(
                loading = false,
                upcoming = bookings.firstOrNull { it.isActive }?.let { UpcomingWalk(it) },
                pets = pets,
                stats = stats,
            )
        }
    }
}
