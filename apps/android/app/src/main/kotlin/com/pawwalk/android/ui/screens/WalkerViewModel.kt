package com.pawwalk.android.ui.screens

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.pawwalk.android.data.Booking
import com.pawwalk.android.data.BookingRepository
import com.pawwalk.android.data.Walker
import com.pawwalk.android.data.WalkerProfileUpdate
import com.pawwalk.android.data.WalkerRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

// The walker-role dashboard: a walker's own bookings + their editable
// profile. lessons-android/09-lists-navigation.js teaches this file's state
// shape, act(), and the edit-profile dialog wiring, but not updateProfile()
// or load() themselves — filled in following the exact same
// loading/try-catch pattern every other ViewModel in the course uses.
class WalkerViewModel : ViewModel() {

    data class State(
        val bookings: List<Booking> = emptyList(),
        val profile: Walker? = null,
        val loading: Boolean = true,
        val error: String? = null,
    )

    private val _state = MutableStateFlow(State())
    val state: StateFlow<State> = _state.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = _state.value.copy(loading = true, error = null)
            _state.value = try {
                State(
                    bookings = BookingRepository.fetchBookings(),
                    profile = WalkerRepository.myProfile(),
                    loading = false,
                )
            } catch (e: Exception) {
                _state.value.copy(loading = false, error = e.message ?: "Something went wrong")
            }
        }
    }

    fun act(id: String, action: String) {
        viewModelScope.launch { runCatching { BookingRepository.transition(id, action) }; load() }
    }

    fun updateProfile(update: WalkerProfileUpdate) {
        viewModelScope.launch { runCatching { WalkerRepository.updateProfile(update) }; load() }
    }
}
