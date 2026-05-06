import ActivityKit
import SwiftUI
import WidgetKit

@available(iOS 16.2, *)
struct DMusicLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: DMusicAttributes.self) { context in
            // Lock screen / banner UI — kill all implicit SwiftUI animations.
            // ActivityKit triggers tween animations on every update (~0.3s);
            // with 250ms updates they overlap and feel laggy.
            GlassBanner(state: context.state)
                .activityBackgroundTint(Color.clear)
                .activitySystemActionForegroundColor(Color.white)
                .animation(nil, value: context.state)
                .transaction { $0.animation = nil; $0.disablesAnimations = true }
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Cover(state: context.state, size: 50)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Image(systemName: context.state.isPlaying ? "waveform" : "pause.fill")
                        .foregroundColor(Color(hexString: context.state.accentHex))
                        .font(.system(size: 22, weight: .semibold))
                        .symbolEffect(.variableColor.iterative, isActive: context.state.isPlaying)
                }
                DynamicIslandExpandedRegion(.center) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(context.state.title)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                            .lineLimit(1)
                        Text(context.state.artist)
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.white.opacity(0.6))
                            .lineLimit(1)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    WaveBars(
                        progress: progressFraction(state: context.state),
                        accentHex: context.state.accentHex,
                        count: 40,
                        height: 18
                    )
                }
            } compactLeading: {
                Cover(state: context.state, size: 22)
                    .clipShape(RoundedRectangle(cornerRadius: 5))
            } compactTrailing: {
                Image(systemName: context.state.isPlaying ? "waveform" : "pause.fill")
                    .foregroundColor(Color(hexString: context.state.accentHex))
                    .font(.system(size: 14, weight: .semibold))
                    .symbolEffect(.variableColor.iterative, isActive: context.state.isPlaying)
            } minimal: {
                Image(systemName: "music.note")
                    .foregroundColor(Color(hexString: context.state.accentHex))
                    .font(.system(size: 14, weight: .bold))
            }
            .keylineTint(Color(hexString: context.state.accentHex))
        }
    }
}

@available(iOS 16.2, *)
private func progressFraction(state: DMusicAttributes.State) -> Double {
    guard state.durationMs > 0 else { return 0 }
    return min(1.0, max(0.0, state.positionMs / state.durationMs))
}

// MARK: - Glass Banner (Lock Screen)

@available(iOS 16.2, *)
struct GlassBanner: View {
    let state: DMusicAttributes.State

    var body: some View {
        ZStack {
            // Base accent wash — gives the banner a clear palette identity
            Color(hexString: state.accentHex).opacity(0.18)

            // Translucent glass tint — wallpaper bleeds through
            LinearGradient(
                colors: [
                    Color.white.opacity(0.16),
                    Color.white.opacity(0.04),
                    Color.white.opacity(0.12),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            // Stronger color tint from palette (radial corners, screen blend)
            ZStack {
                RadialGradient(
                    colors: [Color(hexString: state.bgGlowHex).opacity(0.45), .clear],
                    center: .topLeading,
                    startRadius: 0,
                    endRadius: 300
                )
                RadialGradient(
                    colors: [Color(hexString: state.accentHex).opacity(0.38), .clear],
                    center: .bottomTrailing,
                    startRadius: 0,
                    endRadius: 300
                )
            }
            .blendMode(.screen)

            // Top specular highlight (upper half)
            GeometryReader { geo in
                LinearGradient(
                    colors: [Color.white.opacity(0.10), .clear],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(height: geo.size.height * 0.5)
            }
            .allowsHitTesting(false)

            // Content
            VStack(spacing: 12) {
                HeaderRow(state: state)
                MainRow(state: state)
                ProgressRow(state: state)
            }
            .padding(14)
        }
        .clipShape(RoundedRectangle(cornerRadius: 26, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 26, style: .continuous)
                .stroke(Color.white.opacity(0.22), lineWidth: 0.5)
        )
    }
}

// MARK: - Header

@available(iOS 16.2, *)
struct HeaderRow: View {
    let state: DMusicAttributes.State

    var body: some View {
        HStack(spacing: 8) {
            // App icon (matches active palette: crimson or violet variant).
            // Bundled via targets/dmusicwidget/assets/ folder, loaded as a
            // bundle resource. UIImage gives us a fallback if the asset
            // isn't found (so we don't render an empty gray box).
            AppIconView(accentHex: state.accentHex)
                .frame(width: 22, height: 22)
                .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
                .shadow(color: Color(hexString: state.accentHex).opacity(0.4), radius: 6)

            Text("DMusic · now playing")
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(.white.opacity(0.55))
                .tracking(0.2)
                .frame(maxWidth: .infinity, alignment: .leading)

            if state.sourceIsLink {
                LinkPill(accentHex: state.accentHex)
            }
        }
    }
}

@available(iOS 16.2, *)
struct AppIconView: View {
    let accentHex: String

    var body: some View {
        let isViolet = accentHex.lowercased().hasPrefix("#a1") || accentHex.lowercased().hasPrefix("#a6")
        // Icon data is embedded as base64 in DMusicIconData.swift to avoid
        // asset-catalog and bundle-resource lookup that kept failing (gray).
        let b64 = isViolet ? DMusicIconData.violetBase64 : DMusicIconData.crimsonBase64
        if let data = Data(base64Encoded: b64), let img = UIImage(data: data) {
            Image(uiImage: img).resizable().scaledToFit()
        } else {
            ZStack {
                RoundedRectangle(cornerRadius: 5, style: .continuous)
                    .fill(Color(red: 1.0, green: 0.0, blue: 1.0))
                Text("?")
                    .font(.system(size: 14, weight: .black))
                    .foregroundColor(.white)
            }
        }
    }
}

@available(iOS 16.2, *)
struct LinkPill: View {
    let accentHex: String

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: "link")
                .font(.system(size: 9, weight: .semibold))
                .foregroundColor(.white)
            Text("LINK")
                .font(.system(size: 9.5, weight: .bold, design: .monospaced))
                .foregroundColor(.white)
                .tracking(0.5)
        }
        .padding(.leading, 6)
        .padding(.trailing, 7)
        .padding(.vertical, 3)
        .background(
            Capsule().fill(Color(hexString: accentHex))
        )
        .shadow(color: Color(hexString: accentHex).opacity(0.5), radius: 4)
    }
}

// MARK: - Main row

@available(iOS 16.2, *)
struct MainRow: View {
    let state: DMusicAttributes.State

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                // Glow behind cover
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(Color(hexString: state.accentHex).opacity(0.55))
                    .blur(radius: 8)
                    .padding(-6)
                Cover(state: state, size: 52)
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            }
            .frame(width: 52, height: 52)

            VStack(alignment: .leading, spacing: 2) {
                Text(state.title)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.white)
                    .tracking(-0.2)
                    .lineLimit(1)
                Text(state.artist)
                    .font(.system(size: 12.5, weight: .regular))
                    .foregroundColor(.white.opacity(0.55))
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            HStack(spacing: 8) {
                // Replay (glass chip)
                Button(intent: ReplayIntent()) {
                    ZStack {
                        Circle()
                            .fill(.ultraThinMaterial)
                        Circle()
                            .fill(Color.white.opacity(0.10))
                        Image(systemName: "arrow.counterclockwise")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                    }
                    .frame(width: 32, height: 32)
                    .overlay(
                        Circle().stroke(Color.white.opacity(0.18), lineWidth: 0.5)
                    )
                }
                .buttonStyle(.plain)

                // Play / Pause (accent solid)
                Button(intent: PlayPauseIntent()) {
                    ZStack {
                        Circle().fill(Color(hexString: state.accentHex))
                        Image(systemName: state.isPlaying ? "pause.fill" : "play.fill")
                            .font(.system(size: state.isPlaying ? 14 : 16, weight: .bold))
                            .foregroundColor(.white)
                            .offset(x: state.isPlaying ? 0 : 1)
                    }
                    .frame(width: 38, height: 38)
                    .overlay(
                        Circle().stroke(Color.white.opacity(0.15), lineWidth: 0.5)
                    )
                    .shadow(color: Color(hexString: state.accentHex).opacity(0.45), radius: 9)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

// MARK: - Progress row

@available(iOS 16.2, *)
struct ProgressRow: View {
    let state: DMusicAttributes.State

    var body: some View {
        HStack(spacing: 10) {
            Text(formatTime(ms: state.positionMs))
                .font(.system(size: 10, weight: .medium, design: .monospaced))
                .foregroundColor(Color(hexString: state.accentHex))
                .tracking(0.5)
                .contentTransition(.identity)

            WaveBars(
                progress: progressFraction(state: state),
                accentHex: state.accentHex,
                count: 56,
                height: 20
            )
            .overlay {
                if #available(iOS 17.0, *) {
                    SeekTapZones(zones: 14)
                }
            }
            .frame(maxWidth: .infinity)
            .animation(nil, value: state.positionMs)

            Text(formatTime(ms: state.durationMs))
                .font(.system(size: 10, weight: .medium, design: .monospaced))
                .foregroundColor(.white.opacity(0.45))
                .tracking(0.5)
                .contentTransition(.identity)
        }
    }

    func formatTime(ms: Double) -> String {
        guard ms > 0 else { return "0:00" }
        let total = Int(ms / 1000)
        let m = total / 60
        let s = total % 60
        return String(format: "%d:%02d", m, s)
    }
}

@available(iOS 17.0, *)
struct SeekTapZones: View {
    let zones: Int

    var body: some View {
        HStack(spacing: 0) {
            ForEach(0..<zones, id: \.self) { i in
                Button(intent: SeekIntent(position: Double(i) / Double(max(1, zones - 1)))) {
                    Color.clear
                        .contentShape(Rectangle())
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
                .buttonStyle(.plain)
            }
        }
    }
}

// MARK: - Cover (with generative fallback)

@available(iOS 16.2, *)
struct Cover: View {
    let state: DMusicAttributes.State
    let size: CGFloat

    var body: some View {
        Group {
            if let s = state.artworkURL, let url = URL(string: s) {
                // Local file: load synchronously (widgets can't reliably do network).
                // Remote: try AsyncImage as fallback (rarely succeeds in widget).
                if url.isFileURL,
                   let data = try? Data(contentsOf: url),
                   let img = UIImage(data: data) {
                    Image(uiImage: img).resizable().scaledToFill()
                } else {
                    AsyncImage(url: url) { phase in
                        switch phase {
                        case .success(let img):
                            img.resizable().scaledToFill()
                        default:
                            GenerativeCover(hue: state.artHue, size: size)
                        }
                    }
                }
            } else {
                GenerativeCover(hue: state.artHue, size: size)
            }
        }
        .frame(width: size, height: size)
        .clipped()
    }
}

@available(iOS 16.2, *)
struct GenerativeCover: View {
    let hue: Double
    let size: CGFloat

    var body: some View {
        ZStack {
            // Base radial gradient using HSL approximation of the hue
            RadialGradient(
                colors: [
                    Color(hue: hue / 360, saturation: 0.65, brightness: 0.78),
                    Color(hue: ((hue + 30).truncatingRemainder(dividingBy: 360)) / 360, saturation: 0.7, brightness: 0.32),
                ],
                center: UnitPoint(x: 0.25, y: 0.25),
                startRadius: 0,
                endRadius: size * 0.9
            )
            // Blob 1 (bottom-right)
            Circle()
                .fill(Color(hue: ((hue + 90).truncatingRemainder(dividingBy: 360)) / 360, saturation: 0.85, brightness: 0.5))
                .frame(width: size * 0.85, height: size * 0.85)
                .blur(radius: size * 0.18)
                .opacity(0.8)
                .offset(x: size * 0.15, y: size * 0.15)
            // Blob 2 (top-left)
            Circle()
                .fill(Color(hue: ((hue + 330).truncatingRemainder(dividingBy: 360)) / 360, saturation: 0.6, brightness: 0.88))
                .frame(width: size * 0.7, height: size * 0.7)
                .blur(radius: size * 0.18)
                .opacity(0.55)
                .offset(x: -size * 0.25, y: -size * 0.25)
        }
        .overlay(
            RoundedRectangle(cornerRadius: size * 0.12, style: .continuous)
                .stroke(Color.white.opacity(0.18), lineWidth: 0.5)
        )
        .clipShape(RoundedRectangle(cornerRadius: size * 0.12, style: .continuous))
    }
}

// MARK: - Waveform bars (56 deterministic)

@available(iOS 16.2, *)
struct WaveBars: View {
    let progress: Double
    let accentHex: String
    let count: Int
    let height: CGFloat

    var body: some View {
        GeometryReader { geo in
            let barGap: CGFloat = 1.5
            let totalGaps = CGFloat(count - 1) * barGap
            let barWidth = max(1, (geo.size.width - totalGaps) / CGFloat(count))
            HStack(alignment: .center, spacing: barGap) {
                ForEach(0..<count, id: \.self) { i in
                    let h = barHeight(i: i)
                    let filled = Double(i) / Double(count) <= progress
                    RoundedRectangle(cornerRadius: 0.6, style: .continuous)
                        .fill(filled ? Color(hexString: accentHex) : Color.white.opacity(0.18))
                        .frame(width: barWidth, height: height * h)
                }
            }
            .frame(width: geo.size.width, height: height, alignment: .center)
        }
        .frame(height: height)
    }

    private func barHeight(i: Int) -> CGFloat {
        let v = sin(Double(i) * 1.7) * 0.5 + cos(Double(i) * 0.9) * 0.5
        return CGFloat(0.35 + abs(v) * 0.65)
    }
}
