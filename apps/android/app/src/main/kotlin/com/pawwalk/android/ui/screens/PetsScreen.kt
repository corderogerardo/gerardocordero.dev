package com.pawwalk.android.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.pawwalk.android.data.CreatePetRequest
import com.pawwalk.android.data.Pet
import com.pawwalk.android.data.PetRepository
import com.pawwalk.android.ui.components.DmText
import com.pawwalk.android.ui.components.MonoText
import com.pawwalk.android.ui.theme.Hud
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class PetsViewModel : ViewModel() {
    sealed interface UiState {
        data object Loading : UiState
        data class Success(val pets: List<Pet>) : UiState
        data class Error(val message: String) : UiState
    }

    private val _state = MutableStateFlow<UiState>(UiState.Loading)
    val state: StateFlow<UiState> = _state.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _state.value = UiState.Loading
            _state.value = try { UiState.Success(PetRepository.list()) }
            catch (e: Exception) { UiState.Error(e.message ?: "Couldn't load pets") }
        }
    }

    fun add(request: CreatePetRequest) {
        viewModelScope.launch { runCatching { PetRepository.create(request) }; load() }
    }
}

@Composable
fun PetsScreen(viewModel: PetsViewModel = viewModel()) {
    val c = Hud.colors
    val state by viewModel.state.collectAsState()

    when (val s = state) {
        is PetsViewModel.UiState.Loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = c.accent)
        }
        is PetsViewModel.UiState.Error -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            MonoText("Couldn't load pets: ${s.message}", c.ink.copy(alpha = 0.6f), upper = false)
        }
        is PetsViewModel.UiState.Success -> LazyColumn(
            modifier = Modifier.fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(s.pets, key = { it.id }) { pet ->
                Column(
                    Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(c.canvasDeep.copy(alpha = 0.4f))
                        .padding(16.dp),
                ) {
                    DmText(pet.name, c.ink, sizeSp = 15f, weight = FontWeight.SemiBold)
                    if (pet.subtitle.isNotBlank()) {
                        MonoText(pet.subtitle, c.ink.copy(alpha = 0.55f), sizeSp = 9f, upper = false)
                    }
                }
            }
        }
    }
}
