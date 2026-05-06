import AppIntents
import Foundation

private let APP_GROUP = "group.com.dmusic.app"

@available(iOS 17.0, *)
struct PlayPauseIntent: LiveActivityIntent {
    static var title: LocalizedStringResource = "Play/Pause"
    static var description = IntentDescription("Toggle DMusic playback")

    init() {}

    func perform() async throws -> some IntentResult {
        let defaults = UserDefaults(suiteName: APP_GROUP)
        defaults?.set(Date().timeIntervalSince1970, forKey: "dmusic.action.playPause")
        return .result()
    }
}

@available(iOS 17.0, *)
struct ReplayIntent: LiveActivityIntent {
    static var title: LocalizedStringResource = "Replay"
    static var description = IntentDescription("Restart current track from 0:00")

    init() {}

    func perform() async throws -> some IntentResult {
        let defaults = UserDefaults(suiteName: APP_GROUP)
        defaults?.set(Date().timeIntervalSince1970, forKey: "dmusic.action.replay")
        return .result()
    }
}

@available(iOS 17.0, *)
struct SeekIntent: LiveActivityIntent {
    static var title: LocalizedStringResource = "Seek"
    static var description = IntentDescription("Jump to a position in the track")

    @Parameter(title: "Position")
    var position: Double

    init() { self.position = 0 }

    init(position: Double) {
        self.position = position
    }

    func perform() async throws -> some IntentResult {
        let defaults = UserDefaults(suiteName: APP_GROUP)
        defaults?.set(position, forKey: "dmusic.action.seekValue")
        defaults?.set(Date().timeIntervalSince1970, forKey: "dmusic.action.seek")
        return .result()
    }
}
