# Orange Electron App

## Prerequisites
- Node.js (v18 or newer recommended)
- npm (comes with Node.js)

## Install dependencies
```
npm install
```

## Run the app in development
```
npm start
```

## Build the app for your current platform
```
npm run build
```

## Release binaries for all platforms
This will build release packages for:
- Linux x86_64 (AppImage, deb, zip)
- Windows x86_64 (NSIS installer, zip)
- macOS x86_64 and Apple Silicon (dmg, zip)

```
npm run release:all
```

Release files will be found in the `dist/` or `release/` directory after building.

## Dependencies
- [Electron](https://www.electronjs.org/) (runtime)
- [electron-builder](https://www.electron.build/) (for building and packaging)

All dependencies are managed via npm and listed in `package.json`.

## Version control
This project uses git. To commit changes:
```
git add .
git commit -m "Your message"
```

## Notes
- The app uses a global shortcut (Ctrl+Alt+Shift+K) to toggle kiosk mode.
- The toolbar in the app allows toggling fullscreen/kiosk and quitting the app.
- Only Electron and its dependencies are required; no extra modules are used.
