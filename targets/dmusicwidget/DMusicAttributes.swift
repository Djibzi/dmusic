import ActivityKit
import Foundation
import SwiftUI

public struct DMusicAttributes: ActivityAttributes {
    public typealias ContentState = State

    public struct State: Codable, Hashable {
        public var title: String
        public var artist: String
        public var artworkURL: String?
        public var positionMs: Double
        public var durationMs: Double
        public var isPlaying: Bool
        public var accentHex: String
        public var accentSecondaryHex: String
        public var bgGlowHex: String
        public var artHue: Double
        public var sourceIsLink: Bool

        public init(
            title: String,
            artist: String,
            artworkURL: String?,
            positionMs: Double,
            durationMs: Double,
            isPlaying: Bool,
            accentHex: String,
            accentSecondaryHex: String,
            bgGlowHex: String,
            artHue: Double,
            sourceIsLink: Bool
        ) {
            self.title = title
            self.artist = artist
            self.artworkURL = artworkURL
            self.positionMs = positionMs
            self.durationMs = durationMs
            self.isPlaying = isPlaying
            self.accentHex = accentHex
            self.accentSecondaryHex = accentSecondaryHex
            self.bgGlowHex = bgGlowHex
            self.artHue = artHue
            self.sourceIsLink = sourceIsLink
        }
    }

    public var trackId: String

    public init(trackId: String) {
        self.trackId = trackId
    }
}

extension Color {
    init(hexString: String) {
        let s = hexString.trimmingCharacters(in: .whitespacesAndNewlines).replacingOccurrences(of: "#", with: "")
        var rgb: UInt64 = 0
        Scanner(string: s).scanHexInt64(&rgb)
        let r = Double((rgb & 0xFF0000) >> 16) / 255.0
        let g = Double((rgb & 0x00FF00) >> 8) / 255.0
        let b = Double(rgb & 0x0000FF) / 255.0
        self.init(red: r, green: g, blue: b)
    }
}
