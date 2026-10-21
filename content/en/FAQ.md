# Frequently asked questions

## iPhone not found

Unlock the phone, check the USB data cable, and trust the Mac. Reconnect the cable and confirm Developer Mode is enabled where required. See [Installation](Install.md).

## Developer Mode is enabled but Jardi says it is not

Restart the phone and confirm the enable prompt after unlocking it. Reconnect and try again.

## Connection fails or disconnects

Jardi checks the phone and attempts one automatic reconnection. Keep the cable connected, the phone unlocked, and complete Mac administrator authorization.

If this fails, reconnect the cable. If a service is busy, close other Jardi instances or iPhone connection tools. Quit with ⌘Q and reopen Jardi if necessary.

## Developer image preparation fails

Check your internet connection, unlock the phone, and enable Developer Mode. The first preparation may take longer. If it continues to fail, check for a newer Jardi version and record the error message.

## macOS cannot verify the developer

The current package is not Developer ID signed or notarized by Apple. Verify the source and follow [the installation instructions](Install.md#if-macos-blocks-opening).

## Why does stopping not restore my location?

Stopping ends movement but may leave the simulated position active. Use Clear location, read the result, and check the phone's map. Reopen the map or restart the phone if needed. See [Clear location](UserGuide_1.md#clear-location).

## Checking for updates reports a download error

{{update-status}}

## Are Intel Macs, Windows, and every iOS version supported?

The current DMG targets Apple Silicon and macOS 14 or later. There is no Windows or Intel installer. A full device-tested iPhone compatibility list is not yet available; code support alone is not proof that every iOS version has been verified.

## Can I decline Mac location permission?

Yes, you can enter destinations manually. Declining affects the initial position and synchronizing to the Mac's position before clearing location. Jardi still attempts to release simulated location; check the result message.

## Will updating delete my routes?

Jardi keeps existing personal data rather than overwriting it with bundled CSVs. Make regular [backups](Data.md), especially before changing computers or reorganizing files.

## Still need help?

Record your Jardi, macOS, and iOS versions, steps to reproduce, and the error message. Visit [Report a problem](Problem.md).
