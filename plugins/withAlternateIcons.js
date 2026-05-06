const { withInfoPlist, withDangerousMod, withXcodeProject, IOSConfig } =
  require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

// Maps the icon "key" (what we pass to setAlternateIconName) to the icon
// file basename. For each name, iOS expects PNGs named <basename>@2x.png and
// <basename>@3x.png at the app bundle root.
const ICONS = {
  Crimson: "AppIcon-Crimson",
  Violet: "AppIcon-Violet",
};

// Source files live at assets/alternate-icons/ — see icon-gen step.
const SOURCE_DIR = path.join("assets", "alternate-icons");

const withAlternateIcons = (config) => {
  // 1. Info.plist — declare the alternate icons so iOS recognizes the names.
  config = withInfoPlist(config, (config) => {
    const plist = config.modResults;
    plist.CFBundleIcons = plist.CFBundleIcons || {};
    const alt = {};
    for (const [name, basename] of Object.entries(ICONS)) {
      alt[name] = {
        CFBundleIconFiles: [basename],
        UIPrerenderedIcon: false,
      };
    }
    plist.CFBundleIcons.CFBundleAlternateIcons = alt;
    return config;
  });

  // 2. Copy the @2x/@3x PNGs into ios/<ProjectName>/ and register them
  //    in Xcode's Resources build phase so they're bundled with the app.
  config = withDangerousMod(config, [
    "ios",
    async (config) => {
      const { projectRoot, projectName } = config.modRequest;
      const sourceDir = path.join(projectRoot, SOURCE_DIR);
      const targetDir = path.join(projectRoot, "ios", projectName);
      if (!fs.existsSync(sourceDir)) return config;
      for (const file of fs.readdirSync(sourceDir)) {
        if (file.endsWith(".png")) {
          fs.copyFileSync(
            path.join(sourceDir, file),
            path.join(targetDir, file)
          );
        }
      }
      return config;
    },
  ]);

  // 3. Register the copied PNGs in the Xcode project's Resources phase.
  config = withXcodeProject(config, (config) => {
    const project = config.modResults;
    const { projectRoot, projectName } = config.modRequest;
    const sourceDir = path.join(projectRoot, SOURCE_DIR);
    if (!fs.existsSync(sourceDir)) return config;
    for (const file of fs.readdirSync(sourceDir)) {
      if (!file.endsWith(".png")) continue;
      // Skip if already registered (in case prebuild runs twice).
      const filePath = path.join(projectName, file);
      if (project.hasFile(filePath)) continue;
      IOSConfig.XcodeUtils.addResourceFileToGroup({
        filepath: filePath,
        groupName: projectName,
        project,
        isBuildFile: true,
        verbose: false,
      });
    }
    return config;
  });

  return config;
};

module.exports = withAlternateIcons;
