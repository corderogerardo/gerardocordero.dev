package com.pawwalk.android.data

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// One data class per JSON shape in docs/API-CONTRACT.md — see
// lessons-android/03-kotlin-for-apps.js ("data/Models.kt is the whole API
// contract, translated into Kotlin").

@Serializable
data class Walker(
    val id: String,
    val name: String,
    @SerialName("photo_url") val photoUrl: String? = null,
    val rating: Double,
    @SerialName("price_per_30min_cents") val pricePer30MinCents: Int,
    val bio: String = "",
    val neighborhoods: List<String> = emptyList(),
) {
    val priceLabel: String get() = "$%.0f / 30 min".format(pricePer30MinCents / 100.0)
}

@Serializable
data class Booking(
    val id: String,
    @SerialName("walker_id") val walkerId: String,
    @SerialName("dog_name") val dogName: String,
    @SerialName("start_time") val startTime: String,
    @SerialName("duration_minutes") val durationMinutes: Int,
    val status: String,
    @SerialName("price_cents") val priceCents: Int,
    @SerialName("created_at") val createdAt: String,
) {
    /** Walk hasn't happened yet or is happening now (excludes completed and cancelled). */
    val isActive: Boolean get() = status == "pending" || status == "confirmed" || status == "in_progress"
}

// ponytail: Pet isn't spelled out as a full data class anywhere in the course
// (only Pet.subtitle is taught, lessons-android/02-kotlin-deeper.js) — every
// field below is inferred from how PetsScreen.kt / CreateBookingScreen.kt use
// it (pet.name, breed, ageYears, weightKg). Reconciled against API-CONTRACT
// conventions (snake_case over the wire) for consistency with Walker/Booking.
@Serializable
data class Pet(
    val id: String,
    val name: String,
    val breed: String = "",
    @SerialName("age_years") val ageYears: Double? = null,
    @SerialName("weight_kg") val weightKg: Double? = null,
) {
    val subtitle: String get() = listOfNotNull(
        breed.ifBlank { null },
        ageYears?.let { "${it.toInt()} yrs" },
        weightKg?.let { "%.1f kg".format(it) },
    ).joinToString(" · ")
}

// ponytail: User/AuthResponse aren't shown as full data classes either — only
// referenced by type name in AuthViewModel/AuthRepository fragments
// (08-auth.js) and HomeScreen/ProfileScreen signatures (fun HomeScreen(user:
// User?, ...)). Shaped to match the auth flow: signup/login need email,
// password, name, role; the server hands back a user + JWT.
@Serializable
data class User(
    val id: String,
    val email: String,
    val name: String,
    val role: String, // "owner" | "walker"
)

@Serializable
data class AuthResponse(
    val user: User,
    val token: String,
)

// ponytail: referenced by PawWalkApi.ownerStats() (07-networking.js) but never
// spelled out — HomeViewModel's dashboard needs *something* to summarize.
@Serializable
data class OwnerStats(
    @SerialName("total_walks") val totalWalks: Int = 0,
    @SerialName("total_spent_cents") val totalSpentCents: Int = 0,
)

// ponytail: referenced by PawWalkApi.updateWalkerProfile() (WalkerRepository.kt,
// 02-kotlin-deeper.js / 07-networking.js) but never spelled out — a walker can
// edit exactly the fields Walker exposes as owned data (not id/rating, which
// the server computes).
@Serializable
data class WalkerProfileUpdate(
    val bio: String,
    val neighborhoods: List<String>,
    @SerialName("price_per_30min_cents") val pricePer30MinCents: Int,
)

@Serializable
data class CreateBookingRequest(
    @SerialName("walker_id") val walkerId: String,
    @SerialName("dog_name") val dogName: String,
    @SerialName("start_time") val startTime: String,
    @SerialName("duration_minutes") val durationMinutes: Int,
)

// ponytail: mirrors Pet's inferred shape above — used by PetsViewModel.add()
// (12-assistant-graduation.js) via PetRepository.create(request).
@Serializable
data class CreatePetRequest(
    val name: String,
    val breed: String = "",
    @SerialName("age_years") val ageYears: Double? = null,
    @SerialName("weight_kg") val weightKg: Double? = null,
)

// Assistant (12-assistant-graduation.js)
@Serializable
data class AssistantChatRequest(
    val message: String,
)

@Serializable
data class DraftBooking(
    @SerialName("walker_id") val walkerId: String,
    @SerialName("dog_name") val dogName: String? = null,
    @SerialName("start_time") val startTime: String? = null,
    @SerialName("duration_minutes") val durationMinutes: Int = 30,
)

@Serializable
data class AssistantReply(
    val reply: String,
    @SerialName("suggested_walkers") val suggestedWalkers: List<String> = emptyList(),
    @SerialName("draft_booking") val draftBooking: DraftBooking? = null,
)
