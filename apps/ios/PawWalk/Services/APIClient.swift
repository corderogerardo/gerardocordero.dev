import Foundation

enum APIError: Error, LocalizedError {
    /// Signup with an email that's already registered (backend returns 409).
    case emailTaken
    /// Backend returned an error with a server-provided message.
    case serverError(String)

    var errorDescription: String? {
        switch self {
        case .emailTaken: return "That email is already registered. Try logging in instead."
        case .serverError(let detail): return detail
        }
    }
}

@MainActor
final class APIClient {
    static let shared = APIClient()

    // ponytail: the lessons hardcode "http://localhost:8000" in every exercise
    // starter/solution. The task asks for a build-setting/Info.plist override
    // with that same localhost default — see PAWWALK_API_BASE_URL in Info.plist
    // and the README "Deviations from the course".
    let baseURL: URL
    var bearerToken: String?

    static let unauthorizedNotification = Notification.Name("APIClient.unauthorized")

    private init() {
        if let override = Bundle.main.object(forInfoDictionaryKey: "PawWalkAPIBaseURL") as? String,
           !override.isEmpty, let url = URL(string: override) {
            baseURL = url
        } else {
            baseURL = URL(string: "http://localhost:8000")!
        }
    }

    private var decoder: JSONDecoder {
        let d = JSONDecoder()
        d.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let string = try container.decode(String.self)
            // Try ISO8601 with timezone + fractional seconds, then without fractional
            let iso = ISO8601DateFormatter()
            iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = iso.date(from: string) { return date }
            iso.formatOptions = .withInternetDateTime
            if let date = iso.date(from: string) { return date }
            // Backend's SQLite loses timezone — try appending Z
            let withZ = string + "Z"
            iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = iso.date(from: withZ) { return date }
            iso.formatOptions = .withInternetDateTime
            if let date = iso.date(from: withZ) { return date }
            // Last resort: DateFormatter handles any fractional digit count
            let df = DateFormatter()
            df.locale = Locale(identifier: "en_US_POSIX")
            df.timeZone = TimeZone(secondsFromGMT: 0)
            for fmt in ["yyyy-MM-dd'T'HH:mm:ss.SSSSSS", "yyyy-MM-dd'T'HH:mm:ss.SSS", "yyyy-MM-dd'T'HH:mm:ss"] {
                df.dateFormat = fmt
                if let date = df.date(from: string) { return date }
                if let date = df.date(from: string + "Z") { return date }
            }
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Invalid date: \(string)")
        }
        return d
    }

    private var encoder: JSONEncoder {
        let e = JSONEncoder()
        e.dateEncodingStrategy = .iso8601
        return e
    }

    private func attachAuthorization(to request: inout URLRequest) {
        guard let bearerToken else { return }
        request.setValue("Bearer \(bearerToken)", forHTTPHeaderField: "Authorization")
    }

    private struct ServerError: Decodable {
        let detail: String
    }

    private func checkStatus(_ response: URLResponse, data: Data) throws {
        guard let http = response as? HTTPURLResponse else { throw URLError(.badServerResponse) }
        if http.statusCode == 401 {
            NotificationCenter.default.post(name: Self.unauthorizedNotification, object: nil)
        }
        switch http.statusCode {
        case 200..<300: return
        case 409: throw APIError.emailTaken
        default:
            if let serverError = try? decoder.decode(ServerError.self, from: data) {
                throw APIError.serverError(serverError.detail)
            }
            throw URLError(.badServerResponse)
        }
    }

    private func get<Response: Decodable>(
        _ type: Response.Type, path: String, authorized: Bool = false
    ) async throws -> Response {
        var request = URLRequest(url: baseURL.appendingPathComponent(path))
        if authorized { attachAuthorization(to: &request) }
        let (data, response) = try await URLSession.shared.data(for: request)
        try checkStatus(response, data: data)
        return try decoder.decode(Response.self, from: data)
    }

    private func post<Body: Encodable, Response: Decodable>(
        path: String, body: Body, authorized: Bool = false
    ) async throws -> Response {
        var request = URLRequest(url: baseURL.appendingPathComponent(path))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try encoder.encode(body)
        if authorized { attachAuthorization(to: &request) }
        let (data, response) = try await URLSession.shared.data(for: request)
        try checkStatus(response, data: data)
        return try decoder.decode(Response.self, from: data)
    }

    /// A POST with no request body — booking transitions (`/bookings/{id}/{action}`).
    private func post<Response: Decodable>(
        path: String, authorized: Bool = false
    ) async throws -> Response {
        var request = URLRequest(url: baseURL.appendingPathComponent(path))
        request.httpMethod = "POST"
        if authorized { attachAuthorization(to: &request) }
        let (data, response) = try await URLSession.shared.data(for: request)
        try checkStatus(response, data: data)
        return try decoder.decode(Response.self, from: data)
    }

    // MARK: - Auth

    func login(email: String, password: String) async throws -> AuthResponse {
        try await post(path: "auth/login", body: ["email": email, "password": password])
    }

    func signup(email: String, password: String, name: String, role: UserRole) async throws -> AuthResponse {
        try await post(path: "auth/signup", body: [
            "email": email, "password": password, "name": name, "role": role.rawValue,
        ])
    }

    func me() async throws -> User {
        try await get(User.self, path: "auth/me", authorized: true)
    }

    // MARK: - Walkers

    func walkers() async throws -> [Walker] {
        try await get([Walker].self, path: "walkers")
    }

    // MARK: - Bookings

    func bookings() async throws -> [Booking] {
        try await get([Booking].self, path: "bookings", authorized: true)
    }

    func createBooking(_ request: CreateBookingRequest) async throws -> Booking {
        try await post(path: "bookings", body: request, authorized: true)
    }

    func cancelBooking(id: String) async throws -> Booking {
        try await post(path: "bookings/\(id)/cancel", authorized: true)
    }

    /// Owner/walker transitions: action is one of "accept", "decline", "start", "complete".
    func transitionBooking(id: String, action: String) async throws -> Booking {
        try await post(path: "bookings/\(id)/\(action)", authorized: true)
    }

    /// Bookings assigned TO the signed-in walker (`/bookings/assigned`).
    func assignedBookings() async throws -> [Booking] {
        try await get([Booking].self, path: "bookings/assigned", authorized: true)
    }

    // MARK: - Pets

    func pets() async throws -> [Pet] {
        try await get([Pet].self, path: "pets", authorized: true)
    }

    func addPet(name: String, breed: String) async throws -> Pet {
        try await post(path: "pets", body: ["name": name, "breed": breed], authorized: true)
    }

    func deletePet(id: String) async throws -> Pet {
        try await post(path: "pets/\(id)/delete", authorized: true)
    }

    // MARK: - Stats / profile

    func ownerStats() async throws -> OwnerStats {
        try await get(OwnerStats.self, path: "stats/owner", authorized: true)
    }

    func walkerProfile() async throws -> Walker {
        try await get(Walker.self, path: "walkers/me", authorized: true)
    }

    // MARK: - Assistant

    func assistantChat(message: String) async throws -> AssistantReply {
        try await post(path: "assistant/chat", body: AssistantChatRequest(message: message), authorized: true)
    }
}
