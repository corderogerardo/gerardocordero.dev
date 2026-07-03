package com.pawwalk.android.data

// Assembled from references across lessons-android/09-lists-navigation.js
// (transition), 10-bookings.js (createBooking, fetchBookings, cancelBooking) —
// no single lesson shows the whole object, so this collects every method the
// ViewModels call by name.
object BookingRepository {
    private val api: PawWalkApi get() = Network.api

    suspend fun createBooking(request: CreateBookingRequest): Booking = api.createBooking(request)

    suspend fun fetchBookings(): List<Booking> = api.getBookings()

    suspend fun cancelBooking(bookingId: String): Booking = api.cancelBooking(bookingId)

    /** Accept / decline / start / complete — any non-cancel status transition a walker drives. */
    suspend fun transition(bookingId: String, action: String): Booking = api.transitionBooking(bookingId, action)
}
