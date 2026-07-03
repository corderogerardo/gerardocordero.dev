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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.pawwalk.android.ui.components.MonoText
import com.pawwalk.android.ui.theme.Hud

@Composable
fun AuthScreen(viewModel: AuthViewModel = viewModel()) {
    val c = Hud.colors
    val state by viewModel.state.collectAsState()

    var isSignup by remember { mutableStateOf(false) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var role by remember { mutableStateOf("owner") }
    var validationError by remember { mutableStateOf<String?>(null) }

    val loading = state is AuthViewModel.UiState.Loading
    val serverError = (state as? AuthViewModel.UiState.Error)?.message

    fun submit() {
        validationError = validate(email, password, name, isSignup)
        if (validationError != null) return
        if (isSignup) viewModel.signup(email.trim(), password, name.trim(), role)
        else viewModel.login(email.trim(), password)
    }

    Column(
        Modifier.fillMaxSize().background(c.canvas).padding(24.dp),
        verticalArrangement = Arrangement.Center,
    ) {
        MonoText(if (isSignup) "Sign up" else "Log in", c.ink, sizeSp = 13f)
        Spacer(Modifier.height(20.dp))

        if (isSignup) {
            AuthField(label = "Name", value = name, onValueChange = { name = it })
            Spacer(Modifier.height(14.dp))
        }
        AuthField(
            label = "Email", value = email, onValueChange = { email = it },
            keyboardType = KeyboardType.Email,
        )
        Spacer(Modifier.height(14.dp))
        AuthField(
            label = "Password", value = password, onValueChange = { password = it },
            keyboardType = KeyboardType.Password, isPassword = true,
        )

        if (isSignup) {
            Spacer(Modifier.height(14.dp))
            Row {
                listOf("owner", "walker").forEach { candidate ->
                    val selected = role == candidate
                    Row(
                        Modifier
                            .clip(RoundedCornerShape(50))
                            .background(if (selected) c.accent else c.canvasDeep)
                            .clickable { role = candidate }
                            .padding(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        MonoText(candidate, if (selected) c.onInverse else c.ink.copy(alpha = 0.6f), sizeSp = 9.5f)
                    }
                    Spacer(Modifier.width(8.dp))
                }
            }
        }

        (validationError ?: serverError)?.let { message ->
            Spacer(Modifier.height(12.dp))
            MonoText(message, Hud.colors.pinAmber, sizeSp = 9.5f, upper = false)
        }

        Spacer(Modifier.height(20.dp))
        Button(onClick = ::submit, enabled = !loading, modifier = Modifier.fillMaxWidth()) {
            if (loading) CircularProgressIndicator(modifier = Modifier.height(18.dp))
            else Text(if (isSignup) "Sign up" else "Log in")
        }

        Spacer(Modifier.height(12.dp))
        MonoText(
            if (isSignup) "Have an account? Log in" else "New here? Sign up",
            c.accent, sizeSp = 9.5f,
            modifier = Modifier.clickable { isSignup = !isSignup },
        )
    }
}

@Composable
private fun AuthField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    keyboardType: KeyboardType = KeyboardType.Text,
    isPassword: Boolean = false,
) {
    val c = Hud.colors
    Column {
        MonoText(label, c.ink.copy(alpha = 0.55f), sizeSp = 9.5f, trackingEm = 0.1f)
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth().padding(top = 6.dp),
            singleLine = true,
        )
    }
}
