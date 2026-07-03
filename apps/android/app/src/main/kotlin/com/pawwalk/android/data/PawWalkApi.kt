package com.pawwalk.android.data

import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

// The full Retrofit interface. lessons-android/07-networking.js and
// 08-auth.js teach this file in pieces (walkers, bookings, then auth) — this
// assembles every endpoint those lessons reference by name into one
// annotated interface. See docs references in the lessons for the shape of
// each JSON body (docs/API-CONTRACT.md, in the fictional apps/backend this
// course is written against).
interface PawWalkApi {
    // Auth
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    @POST("auth/signup")
    suspend fun signup(@Body request: SignupRequest): AuthResponse

    @GET("auth/me")
    suspend fun me(): User

    // Walkers
    @GET("walkers")
    suspend fun getWalkers(): List<Walker>

    @GET("walkers/me")
    suspend fun walkerProfile(): Walker

    @PUT("walkers/me")
    suspend fun updateWalkerProfile(@Body update: WalkerProfileUpdate): Walker

    // Bookings
    @POST("bookings")
    suspend fun createBooking(@Body request: CreateBookingRequest): Booking

    @GET("bookings")
    suspend fun getBookings(): List<Booking>

    @POST("bookings/{id}/cancel")
    suspend fun cancelBooking(@Path("id") bookingId: String): Booking

    @POST("bookings/{id}/{action}")
    suspend fun transitionBooking(@Path("id") bookingId: String, @Path("action") action: String): Booking

    @GET("bookings/stats")
    suspend fun ownerStats(): OwnerStats

    // Pets
    @GET("pets")
    suspend fun getPets(): List<Pet>

    @POST("pets")
    suspend fun createPet(@Body request: CreatePetRequest): Pet

    @DELETE("pets/{id}")
    suspend fun deletePet(@Path("id") petId: String)

    // Assistant
    @POST("assistant/chat")
    suspend fun assistantChat(@Body request: AssistantChatRequest): AssistantReply
}

@kotlinx.serialization.Serializable
data class LoginRequest(val email: String, val password: String)

@kotlinx.serialization.Serializable
data class SignupRequest(val email: String, val password: String, val name: String, val role: String)
