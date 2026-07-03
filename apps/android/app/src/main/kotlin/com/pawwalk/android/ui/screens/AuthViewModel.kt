package com.pawwalk.android.ui.screens

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.pawwalk.android.data.AuthRepository
import com.pawwalk.android.data.TokenStore
import com.pawwalk.android.data.User
import com.pawwalk.android.data.toUserMessage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AuthViewModel : ViewModel() {

    sealed interface UiState {
        data object Idle : UiState
        data object Loading : UiState
        data class Success(val user: User) : UiState
        data class Error(val message: String) : UiState
    }

    private val _state = MutableStateFlow<UiState>(UiState.Idle)
    val state: StateFlow<UiState> = _state.asStateFlow()

    private val _currentUser = MutableStateFlow<User?>(null)
    val currentUser: StateFlow<User?> = _currentUser.asStateFlow()

    // ponytail: a real app would restore this from a saved User (or hit
    // GET /auth/me) on process start when a token is already on disk — the
    // course never builds that restore path, so signedIn starts true only
    // when TokenStore already has a token, false otherwise. See
    // MainActivity.kt for how this gates the initial screen.
    private val _signedIn = MutableStateFlow(false)
    val signedIn: StateFlow<Boolean> = _signedIn.asStateFlow()

    fun signup(email: String, password: String, name: String, role: String) = runAuthCall {
        AuthRepository.signup(email, password, name, role)
    }

    fun login(email: String, password: String) = runAuthCall {
        AuthRepository.login(email, password)
    }

    fun logout() {
        AuthRepository.logout()
        _currentUser.value = null
        _signedIn.value = false
        _state.value = UiState.Idle
    }

    private fun runAuthCall(block: suspend () -> User) {
        viewModelScope.launch {
            _state.value = UiState.Loading
            _state.value = try {
                val user = block()
                _currentUser.value = user
                _signedIn.value = true
                UiState.Success(user)
            } catch (e: Exception) {
                UiState.Error(e.toUserMessage())
            }
        }
    }

    companion object {
        /** True the moment a JWT is already on disk from a previous session. */
        fun hasStoredToken(): Boolean = TokenStore.getToken() != null
    }
}

// ponytail: shared field validation, referenced from AuthScreen.kt as
// `validate(email, password, name, isSignup)` but never defined in the
// lessons — kept tiny and boring on purpose.
fun validate(email: String, password: String, name: String, isSignup: Boolean): String? = when {
    email.isBlank() -> "Enter your email"
    password.length < 8 -> "Password must be at least 8 characters"
    isSignup && name.isBlank() -> "Enter your name"
    else -> null
}
