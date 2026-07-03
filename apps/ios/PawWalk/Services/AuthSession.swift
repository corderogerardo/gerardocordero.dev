import Foundation
import Observation

@MainActor
@Observable
final class AuthSession {
    private(set) var currentUser: User?
    private(set) var isRestoring = true
    var errorMessage: String?

    var signedIn: Bool { currentUser != nil }

    init() {
        // A 401 on any authorized request (e.g. an expired token on a
        // booking call) means the session is no longer valid — log out.
        NotificationCenter.default.addObserver(
            forName: APIClient.unauthorizedNotification, object: nil, queue: .main
        ) { [weak self] _ in
            // ponytail: Swift 6 strict concurrency can't statically prove this
            // NotificationCenter closure runs on the main actor even with
            // queue: .main — hop explicitly, same pattern LiveTracker uses.
            Task { @MainActor in self?.logOut() }
        }
    }

    func restore() async {
        defer { isRestoring = false }
        guard let token = TokenStore.read() else { return }
        APIClient.shared.bearerToken = token
        do {
            currentUser = try await APIClient.shared.me()
        } catch {
            TokenStore.clear()
            APIClient.shared.bearerToken = nil
        }
    }

    func signUp(email: String, password: String, name: String, role: UserRole) async {
        await authenticate { try await APIClient.shared.signup(email: email, password: password, name: name, role: role) }
    }

    func logIn(email: String, password: String) async {
        await authenticate { try await APIClient.shared.login(email: email, password: password) }
    }

    private func authenticate(_ request: () async throws -> AuthResponse) async {
        errorMessage = nil
        do {
            let auth = try await request()
            TokenStore.save(token: auth.accessToken)
            APIClient.shared.bearerToken = auth.accessToken
            currentUser = auth.user
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func logOut() {
        TokenStore.clear()
        APIClient.shared.bearerToken = nil
        currentUser = nil
    }
}
