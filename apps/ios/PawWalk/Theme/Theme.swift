import SwiftUI

// Legacy alias so older call sites that say `Color.brand` still compile
// (06-design-system.js: "a tiny sidecar file, Theme/Theme.swift").
extension Color {
    static let brand = Brand.accent
}
