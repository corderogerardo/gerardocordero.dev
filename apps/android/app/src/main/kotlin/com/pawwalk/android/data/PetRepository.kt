package com.pawwalk.android.data

// ponytail: lessons-android/07-networking.js calls this PetRepository.fetchPets(),
// but every later reference (10-bookings.js, 12-assistant-graduation.js) calls
// it PetRepository.list() / .create() — latest lesson wins per the course's
// own convention, so this is the .list()/.create() shape. fetchPets() isn't kept
// as an alias since nothing in the assembled app still calls it.
object PetRepository {
    private val api: PawWalkApi get() = Network.api

    suspend fun list(): List<Pet> = api.getPets()

    suspend fun create(request: CreatePetRequest): Pet = api.createPet(request)

    suspend fun delete(petId: String) = api.deletePet(petId)
}
