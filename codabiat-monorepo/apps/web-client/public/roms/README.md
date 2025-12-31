# Comix Zone ROM Setup

To enable the Comix Zone game feature, you need to add the game ROM file to this directory.

## Required File

- **File name**: `comix-zone.bin`
- **Location**: `/public/roms/comix-zone.bin`
- **Platform**: Sega Genesis / Mega Drive

## How to Obtain

1. You must own a legal copy of Comix Zone for Sega Genesis
2. Extract the ROM file from your legally owned cartridge or digital copy
3. Rename it to `comix-zone.bin`
4. Place it in this directory (`apps/web-client/public/roms/`)

## Legal Notice

⚠️ **Important**: ROM files are copyrighted material. You should only use ROM files from games you legally own. Downloading ROM files from the internet without owning the original game is likely illegal in your jurisdiction.

Sega Genesis/Mega Drive games, including Comix Zone, are copyrighted by SEGA Corporation.

## Alternative

If you don't have the ROM file, the game button will still appear but the emulator will show an error when trying to load the game.

You can also use any other Sega Genesis ROM by:
1. Placing your ROM file in this directory
2. Updating the `EJS_gameUrl` path in `ComixZoneGame.tsx` to point to your ROM file
