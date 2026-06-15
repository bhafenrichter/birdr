const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// AppCheckCore (pulled in by @react-native-google-signin/google-signin) is a Swift pod
// that depends on GoogleUtilities and RecaptchaInterop, which don't generate module maps
// by default. Without this, pod install fails on EAS with:
// "The Swift pod AppCheckCore depends upon GoogleUtilities and RecaptchaInterop, which do not define modules."
module.exports = (config) =>
  withDangerousMod(config, [
    'ios',
    (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let podfile = fs.readFileSync(podfilePath, 'utf8');

      const injection = [
        "  pod 'GoogleUtilities', :modular_headers => true",
        "  pod 'RecaptchaInterop', :modular_headers => true",
      ].join('\n');

      if (!podfile.includes("pod 'GoogleUtilities', :modular_headers => true")) {
        podfile = podfile.replace('  use_expo_modules!', `  use_expo_modules!\n${injection}`);
        fs.writeFileSync(podfilePath, podfile);
      }

      return cfg;
    },
  ]);
