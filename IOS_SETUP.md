# BetterMe — iOS Build Setup

## Prerequisites
- Mac with Xcode 15+ installed
- Apple Developer account ($99/year)
- Node.js 18+

## First-time setup (run once on your Mac)

```bash
# 1. Clone the repo
git clone https://github.com/yevgenybrener-crypto/betterme.git
cd betterme

# 2. Install dependencies
npm install

# 3. Build the web app
npm run build

# 4. Add iOS platform
npx cap add ios

# 5. Sync web assets into iOS project
npx cap sync ios

# 6. Open in Xcode
npx cap open ios
```

## Configure HealthKit in Xcode

1. In Xcode, select the **BetterMe** target
2. Go to **Signing & Capabilities**
3. Click **+ Capability** → add **HealthKit**
4. In the `ios/App/App/Info.plist`, add these keys (already in the plist template below):
   - `NSHealthShareUsageDescription` → "BetterMe reads your workouts to automatically complete your fitness goals"
   - `NSHealthUpdateUsageDescription` → "BetterMe needs Health access to track your fitness goals"

## Info.plist additions

Add to `ios/App/App/Info.plist`:
```xml
<key>NSHealthShareUsageDescription</key>
<string>BetterMe reads your workouts and activity to automatically complete your fitness goals.</string>
<key>NSHealthUpdateUsageDescription</key>
<string>BetterMe may write workout data to Apple Health.</string>
```

## Update workflow (after any code changes)

```bash
# Build web app + sync to iOS
npm run build && npx cap sync ios

# Open Xcode to build + run
npx cap open ios
```

## App Store submission checklist

- [ ] Bundle ID set: `com.betterme.app`
- [ ] App icons added (use `ios/App/App/Assets.xcassets/AppIcon.appiconset`)
- [ ] Splash screen configured
- [ ] HealthKit capability enabled
- [ ] Info.plist health descriptions added
- [ ] Signing certificate + provisioning profile set up
- [ ] Archive + upload via Xcode → Organizer

## App icon sizes needed
- 1024×1024 (App Store)
- 180×180 (iPhone @3x)
- 120×120 (iPhone @2x)
- 60×60 (iPhone @1x)

Use a tool like [appicon.co](https://appicon.co) to generate all sizes from one 1024×1024 image.
