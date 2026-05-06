import ActivityKit
import ExpoModulesCore
import Foundation
import MediaPlayer
import UIKit

// Mirror of the widget-side DMusicAttributes — must stay byte-identical with
// targets/dmusicwidget/DMusicAttributes.swift for ActivityKit to recognize the type.
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
    }

    public var trackId: String
}

private let APP_GROUP = "group.com.dmusic.app"

@available(iOS 16.2, *)
private func parseState(_ dict: [String: Any]) -> DMusicAttributes.State {
    return DMusicAttributes.State(
        title: dict["title"] as? String ?? "",
        artist: dict["artist"] as? String ?? "",
        artworkURL: dict["artworkURL"] as? String,
        positionMs: (dict["positionMs"] as? NSNumber)?.doubleValue ?? 0,
        durationMs: (dict["durationMs"] as? NSNumber)?.doubleValue ?? 0,
        isPlaying: dict["isPlaying"] as? Bool ?? false,
        accentHex: dict["accentHex"] as? String ?? "#ad2831",
        accentSecondaryHex: dict["accentSecondaryHex"] as? String ?? "#800e13",
        bgGlowHex: dict["bgGlowHex"] as? String ?? "#640d14",
        artHue: (dict["artHue"] as? NSNumber)?.doubleValue ?? 12,
        sourceIsLink: dict["sourceIsLink"] as? Bool ?? false
    )
}

/// Download `url` to the App Group shared container and return its file:// URL string.
/// Widget extensions can read App Group files but can't download arbitrary URLs reliably,
/// so we download from the main app and pass a local file path.
private func downloadArtworkToAppGroup(remoteURL: URL, trackId: String) async -> String? {
    guard let container = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: APP_GROUP) else {
        return nil
    }
    do {
        let (data, _) = try await URLSession.shared.data(from: remoteURL)
        // Sanitize trackId for use in filename
        let safeId = trackId.replacingOccurrences(of: "/", with: "_").replacingOccurrences(of: ":", with: "_")
        let fileURL = container.appendingPathComponent("artwork-\(safeId).jpg")
        try data.write(to: fileURL, options: .atomic)
        return fileURL.absoluteString
    } catch {
        return nil
    }
}

public class DmusicActivityModule: Module {
    private var nowPlayingKiller: Timer?
    private var terminationObserver: NSObjectProtocol?
    // Last-seen timestamps of action requests written by Live Activity intents.
    // We use timestamps so we can detect new requests (different from previous).
    private var lastPlayPauseTs: Double = 0
    private var lastReplayTs: Double = 0
    private var lastSeekTs: Double = 0

    public func definition() -> ModuleDefinition {
        Name("DmusicActivity")

        Events("onAction")

        OnCreate {
            // Initialize action state from existing UserDefaults so we don't
            // fire spurious events for old requests on app restart.
            if let defaults = UserDefaults(suiteName: APP_GROUP) {
                self.lastPlayPauseTs = defaults.double(forKey: "dmusic.action.playPause")
                self.lastReplayTs = defaults.double(forKey: "dmusic.action.replay")
                self.lastSeekTs = defaults.double(forKey: "dmusic.action.seek")
            }

            // Periodic 250ms tick that does two things:
            //   1. Nuke the iOS standard Now Playing widget (clear MPNowPlayingInfoCenter
            //      + strip MPRemoteCommandCenter handlers that RNTP/SwiftAudioEx registers).
            //   2. Poll the App Group UserDefaults for pending Live Activity intent
            //      actions (play/pause, replay) and forward them to JS.
            DispatchQueue.main.async {
                self.nowPlayingKiller?.invalidate()
                self.nowPlayingKiller = Timer.scheduledTimer(withTimeInterval: 0.25, repeats: true) { [weak self] _ in
                    guard let self = self else { return }

                    // (1) Apple Now Playing widget killer
                    MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
                    let center = MPRemoteCommandCenter.shared()
                    let commands: [MPRemoteCommand] = [
                        center.playCommand,
                        center.pauseCommand,
                        center.togglePlayPauseCommand,
                        center.nextTrackCommand,
                        center.previousTrackCommand,
                        center.stopCommand,
                        center.changePlaybackPositionCommand,
                        center.skipBackwardCommand,
                        center.skipForwardCommand,
                        center.likeCommand,
                        center.dislikeCommand,
                        center.bookmarkCommand,
                        center.seekBackwardCommand,
                        center.seekForwardCommand,
                    ]
                    for cmd in commands {
                        cmd.removeTarget(nil)
                        cmd.isEnabled = false
                    }

                    // (2) Poll Live Activity action requests
                    if let defaults = UserDefaults(suiteName: APP_GROUP) {
                        let pp = defaults.double(forKey: "dmusic.action.playPause")
                        if pp > self.lastPlayPauseTs {
                            self.lastPlayPauseTs = pp
                            self.sendEvent("onAction", ["action": "playPause"])
                        }
                        let rp = defaults.double(forKey: "dmusic.action.replay")
                        if rp > self.lastReplayTs {
                            self.lastReplayTs = rp
                            self.sendEvent("onAction", ["action": "replay"])
                        }
                        let sk = defaults.double(forKey: "dmusic.action.seek")
                        if sk > self.lastSeekTs {
                            self.lastSeekTs = sk
                            let pos = defaults.double(forKey: "dmusic.action.seekValue")
                            self.sendEvent("onAction", ["action": "seek", "position": pos])
                        }
                    }
                }
            }
        }

        OnDestroy {
            self.nowPlayingKiller?.invalidate()
            self.nowPlayingKiller = nil
            if let obs = self.terminationObserver {
                NotificationCenter.default.removeObserver(obs)
                self.terminationObserver = nil
            }
        }

        OnAppEntersForeground {
            // Set up the termination observer here (UIApplication is fully ready
            // when the app is foregrounded). On app termination, end any running
            // Live Activities so they don't linger after the user force-quits.
            DispatchQueue.main.async {
                if self.terminationObserver != nil { return }
                self.terminationObserver = NotificationCenter.default.addObserver(
                    forName: UIApplication.willTerminateNotification,
                    object: nil,
                    queue: .main
                ) { _ in
                    if #available(iOS 16.2, *) {
                        // We're about to die; do this synchronously via semaphore.
                        let sem = DispatchSemaphore(value: 0)
                        Task {
                            for activity in Activity<DMusicAttributes>.activities {
                                await activity.end(nil, dismissalPolicy: .immediate)
                            }
                            sem.signal()
                        }
                        _ = sem.wait(timeout: .now() + 0.5)
                    }
                }
            }
        }

        AsyncFunction("isSupported") { () -> Bool in
            if #available(iOS 16.2, *) {
                return ActivityAuthorizationInfo().areActivitiesEnabled
            }
            return false
        }

        AsyncFunction("startActivity") { (trackId: String, state: [String: Any], promise: Promise) in
            guard #available(iOS 16.2, *) else {
                promise.reject("UNSUPPORTED", "iOS 16.2+ required")
                return
            }
            let info = ActivityAuthorizationInfo()
            guard info.areActivitiesEnabled else {
                promise.reject("DISABLED", "Live Activities not enabled")
                return
            }
            Task {
                for activity in Activity<DMusicAttributes>.activities {
                    await activity.end(nil, dismissalPolicy: .immediate)
                }
                // Download artwork to shared App Group container so the widget
                // can render it via a local file:// URL (AsyncImage in widgets
                // is unreliable with remote URLs).
                var enrichedState = state
                if let urlStr = state["artworkURL"] as? String, let url = URL(string: urlStr), url.scheme?.hasPrefix("http") == true {
                    if let localPath = await downloadArtworkToAppGroup(remoteURL: url, trackId: trackId) {
                        enrichedState["artworkURL"] = localPath
                    }
                }
                do {
                    let attributes = DMusicAttributes(trackId: trackId)
                    let contentState = parseState(enrichedState)
                    // staleDate: if no update within 60s, iOS marks the activity stale and
                    // becomes eligible for auto-dismissal (graceful fallback if app dies).
                    let activity = try Activity.request(
                        attributes: attributes,
                        content: ActivityContent(state: contentState, staleDate: Date().addingTimeInterval(30)),
                        pushType: nil
                    )
                    promise.resolve(activity.id)
                } catch {
                    promise.reject("REQUEST_FAILED", error.localizedDescription)
                }
            }
        }

        AsyncFunction("updateActivity") { (state: [String: Any], promise: Promise) in
            guard #available(iOS 16.2, *) else {
                promise.resolve(nil)
                return
            }
            Task {
                // For updates, keep the existing local file URL — don't re-download.
                // If the URL is still http(s), it means an update came in before
                // download finished; just leave it (cover stays as previous frame).
                var enrichedState = state
                if let urlStr = state["artworkURL"] as? String, let url = URL(string: urlStr), url.scheme?.hasPrefix("http") == true {
                    // If we have an existing local file for this trackId, swap to it
                    // by guessing the filename. Otherwise, leave as-is.
                    if let container = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: APP_GROUP) {
                        let trackIdFromActivity = Activity<DMusicAttributes>.activities.first?.attributes.trackId ?? ""
                        let safeId = trackIdFromActivity.replacingOccurrences(of: "/", with: "_").replacingOccurrences(of: ":", with: "_")
                        let localFile = container.appendingPathComponent("artwork-\(safeId).jpg")
                        if FileManager.default.fileExists(atPath: localFile.path) {
                            enrichedState["artworkURL"] = localFile.absoluteString
                        }
                    }
                }
                let contentState = parseState(enrichedState)
                for activity in Activity<DMusicAttributes>.activities {
                    await activity.update(ActivityContent(state: contentState, staleDate: Date().addingTimeInterval(30)))
                }
                promise.resolve(nil)
            }
        }

        AsyncFunction("endActivity") { (promise: Promise) in
            guard #available(iOS 16.2, *) else {
                promise.resolve(nil)
                return
            }
            Task {
                for activity in Activity<DMusicAttributes>.activities {
                    await activity.end(nil, dismissalPolicy: .immediate)
                }
                promise.resolve(nil)
            }
        }

        // Switch home-screen icon. Pass nil/empty for the primary icon, or one of
        // the names declared in CFBundleAlternateIcons (currently "Crimson",
        // "Violet"). iOS shows a system confirmation alert — unsuppressable in
        // App Store apps. We early-return when already on the requested icon so
        // theme re-applies don't re-trigger the alert.
        AsyncFunction("setAppIcon") { (name: String?, promise: Promise) in
            DispatchQueue.main.async {
                guard UIApplication.shared.supportsAlternateIcons else {
                    promise.reject("UNSUPPORTED", "Alternate icons not supported")
                    return
                }
                let target = (name?.isEmpty ?? true) ? nil : name
                if UIApplication.shared.alternateIconName == target {
                    promise.resolve(nil)
                    return
                }
                UIApplication.shared.setAlternateIconName(target) { error in
                    if let error = error {
                        promise.reject("ICON_FAILED", error.localizedDescription)
                    } else {
                        promise.resolve(nil)
                    }
                }
            }
        }
    }
}
