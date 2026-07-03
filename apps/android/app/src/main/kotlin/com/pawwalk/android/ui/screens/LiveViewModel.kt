package com.pawwalk.android.ui.screens

import android.annotation.SuppressLint
import android.app.Application
import android.os.Looper
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.pawwalk.android.BuildConfig
import com.pawwalk.android.data.TokenStore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.doubleOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener

class LiveViewModel(app: Application) : AndroidViewModel(app) {
    data class Fix(val lat: Double, val lng: Double)
    enum class Phase { CONNECTING, TRACKING, NO_BOOKING, DENIED, FAILED }
    data class State(
        val phase: Phase = Phase.CONNECTING,
        val fixes: List<Fix> = emptyList(),
        val startedAtMs: Long? = null,
    )

    private val _state = MutableStateFlow(State())
    val state: StateFlow<State> = _state.asStateFlow()

    private var socket: WebSocket? = null
    private val fused = LocationServices.getFusedLocationProviderClient(app)

    // ponytail: connect() is called from LiveScreen's LaunchedEffect but
    // never spelled out in the course — it's just "resolve the token, then
    // openSocket", the connective tissue between the token/auth module and
    // this one.
    fun connect(bookingId: String?) {
        if (bookingId == null) {
            _state.update { it.copy(phase = Phase.NO_BOOKING) }
            return
        }
        val token = TokenStore.getToken()
        if (token == null) {
            _state.update { it.copy(phase = Phase.FAILED) }
            return
        }
        _state.update { it.copy(phase = Phase.CONNECTING, startedAtMs = System.currentTimeMillis()) }
        openSocket(bookingId, token)
    }

    private fun openSocket(bookingId: String, token: String) {
        val base = BuildConfig.API_BASE_URL.trimEnd('/')
        val wsBase = base.replaceFirst("https://", "wss://").replaceFirst("http://", "ws://")
        val url = "$wsBase/ws/track/$bookingId?token=$token"
        val request = Request.Builder().url(url).build()
        socket = OkHttpClient().newWebSocket(request, object : WebSocketListener() {
            override fun onMessage(webSocket: WebSocket, text: String) = handleFrame(text)
            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                _state.update { if (it.phase == Phase.NO_BOOKING) it else it.copy(phase = Phase.FAILED) }
            }
        })
    }

    // ponytail: the wire format is never spelled out beyond publish()'s
    // outgoing shape ({"type":"position","lat":…,"lng":…}) — handleFrame
    // mirrors that same shape for incoming frames, matching every other
    // model in the app (kotlinx.serialization, ignoreUnknownKeys).
    private fun handleFrame(text: String) {
        val fix = runCatching {
            val obj = Json.parseToJsonElement(text).jsonObject
            Fix(
                lat = obj["lat"]!!.jsonPrimitive.doubleOrNull!!,
                lng = obj["lng"]!!.jsonPrimitive.doubleOrNull!!,
            )
        }.getOrNull() ?: return
        _state.update { it.copy(phase = Phase.TRACKING, fixes = it.fixes + fix) }
    }

    private fun publish(lat: Double, lng: Double) {
        socket?.send("""{"type":"position","lat":$lat,"lng":$lng}""")
    }

    fun onPermissionDenied() {
        _state.update { it.copy(phase = Phase.DENIED) }
    }

    @SuppressLint("MissingPermission")
    fun startLocationUpdates() {
        val req = LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 3000L)
            .setMinUpdateDistanceMeters(5f).build()
        try {
            fused.requestLocationUpdates(req, locationCallback, Looper.getMainLooper())
        } catch (e: SecurityException) {
            _state.update { it.copy(phase = Phase.DENIED) }
        }
    }

    private val locationCallback = object : LocationCallback() {
        override fun onLocationResult(result: LocationResult) {
            result.lastLocation?.let { publish(it.latitude, it.longitude) }
        }
    }

    override fun onCleared() {
        socket?.close(1000, null)
        fused.removeLocationUpdates(locationCallback)
    }

    companion object {
        /** Doesn't read `this` — a pure function of the fix list, callable with no instance. */
        fun distanceMeters(fixes: List<Fix>): Double {
            if (fixes.size < 2) return 0.0
            var total = 0.0
            for (i in 1 until fixes.size) {
                val a = fixes[i - 1]
                val b = fixes[i]
                // Small-distance equirectangular approximation — fine at
                // dog-walk scale, not for cross-country routes.
                val metersPerDegLat = 111_320.0
                val metersPerDegLng = 111_320.0 * kotlin.math.cos(Math.toRadians((a.lat + b.lat) / 2))
                val dy = (b.lat - a.lat) * metersPerDegLat
                val dx = (b.lng - a.lng) * metersPerDegLng
                total += kotlin.math.sqrt(dx * dx + dy * dy)
            }
            return total
        }
    }
}
