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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.pawwalk.android.data.Walker
import com.pawwalk.android.ui.components.DmText
import com.pawwalk.android.ui.components.MonoText
import com.pawwalk.android.ui.theme.BrandColors
import com.pawwalk.android.ui.theme.Hud

@Composable
fun AssistantScreen(onClose: () -> Unit, onBook: (Walker) -> Unit, viewModel: AssistantViewModel = viewModel()) {
    val c = Hud.colors
    val messages by viewModel.messages.collectAsState()
    val sending by viewModel.sending.collectAsState()
    val listState = rememberLazyListState()
    var draft by remember { mutableStateOf("") }

    LaunchedEffect(messages.size) {
        if (messages.isNotEmpty()) listState.animateScrollToItem(messages.size - 1)
    }

    Column(Modifier.fillMaxSize().background(c.canvas).statusBarsPadding()) {
        MonoText("Assistant", c.ink, sizeSp = 12f, modifier = Modifier.padding(16.dp))

        LazyColumn(
            state = listState,
            modifier = Modifier.weight(1f).fillMaxWidth().padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            itemsIndexed(messages) { _, message ->
                MessageBubble(c, message, onBook)
            }
            if (sending) {
                item {
                    Box(Modifier.padding(6.dp)) { CircularProgressIndicator(color = c.accent, strokeWidth = 2.dp) }
                }
            }
        }

        val canSend = draft.isNotBlank() && !sending
        Row(
            Modifier.fillMaxWidth().padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            OutlinedTextField(
                value = draft,
                onValueChange = { draft = it },
                modifier = Modifier.weight(1f),
                singleLine = true,
            )
            Spacer(Modifier.width(8.dp))
            Box(
                Modifier
                    .clip(RoundedCornerShape(50))
                    .background(if (canSend) c.accent else c.canvasDeep)
                    .clickable(enabled = canSend) {
                        val text = draft
                        draft = ""
                        viewModel.send(text)
                    }
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                MonoText("Send", if (canSend) c.onInverse else c.ink.copy(alpha = 0.4f), sizeSp = 9.5f)
            }
        }
    }
}

@Composable
private fun MessageBubble(c: BrandColors, message: AssistantViewModel.Message, onBook: (Walker) -> Unit) {
    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(if (message.fromUser) c.accent else c.canvasDeep.copy(alpha = 0.4f))
            .padding(12.dp),
    ) {
        DmText(message.text, if (message.fromUser) c.onInverse else c.ink, sizeSp = 13f)
        if (message.walkers.isNotEmpty()) {
            Spacer(Modifier.height(8.dp))
            message.walkers.forEach { walker ->
                Row(
                    Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(c.canvas)
                        .clickable { onBook(walker) }
                        .padding(10.dp),
                ) {
                    DmText(walker.name, c.ink, sizeSp = 12f)
                    Spacer(Modifier.width(8.dp))
                    MonoText(walker.priceLabel, c.accent, sizeSp = 8.5f, upper = false)
                }
            }
        }
    }
}
