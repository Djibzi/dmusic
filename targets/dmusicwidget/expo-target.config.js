/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: "widget",
  name: "DMusicWidget",
  bundleIdentifier: "com.dmusic.app.widget",
  deploymentTarget: "17.0",
  icon: "../../assets/icon.png",
  frameworks: ["SwiftUI", "WidgetKit", "ActivityKit", "AppIntents"],
  entitlements: {
    "com.apple.security.application-groups": ["group.com.dmusic.app"],
  },
  // Live Activity icons are embedded as base64 in DMusicIconData.swift —
  // no bundle/xcassets dependency.
};
