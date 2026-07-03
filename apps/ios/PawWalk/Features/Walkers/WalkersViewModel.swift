import Foundation
import Observation

@MainActor
@Observable
final class WalkersViewModel {
    enum ViewState {
        case loading
        case loaded([Walker])
        case failed(String)
    }

    private(set) var state: ViewState = .loading

    func load() async {
        state = .loading
        do {
            let walkers = try await APIClient.shared.walkers()
            state = .loaded(walkers)
        } catch {
            state = .failed("Couldn't reach the server. Check your connection and try again.")
        }
    }
}
