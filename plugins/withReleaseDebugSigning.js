const { withAppBuildGradle } = require('expo/config-plugins');

/** Sideloadable release APK without a Play Store keystore. */
function withReleaseDebugSigning(config) {
  return withAppBuildGradle(config, (mod) => {
    let src = mod.modResults.contents;
    if (src.includes('/* roundos-release-debug-sign */')) {
      return mod;
    }
    src = src.replace(
      /(?:^|\n)([ \t]*)release\s*\{/,
      (m, indent) =>
        `${m}\n${indent}    /* roundos-release-debug-sign */\n${indent}    signingConfig signingConfigs.debug`,
    );
    mod.modResults.contents = src;
    return mod;
  });
}

module.exports = withReleaseDebugSigning;
