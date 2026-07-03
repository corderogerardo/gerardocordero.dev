package com.pawwalk.android.data

object WalkerRepository {
    private val api: PawWalkApi get() = Network.api

    suspend fun fetchWalkers(): List<Walker> = api.getWalkers()

    suspend fun myProfile(): Walker = api.walkerProfile()

    suspend fun updateProfile(update: WalkerProfileUpdate): Walker = api.updateWalkerProfile(update)
}
