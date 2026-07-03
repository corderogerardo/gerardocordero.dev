import SwiftUI

struct LiveTrackingView: View {
    let bookingID: String?
    let dogName: String?

    @Environment(\.dismiss) private var dismiss
    @State private var tracker = LiveTracker()

    private var on: Color { Brand.onInverse }

    var body: some View {
        ZStack {
            Brand.inverse.ignoresSafeArea()

            TimelineView(.animation) { timeline in
                MapCanvas(date: timeline.date, fixes: tracker.fixes, dogName: dogName ?? "Your dog", accent: Brand.accent)
                    .ignoresSafeArea()
            }

            LinearGradient(colors: [Brand.inverse.opacity(0.85), .clear, Brand.inverse.opacity(0.85)],
                            startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            VStack {
                topHUD
                Spacer()
                statusLine
                bottomHUD
            }
            .padding(16)
        }
        .task { await tracker.start(bookingID: bookingID) }
        .onDisappear { tracker.stop() }
    }

    private var topHUD: some View {
        HStack {
            Button(action: { dismiss() }) {
                Image(systemName: "xmark.circle.fill").foregroundStyle(on.opacity(0.8))
            }
            Spacer()
            VStack(spacing: 2) {
                MonoCaption("Elapsed", size: 8, color: on.opacity(0.6))
                Text(elapsedLabel).font(.mono(16, .semibold)).foregroundStyle(on)
            }
            Spacer()
            VStack(spacing: 2) {
                MonoCaption("Distance", size: 8, color: on.opacity(0.6))
                Text(distanceLabel).font(.mono(16, .semibold)).foregroundStyle(on)
            }
            Spacer()
            VStack(spacing: 2) {
                MonoCaption("Pace", size: 8, color: on.opacity(0.6))
                Text(paceLabel).font(.mono(16, .semibold)).foregroundStyle(on)
            }
        }
    }

    @ViewBuilder
    private var statusLine: some View {
        let text: String? = {
            switch tracker.phase {
            case .noBooking: return "No active walk to track — book one first."
            case .denied:    return "Location access is off. Enable it in Settings to track."
            case .failed:    return "Lost connection to the tracker."
            case .connecting: return tracker.fixes.isEmpty ? "Acquiring GPS…" : nil
            case .tracking:  return tracker.fixes.isEmpty ? "Waiting for the first fix…" : nil
            }
        }()
        if let text {
            MonoCaption(text, size: 10, weight: .regular, tracking: 0.05, color: on.opacity(0.85))
                .padding(.horizontal, 12).padding(.vertical, 8)
                .background(Capsule().fill(Brand.inverse2.opacity(0.7)))
                .padding(.bottom, 10)
        }
    }

    private var bottomHUD: some View {
        HStack {
            PulsingDot(color: tracker.phase == .tracking ? Brand.signalGreen : Brand.subtleInk)
            Text(tracker.phase == .tracking ? "Live · Walk in progress" : "Standing by")
                .font(.mono(11)).foregroundStyle(on.opacity(0.85))
            Spacer()
        }
        .padding(.horizontal, 14).padding(.vertical, 10)
        .background(Capsule().fill(Brand.inverse2.opacity(0.7)))
    }

    private var elapsedLabel: String {
        guard let startedAt = tracker.startedAt else { return "00:00" }
        let s = max(0, Int(Date().timeIntervalSince(startedAt)))
        return String(format: "%02d:%02d", s / 60, s % 60)
    }

    private var distanceLabel: String {
        let m = tracker.distanceMeters
        return m < 1000 ? "\(Int(m)) m" : String(format: "%.2f km", m / 1000)
    }

    private var paceLabel: String {
        guard tracker.distanceMeters > 20, let startedAt = tracker.startedAt else { return "—" }
        let minutes = Date().timeIntervalSince(startedAt) / 60
        let km = tracker.distanceMeters / 1000
        return String(format: "%.1f /km", minutes / km)
    }
}

/// Draws the walked route on a blank canvas — no map tiles, no API key.
private struct MapCanvas: View {
    let date: Date
    let fixes: [LiveTracker.Fix]
    let dogName: String
    let accent: Color

    var body: some View {
        Canvas { ctx, size in
            guard !fixes.isEmpty else { return }
            let rect = CGRect(origin: .zero, size: size).insetBy(dx: 40, dy: 120)
            let pts = project(fixes, into: rect)

            var path = Path()
            if let first = pts.first {
                path.move(to: first)
                for p in pts.dropFirst() { path.addLine(to: p) }
            }
            ctx.stroke(path, with: .color(accent), lineWidth: 4)

            guard let cp = pts.last else { return }
            let t = date.timeIntervalSinceReferenceDate.truncatingRemainder(dividingBy: 1.8) / 1.8
            let pingR = 12 + 22 * t
            ctx.fill(Path(ellipseIn: CGRect(x: cp.x - pingR, y: cp.y - pingR, width: 2 * pingR, height: 2 * pingR)),
                     with: .color(accent.opacity(0.45 * (1 - t))))
            ctx.fill(Path(ellipseIn: CGRect(x: cp.x - 8, y: cp.y - 8, width: 16, height: 16)), with: .color(accent))
        }
        .background(Brand.canvasDeep)
    }

    /// Projects lat/lng onto the rect, preserving relative shape (not true scale).
    private func project(_ fixes: [LiveTracker.Fix], into rect: CGRect) -> [CGPoint] {
        guard !fixes.isEmpty else { return [] }
        let lats = fixes.map(\.lat), lngs = fixes.map(\.lng)
        let midLat = (lats.min()! + lats.max()!) / 2 * .pi / 180
        let xs = lngs.map { $0 * cos(midLat) }
        let minX = xs.min()!, maxX = xs.max()!, minY = lats.min()!, maxY = lats.max()!
        let spanX = max(maxX - minX, 0.0001), spanY = max(maxY - minY, 0.0001)
        return zip(xs, lats).map { x, lat in
            CGPoint(
                x: rect.minX + CGFloat((x - minX) / spanX) * rect.width,
                y: rect.minY + CGFloat(1 - (lat - minY) / spanY) * rect.height
            )
        }
    }
}
