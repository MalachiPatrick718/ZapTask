import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerZIP } from '@electron-forge/maker-zip';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

const isSigning = !!process.env.APPLE_IDENTITY;

const config: ForgeConfig = {
  packagerConfig: {
    name: 'ZapTask',
    icon: './assets/icons/icon',
    appBundleId: 'io.zaptask.app',
    asar: {
      unpack: '{**/*.node,**/*.dylib,**/*.dll,**/better-sqlite3/**,**/bindings/**,**/file-uri-to-path/**}',
    },
    extraResource: ['./assets/icons'],
    protocols: [
      {
        name: 'ZapTask',
        schemes: ['zaptask'],
      },
    ],
    // macOS code signing — only active when APPLE_IDENTITY env var is set
    ...(isSigning && {
      osxSign: {
        identity: process.env.APPLE_IDENTITY!,
        optionsForFile: () => ({
          entitlements: './entitlements.plist',
          hardenedRuntime: true,
        }),
      },
      osxNotarize: {
        appleId: process.env.APPLE_ID!,
        appleIdPassword: process.env.APPLE_ID_PASSWORD!,
        teamId: process.env.APPLE_TEAM_ID!,
      },
    }),
    afterCopy: [
      (buildPath: string, electronVersion: string, platform: string, arch: string, callback: (err?: Error) => void) => {
        const modules = ['better-sqlite3', 'bindings', 'file-uri-to-path'];
        try {
          // Copy modules into the packaged app
          for (const mod of modules) {
            const src = path.resolve(__dirname, 'node_modules', mod);
            const dest = path.join(buildPath, 'node_modules', mod);
            if (fs.existsSync(src)) {
              fs.cpSync(src, dest, { recursive: true });
            }
          }

          // Rebuild better-sqlite3 for Electron's Node.js version
          execSync(
            `npx @electron/rebuild --only better-sqlite3 --version ${electronVersion} --arch ${arch}`,
            {
              cwd: buildPath,
              stdio: 'inherit',
            }
          );

          callback();
        } catch (err) {
          callback(err as Error);
        }
      },
    ],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({ name: 'ZapTask' }),
    new MakerDMG({ format: 'ULFO', name: 'ZapTask' }),
    new MakerZIP({}, ['darwin']),
  ],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: 'src/main/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
