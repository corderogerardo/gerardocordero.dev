import SwiftUI
import UIKit

extension UIColor {
    convenience init(hex: UInt) {
        self.init(
            red: CGFloat((hex >> 16) & 0xFF) / 255,
            green: CGFloat((hex >> 8) & 0xFF) / 255,
            blue: CGFloat(hex & 0xFF) / 255,
            alpha: 1
        )
    }
}

extension Color {
    init(hex: UInt) { self.init(UIColor(hex: hex)) }

    /// A color that resolves differently in light vs dark appearance.
    init(light: UInt, dark: UInt) {
        self.init(UIColor { trait in
            UIColor(hex: trait.userInterfaceStyle == .dark ? dark : light)
        })
    }
}

/// Semantic design tokens. Names mirror the CSS custom properties in the handoff.
///
/// ponytail: the lessons show `canvas`, `canvasDeep`, `ink`, `accent` verbatim and
/// name four more theme-aware tokens plus four fixed signal colors without giving
/// every hex value (06-design-system.js: "four more theme-aware tokens plus four
/// fixed 'signal' colors"). `onInverse`, `inverse`, `inverse2` are referenced by
/// call sites (auth submit button, live-tracking HUD, assistant bubbles) but never
/// defined on-screen either. Values below are the smallest reconciling set that
/// satisfies every token name used across the course. See README deviations.
enum Brand {
    // Theme-aware tokens (light → dark)
    static let canvas      = Color(light: 0xF5F3FA, dark: 0x0E0A1C)
    static let canvasDeep  = Color(light: 0xE7E4F2, dark: 0x1C1636)
    static let ink         = Color(light: 0x171327, dark: 0xECEAF7)
    static let accent      = Color(light: 0x5B4BE0, dark: 0x8E7DFF)
    static let surface     = Color(light: 0xFFFFFF, dark: 0x171130)
    static let surfaceDeep = Color(light: 0xEDEAF6, dark: 0x241C42)
    static let border      = Color(light: 0xDAD5EC, dark: 0x322A54)
    static let subtleInk   = Color(light: 0x6B6580, dark: 0x9C96B4)

    // Fixed "signal" colors — identical in both themes, because they carry meaning.
    static let signalGreen     = Color(hex: 0x1FA97A)
    static let signalGreenSoft = Color(hex: 0xBFEBDA)
    static let pinAmber        = Color(hex: 0xC68A1E)
    static let pinBlue         = Color(hex: 0x2E7BE0)

    // Content drawn on top of a filled accent/signal color (e.g. button labels).
    static let onInverse = Color(hex: 0xFFFFFF)
    // Backgrounds for content that sits over the map/photo layers (HUD chrome).
    static let inverse  = Color(light: 0x171327, dark: 0x0E0A1C)
    static let inverse2 = Color(light: 0x2A2440, dark: 0x241C42)
}

extension Font {
    /// DM Sans — display / UI sans.
    static func dm(_ size: CGFloat, _ weight: Font.Weight = .regular) -> Font {
        let name: String
        switch weight {
        case .bold:               name = "DMSans-Bold"
        case .semibold:           name = "DMSans-SemiBold"
        case .medium:             name = "DMSans-Medium"
        default:                  name = "DMSans-Regular"
        }
        return .custom(name, size: size)
    }

    /// JetBrains Mono — readouts, coordinates, labels.
    static func mono(_ size: CGFloat, _ weight: Font.Weight = .regular) -> Font {
        let name: String
        switch weight {
        case .semibold, .bold:    name = "JetBrainsMono-SemiBold"
        case .medium:             name = "JetBrainsMono-Medium"
        default:                  name = "JetBrainsMono-Regular"
        }
        return .custom(name, size: size)
    }
}
