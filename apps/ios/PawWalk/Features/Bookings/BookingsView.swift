import SwiftUI

struct BookingsView: View {
    @State private var model = BookingsViewModel()

    var body: some View {
        NavigationStack {
            content
                .navigationTitle("Your bookings")
                .task { await model.load() }
        }
    }

    @ViewBuilder
    private var content: some View {
        switch model.state {
        case .loading:
            ProgressView("Loading bookings…")
        case .failed(let message):
            ContentUnavailableView {
                Label("Couldn't load bookings", systemImage: "exclamationmark.triangle")
            } description: {
                Text(message)
            }
        case .loaded(let bookings) where bookings.isEmpty:
            ContentUnavailableView {
                Label("No bookings yet", systemImage: "calendar.badge.plus")
            } description: {
                Text("Book a walk from the Walkers tab and it'll show up here.")
            }
        case .loaded(let bookings):
            List(bookings) { booking in
                BookingRow(booking: booking) {
                    Task { await model.cancel(booking) }
                }
            }
            .listStyle(.plain)
            .refreshable { await model.load() }
        }
    }
}

private struct BookingRow: View {
    let booking: Booking
    var onCancel: () -> Void

    private var canCancel: Bool {
        booking.status == .pending || booking.status == .confirmed
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(booking.dogName).font(.dm(15, .semibold))
                Spacer()
                MonoCaption(booking.status.rawValue, size: 9, tracking: 0.1, color: statusColor)
            }
            Text(booking.startTime.formatted(date: .abbreviated, time: .shortened))
                .font(.dm(13)).foregroundStyle(Brand.subtleInk)
            HStack {
                Text(booking.priceLabel).font(.dm(13, .medium))
                Spacer()
                if canCancel {
                    Button("Cancel", role: .destructive, action: onCancel)
                        .font(.dm(13))
                }
            }
        }
        .padding(.vertical, 4)
    }

    private var statusColor: Color {
        switch booking.status {
        case .pending: return Brand.pinAmber
        case .confirmed, .inProgress: return Brand.signalGreen
        case .completed: return Brand.subtleInk
        case .cancelled: return .red
        }
    }
}
