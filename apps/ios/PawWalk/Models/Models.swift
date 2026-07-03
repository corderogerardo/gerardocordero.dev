import Foundation

// MARK: - Users & auth

enum UserRole: String, Codable {
    case owner, walker
}

struct User: Codable, Identifiable, Hashable {
    let id: String
    let email: String
    let name: String
    let role: UserRole
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id, email, name, role
        case createdAt = "created_at"
    }
}

struct AuthResponse: Codable {
    let accessToken: String
    let tokenType: String
    let user: User

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case tokenType = "token_type"
        case user
    }
}

// MARK: - Walkers

struct Walker: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let photoURL: String?
    let rating: Double
    let pricePer30MinCents: Int
    let bio: String
    let neighborhoods: [String]

    enum CodingKeys: String, CodingKey {
        case id, name, rating, bio, neighborhoods
        case photoURL = "photo_url"
        case pricePer30MinCents = "price_per_30min_cents"
    }

    var priceLabel: String { "$\(pricePer30MinCents / 100) / 30 min" }
}

// MARK: - Bookings

enum BookingStatus: String, Codable {
    case pending, confirmed, inProgress = "in_progress", completed, cancelled
}

struct Booking: Codable, Identifiable, Hashable {
    let id: String
    let walkerID: String
    let dogName: String
    let startTime: Date
    let durationMinutes: Int
    let status: BookingStatus
    let priceCents: Int
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id, status
        case walkerID = "walker_id"
        case dogName = "dog_name"
        case startTime = "start_time"
        case durationMinutes = "duration_minutes"
        case priceCents = "price_cents"
        case createdAt = "created_at"
    }

    var priceLabel: String { "$\(priceCents / 100)" }
}

/// Body of `POST /bookings`. The server — never the client — computes `priceCents`.
struct CreateBookingRequest: Codable {
    let walkerID: String
    let dogName: String
    let startTime: Date
    let durationMinutes: Int
    let notes: String?

    enum CodingKeys: String, CodingKey {
        case walkerID = "walker_id"
        case dogName = "dog_name"
        case startTime = "start_time"
        case durationMinutes = "duration_minutes"
        case notes
    }
}

// MARK: - Pets

struct Pet: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let breed: String
    let ageYears: Double?
    let weightKg: Double?
    let notes: String
    let createdAt: Date

    enum CodingKeys: String, CodingKey {
        case id, name, breed, notes
        case ageYears = "age_years"
        case weightKg = "weight_kg"
        case createdAt = "created_at"
    }

    var subtitle: String {
        [breed.isEmpty ? nil : breed,
         ageYears.map { "\(Int($0)) yrs" },
         weightKg.map { String(format: "%.1f kg", $0) }]
            .compactMap { $0 }.joined(separator: " · ")
    }
}

// MARK: - Home / owner stats
//
// ponytail: the course never dumps OwnerStats or RecentWalk's full field list —
// only a two-field decoding excerpt of RecentWalk (07-networking.js) and usage
// sites (`stats.recentWalks`, `walk.dogName`, `walk.walkerName`, `walk.sparkline`).
// This is the smallest shape that satisfies every call site seen in the lessons.
// See apps/ios/README.md "Deviations from the course".

struct RecentWalk: Codable, Identifiable, Hashable {
    var id: String { bookingID }
    let bookingID: String
    let dogName: String
    let walkerName: String
    let startTime: Date
    let durationMinutes: Int
    let distanceMeters: Double
    /// Normalized (0...1) points for the little distance sparkline graph.
    let sparkline: [Double]

    enum CodingKeys: String, CodingKey {
        case bookingID = "booking_id"
        case dogName = "dog_name"
        case walkerName = "walker_name"
        case startTime = "start_time"
        case durationMinutes = "duration_minutes"
        case distanceMeters = "distance_meters"
        case sparkline
    }
}

struct OwnerStats: Codable {
    let totalWalks: Int
    let totalMinutes: Int
    let recentWalks: [RecentWalk]

    enum CodingKeys: String, CodingKey {
        case totalWalks = "total_walks"
        case totalMinutes = "total_minutes"
        case recentWalks = "recent_walks"
    }
}

// MARK: - Assistant

struct AssistantChatRequest: Codable {
    let message: String
}

/// A booking the assistant is proposing but hasn't created yet.
/// ponytail: fields inferred from "walker, time, duration" (12-assistant-graduation.js);
/// never shown as shipping Swift. See README deviations.
struct DraftBooking: Codable, Hashable {
    let walkerID: String
    let startTime: Date
    let durationMinutes: Int

    enum CodingKeys: String, CodingKey {
        case walkerID = "walker_id"
        case startTime = "start_time"
        case durationMinutes = "duration_minutes"
    }
}

struct AssistantReply: Codable {
    let reply: String
    let suggestedWalkers: [String]
    let draftBooking: DraftBooking?

    enum CodingKeys: String, CodingKey {
        case reply
        case suggestedWalkers = "suggested_walkers"
        case draftBooking = "draft_booking"
    }
}
