import { existsSync } from 'node:fs';
import { cp, mkdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dir, '..');
const DIST_DIR = join(ROOT, 'dist');
const MACOS_DIR = join(ROOT, 'macos');
const OUT_DIR = join(ROOT, 'dist-app');
const APP_BUNDLE = join(OUT_DIR, 'Sticky.app');
const CONTENTS_DIR = join(APP_BUNDLE, 'Contents');
const MACOS_BIN_DIR = join(CONTENTS_DIR, 'MacOS');
const RESOURCES_DIR = join(CONTENTS_DIR, 'Resources');

const run = async (cmd: string[], cwd = ROOT) => {
  const proc = Bun.spawn(cmd, { cwd, stdout: 'inherit', stderr: 'inherit' });
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(`Command failed with exit code ${exitCode}: ${cmd.join(' ')}`);
  }
};

const buildMacApp = async () => {
  const shouldInstall = process.argv.includes('--install');

  console.log('📦 Building web assets...');
  await run(['bun', 'run', 'build']);

  const icnsPath = join(MACOS_DIR, 'AppIcon.icns');
  if (!existsSync(icnsPath)) {
    console.log('🎨 Generating AppIcon.icns...');
    await run(['swift', join(MACOS_DIR, 'generate-icon.swift'), MACOS_DIR]);
  }

  console.log('🧹 Preparing bundle structure...');
  await rm(APP_BUNDLE, { recursive: true, force: true });
  await mkdir(MACOS_BIN_DIR, { recursive: true });
  await mkdir(RESOURCES_DIR, { recursive: true });

  console.log('⚡ Compiling native Swift binary with swiftc...');
  const swiftSource = join(MACOS_DIR, 'main.swift');
  const binaryDest = join(MACOS_BIN_DIR, 'Sticky');
  await run([
    'swiftc',
    '-O',
    '-parse-as-library',
    swiftSource,
    '-framework',
    'Cocoa',
    '-framework',
    'WebKit',
    '-o',
    binaryDest,
  ]);

  console.log('📋 Copying resources...');
  await Promise.all([
    cp(DIST_DIR, join(RESOURCES_DIR, 'dist'), { recursive: true }),
    cp(icnsPath, join(RESOURCES_DIR, 'AppIcon.icns')),
    cp(join(MACOS_DIR, 'Info.plist'), join(CONTENTS_DIR, 'Info.plist')),
  ]);

  console.log('🔏 Signing application bundle (ad-hoc)...');
  await run(['codesign', '--force', '--deep', '--sign', '-', APP_BUNDLE]);
  await run(['codesign', '--verify', APP_BUNDLE]);

  console.log('\n✨ macOS App built successfully:');
  console.log(`   ${APP_BUNDLE}\n`);

  if (shouldInstall) {
    const appDest = '/Applications/Sticky.app';
    console.log(`🚀 Installing to ${appDest}...`);
    await rm(appDest, { recursive: true, force: true }).catch(() => {});
    await cp(APP_BUNDLE, appDest, { recursive: true });
    console.log(`✅ Sticky.app installed to /Applications successfully!`);
  } else {
    console.log('💡 To install to Applications:');
    console.log('   cp -R dist-app/Sticky.app /Applications/\n');
    console.log('   or run: bun run install:app\n');
  }
};

buildMacApp().catch((err) => {
  console.error(err);
  process.exit(1);
});
