const esbuild = require("esbuild");
require('dotenv').config();

const IS_WATCH_MODE = process.env.IS_WATCH_MODE;

// Get environment variables for injection
const GRAFANA_TOKEN = process.env.GRAFANA_TOKEN || '';
const GRAFANA_URL = process.env.GRAFANA_URL || '';

const TARGET_ENTRIES = [
  {
    target: "node22",
    entryPoints: ["server/server.ts"],
    platform: "node",
    outfile: "../dist/server/server.js",
  },
  {
    target: "es2020",
    entryPoints: ["client/client.ts"],
    outfile: "../dist/client/client.js",
  },
];

if (IS_WATCH_MODE) {
  // TARGET_ENTRIES.push({
  //   target: "node16",
  //   entryPoints: ["server/dev-file-change-detector.ts"],
  //   platform: "node",
  //   outfile: "../dist/server/REMOVE_ME.js",
  // });
}

const buildBundle = async () => {
  try {
    const baseOptions = {
      logLevel: "info",
      bundle: true,
      charset: "utf8",
      keepNames: true,
      absWorkingDir: process.cwd(),
      loader: {
        // Handle .node files for Sentry
        '.node': 'file',
      },
      plugins: [],
      define: {
        // Inject environment variables as constants during build time
        'process.env.GRAFANA_TOKEN': JSON.stringify(GRAFANA_TOKEN),
        'process.env.GRAFANA_URL': JSON.stringify(GRAFANA_URL),
      },
    };

    if (IS_WATCH_MODE) {
      baseOptions.sourcemap = "inline";
    } else {
      baseOptions.minifyWhitespace = true;
      baseOptions.minifyIdentifiers = false;

      // Configure Sentry plugin
      baseOptions.sourcemap = true;
      // baseOptions.plugins.push(
      //   sentryEsbuildPlugin({
      //     authToken: process.env.SENTRY_AUTH_TOKEN,
      //     org: "chunks-org",
      //     project: "fivem-rest-api",
      //   })
      // );
    }

    for (const targetOpts of TARGET_ENTRIES) {
      let mergedOpts = { ...baseOptions, ...targetOpts };

      const context = await esbuild.context(mergedOpts);

      if (IS_WATCH_MODE) {
        await context.watch();
      } else {
        await context.rebuild();
        context.dispose();
      }
    }
  } catch (e) {
    console.log("[ESBuild] Build failed with error");
    console.error(e);
    process.exit(1);
  }
};

buildBundle().catch(() => process.exit(1));