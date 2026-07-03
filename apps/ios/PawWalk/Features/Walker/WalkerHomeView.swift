import SwiftUI
import Observation

@MainActor
@Observable
final class WalkerViewModel {
    enum ViewState { case loading, loaded([Booking]), failed(String) }
    private(set) var state: ViewState = .loading
    private(set) var profile: Walker?

    func load() async {
        state = .loading
        async let bookingsCall = APIClient.shared.assignedBookings()
        async let profileCall = APIClient.shared.walkerProfile()
        profile = try? await profileCall
        if let bookings = try? await bookingsCall {
            state = .loaded(bookings.sorted { $0.startTime < $1.startTime })
        } else {
            state = .failed("Couldn't load your walks. Pull to refresh.")
        }
    }

    func act(_ booking: Booking, _ action: String) async {
        _ = try? await APIClient.shared.transitionBooking(id: booking.id, action: action)
        await load()
    }
}

struct WalkerHomeView: View {
    @Environment(AuthSession.self) private var auth
    @State private var model = WalkerViewModel()
    @State private var showLive = false
    @State private var showProfile = false
    @State private var trackingBookingID: String?

    var body: some View {
        NavigationStack {
            content
                .navigationTitle("Your walks")
                .task { await model.load() }
                .toolbar {
                    ToolbarItem(placement: .topBarTrailing) {
                        Button("Profile") { showProfile = true }
                    }
                }
        }
        .sheet(isPresented: $showProfile) { ProfileView() }
        .fullScreenCover(isPresented: $showLive) {
            LiveTrackingView(bookingID: trackingBookingID, dogName: nil)
        }
    }

    @ViewBuilder
    private var content: some View {
        switch model.state {
        case .loading:
            ProgressView("Loading your walks…")
        case .failed(let message):
            ContentUnavailableView {
                Label("Couldn't load walks", systemImage: "exclamationmark.triangle")
            } description: {
                Text(message)
            }
        case .loaded(let bookings) where bookings.isEmpty:
            ContentUnavailableView {
                Label("No walks yet", systemImage: "pawprint")
            } description: {
                Text("Accepted walks show up here.")
            }
        case .loaded(let bookings):
            List(bookings) { booking in
                WalkRow(booking: booking,
                        onTrack: { trackingBookingID = booking.id; showLive = true },
                        onAction: { action in Task { await model.act(booking, action) } })
            }
            .listStyle(.plain)
            .refreshable { await model.load() }
        }
    }
}

private struct WalkRow: View {
    let booking: Booking
    var onTrack: () -> Void
    var onAction: (String) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(booking.dogName).font(.dm(15, .semibold))
                Spacer()
                MonoCaption(booking.status.rawValue, size: 9, tracking: 0.1)
            }
            Text(booking.startTime.formatted(date: .abbreviated, time: .shortened))
                .font(.dm(13)).foregroundStyle(Brand.subtleInk)
            actions
        }
        .padding(.vertical, 4)
    }

    @ViewBuilder
    private var actions: some View {
        HStack(spacing: 8) {
            switch booking.status {
            case .pending:
                actionButton("Accept", "accept", filled: true)
                actionButton("Decline", "decline", filled: false)
            case .confirmed:
                actionButton("Start walk", "start", filled: true)
            case .inProgress:
                Button(action: onTrack) {
                    HStack(spacing: 5) {
                        Image(systemName: "location.fill").font(.system(size: 10))
                        Text("Stream GPS").font(.dm(12, .semibold))
                    }
                    .foregroundStyle(Brand.onInverse)
                    .padding(.horizontal, 14).frame(height: 34)
                    .background(Brand.signalGreen)
                    .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
                }
                actionButton("Complete", "complete", filled: true)
            case .completed, .cancelled:
                EmptyView()
            }
        }
        .padding(.top, 2)
    }

    private func actionButton(_ label: String, _ action: String, filled: Bool) -> some View {
        Button {
            onAction(action)
        } label: {
            Text(label).font(.dm(12, .semibold))
                .foregroundStyle(filled ? Brand.onInverse : Brand.ink)
                .padding(.horizontal, 14).frame(height: 34)
                .background(filled ? Brand.accent : Brand.surfaceDeep)
                .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))
        }
    }
}
