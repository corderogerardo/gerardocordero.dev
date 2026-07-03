package com.pawwalk.android.data

// ponytail: never shown as a full file in the course — AuthViewModel.kt
// (lessons-android/08-auth.js) calls AuthRepository.signup/login/logout by
// name only. Saves the token on success (that's the whole point of
// TokenStore) and clears it on logout.
object AuthRepository {
    private val api: PawWalkApi get() = Network.api

    suspend fun signup(email: String, password: String, name: String, role: String): User {
        val response = api.signup(SignupRequest(email, password, name, role))
        TokenStore.saveToken(response.token)
        return response.user
    }

    suspend fun login(email: String, password: String): User {
        val response = api.login(LoginRequest(email, password))
        TokenStore.saveToken(response.token)
        return response.user
    }

    fun logout() = TokenStore.clear()
}

/** Shared "what do we show the user" mapping for a failed suspend call. */
fun Throwable.toUserMessage(): String = message ?: "Something went wrong"
