const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// SVG transformer: import .svg files as React components
const { transformer, resolver } = config;

config.transformer = {
  ...transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
};

config.resolver = {
  ...resolver,
  assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
  sourceExts: [...resolver.sourceExts, "svg"],
  // Use browser field in package.json so ws resolves to browser.js
  // instead of index.js (which requires Node's stream module)
  unstable_enablePackageExports: false,
  // Force ws to resolve to its browser entry
  resolveRequest: (context, moduleName, platform) => {
    if (moduleName === "react-native-linear-gradient") {
      return {
        type: "sourceFile",
        filePath: require.resolve("./src/shims/react-native-linear-gradient.js"),
      };
    }
    // @posthog/core uses package.json "exports" for subpaths, but
    // unstable_enablePackageExports is off — resolve manually.
    if (moduleName.startsWith("@posthog/core/")) {
      const subpath = moduleName.replace("@posthog/core/", "");
      const resolved = require("path").resolve(
        __dirname,
        "node_modules/@posthog/core/dist",
        subpath,
        "index.js"
      );
      return { type: "sourceFile", filePath: resolved };
    }
    if (moduleName === "ws") {
      return {
        type: "sourceFile",
        filePath: require.resolve(
          "@supabase/realtime-js/node_modules/ws/browser.js"
        ),
      };
    }
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
