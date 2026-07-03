import SwiftUI

/// The account hub: who's signed in, their pets, a "Your bookings" button
/// that presents BookingsView in a sheet, and log out.
//
// ponytail: described only in prose (10-bookings.js: "no new Swift at all —
// sheets, callbacks, and .task, the same parts, rearranged"); no shipping
// body was shown. See README deviations.
struct ProfileView: View {
    @Environment(AuthSession.self) private var auth
    @Environment(\.dismiss) private var dismiss
    @State private var showBookings = false
    @State private var showPets = false

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Text(auth.currentUser?.name ?? "Guest").font(.dm(17, .semibold))
                    Text(auth.currentUser?.email ?? "").font(.dm(13)).foregroundStyle(Brand.subtleInk)
                }
                Section {
                    Button("Your bookings") { showBookings = true }
                    Button("Manage pets") { showPets = true }
                }
                Section {
                    Button("Log out", role: .destructive) { auth.logOut() }
                }
            }
            .navigationTitle("Profile")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
        .sheet(isPresented: $showBookings) { BookingsView() }
        .sheet(isPresented: $showPets) { PetsView() }
    }
}
