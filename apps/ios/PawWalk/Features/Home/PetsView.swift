import SwiftUI
import Observation

/// Where owners manage their dogs: an @Observable view model, a ViewState
/// switch, an add-pet sheet built on Form, and swipe-to-delete via .onDelete.
//
// ponytail: described only in prose (10-bookings.js: "the supporting cast");
// no shipping body was shown, and APIClient never spec'd addPet/deletePet.
// This is the smallest reconciling implementation. See README deviations.
@MainActor
@Observable
final class PetsViewModel {
    enum ViewState { case loading, loaded([Pet]), failed(String) }
    private(set) var state: ViewState = .loading

    func load() async {
        state = .loading
        do {
            state = .loaded(try await APIClient.shared.pets())
        } catch {
            state = .failed("Couldn't load your pets.")
        }
    }

    func add(name: String, breed: String) async {
        do {
            _ = try await APIClient.shared.addPet(name: name, breed: breed)
            await load()
        } catch {
            // Best-effort: the list simply won't include the new pet.
        }
    }

    func delete(at offsets: IndexSet) async {
        guard case .loaded(var pets) = state else { return }
        let removed = offsets.map { pets[$0] }
        pets.remove(atOffsets: offsets)
        state = .loaded(pets)
        for pet in removed {
            _ = try? await APIClient.shared.deletePet(id: pet.id)
        }
    }
}

struct PetsView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var model = PetsViewModel()
    @State private var showAdd = false
    @State private var newName = ""
    @State private var newBreed = ""

    var body: some View {
        NavigationStack {
            content
                .navigationTitle("Your pets")
                .task { await model.load() }
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Done") { dismiss() }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Add") { showAdd = true }
                    }
                }
                .sheet(isPresented: $showAdd) { addForm }
        }
    }

    @ViewBuilder
    private var content: some View {
        switch model.state {
        case .loading:
            ProgressView("Loading pets…")
        case .failed(let message):
            ContentUnavailableView("Couldn't load pets", systemImage: "exclamationmark.triangle",
                                    description: Text(message))
        case .loaded(let pets) where pets.isEmpty:
            ContentUnavailableView("No pets yet", systemImage: "pawprint",
                                    description: Text("Add your dog to speed up booking."))
        case .loaded(let pets):
            List {
                ForEach(pets) { pet in
                    VStack(alignment: .leading) {
                        Text(pet.name).font(.dm(15, .semibold))
                        Text(pet.subtitle).font(.dm(12)).foregroundStyle(Brand.subtleInk)
                    }
                }
                .onDelete { offsets in Task { await model.delete(at: offsets) } }
            }
            .listStyle(.plain)
        }
    }

    private var addForm: some View {
        NavigationStack {
            Form {
                TextField("Name", text: $newName)
                TextField("Breed", text: $newBreed)
            }
            .navigationTitle("Add a pet")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        Task {
                            await model.add(name: newName, breed: newBreed)
                            newName = ""; newBreed = ""
                            showAdd = false
                        }
                    }
                    .disabled(newName.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }
}
