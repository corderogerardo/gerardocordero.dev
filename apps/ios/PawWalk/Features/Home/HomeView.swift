import SwiftUI

struct HomeView: View {
    @Environment(AuthSession.self) private var auth
    @State private var model = HomeViewModel()
    @State private var showLive = false
    @State private var showBookings = false
    @State private var showBooking = false
    @State private var showProfile = false
    @State private var showAssistant = false

    var body: some View {
        ZStack(alignment: .bottom) {
            Brand.canvas.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    header

                    if let up = model.upcoming {
                        NextWalkCard(booking: up.booking, walker: up.walker,
                                     onTrack: { showLive = true },
                                     onChat: { showAssistant = true })
                    } else {
                        EmptyWalkCard(onBook: { showBooking = true },
                                      onChat: { showAssistant = true })
                    }

                    recentWalks
                }
                .padding(16)
                .padding(.bottom, 70)
            }

            tabBar
        }
        .task { await model.load() }
        .fullScreenCover(isPresented: $showLive) {
            LiveTrackingView(bookingID: model.upcoming?.booking.id,
                             dogName: model.upcoming?.booking.dogName ?? model.pets.first?.name)
        }
        .sheet(isPresented: $showBookings) { BookingsView() }
        .sheet(isPresented: $showProfile) { ProfileView() }
        .sheet(isPresented: $showAssistant) { AssistantView() }
        .sheet(isPresented: $showBooking) {
            WalkersView(onBooked: { _ in
                showBooking = false
                showBookings = true
                Task { await model.load() }
            })
        }
    }

    private var header: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                MonoCaption("PawWalk", size: 9, tracking: 0.14)
                Text("Hi, \(auth.currentUser?.name.split(separator: " ").first.map(String.init) ?? "there")")
                    .font(.dm(22, .semibold)).foregroundStyle(Brand.ink)
            }
            Spacer()
        }
    }

    private var recentWalks: some View {
        VStack(alignment: .leading, spacing: 8) {
            MonoCaption("Recent walks", size: 9, tracking: 0.12)
            let walks = model.stats?.recentWalks ?? []
            if walks.isEmpty {
                MonoCaption("Completed walks show up here.")
            } else {
                ForEach(walks) { walk in
                    RecentWalkRow(title: "\(walk.dogName) with \(walk.walkerName)",
                                  meta: walkMeta(walk))
                }
            }
        }
    }

    private func walkMeta(_ walk: RecentWalk) -> String {
        let km = walk.distanceMeters / 1000
        return "\(walk.durationMinutes) min · \(String(format: "%.1f km", km))"
    }

    private var tabBar: some View {
        HStack(spacing: 0) {
            tabButton("house.fill", "Home") { }
            tabButton("pawprint.fill", "Book") { showBooking = true }
            tabButton("calendar", "Bookings") { showBookings = true }
            tabButton("location.fill", "Track") { showLive = true }
            tabButton("person.fill", "Profile") { showProfile = true }
        }
        .padding(.vertical, 10)
        .background(Brand.surface.opacity(0.95).ignoresSafeArea())
    }

    private func tabButton(_ icon: String, _ label: String, _ action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                Text(label).font(.mono(9))
            }
            .foregroundStyle(Brand.ink)
            .frame(maxWidth: .infinity)
        }
    }
}

private struct NextWalkCard: View {
    let booking: Booking
    let walker: Walker?
    var onTrack: () -> Void
    var onChat: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            MonoCaption("Next walk", size: 9, tracking: 0.12, color: Brand.onInverse.opacity(0.7))
            Text("\(booking.dogName) with \(walker?.name ?? "your walker")")
                .font(.dm(17, .semibold)).foregroundStyle(Brand.onInverse)
            Text(booking.startTime.formatted(date: .abbreviated, time: .shortened))
                .font(.dm(13)).foregroundStyle(Brand.onInverse.opacity(0.8))
            HStack {
                if booking.status == .inProgress {
                    Button(action: onTrack) {
                        Label("Track", systemImage: "location.fill")
                    }
                    .buttonStyle(.borderedProminent)
                }
                Button(action: onChat) {
                    Label("Ask PawWalk", systemImage: "bubble.left.fill")
                }
                .buttonStyle(.bordered)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Brand.inverse)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

private struct EmptyWalkCard: View {
    var onBook: () -> Void
    var onChat: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("No walk booked yet").font(.dm(17, .semibold)).foregroundStyle(Brand.ink)
            Text("Find a walker or ask the assistant for a suggestion.")
                .font(.dm(13)).foregroundStyle(Brand.subtleInk)
            HStack {
                Button("Book a walk", action: onBook).buttonStyle(.borderedProminent)
                Button(action: onChat) { Label("Ask PawWalk", systemImage: "bubble.left.fill") }
                    .buttonStyle(.bordered)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Brand.surfaceDeep)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}

private struct RecentWalkRow: View {
    let title: String
    let meta: String

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.dm(14, .medium)).foregroundStyle(Brand.ink)
                Text(meta).font(.mono(10)).foregroundStyle(Brand.subtleInk)
            }
            Spacer()
        }
        .padding(.vertical, 6)
    }
}

#Preview {
    HomeView()
        .environment(AuthSession())
}
