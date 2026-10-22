# Installation and setup

Connect your iPhone to your Mac with a USB cable, then install and set up Jardi.

<section class="download-panel">
<div class="download-copy">
<h2 id="download-jardi">Download Jardi</h2>

{{download}}

</div>
<img src="../images/connect-mac-iphone.png" alt="Connect a Mac and iPhone with USB" class="connection-art">
</section>

Use the release information for the version selected on this page. The packaged app does not require a separate installation of Python, pymobiledevice3, or developer tools.

## Requirements

| Item | Requirement |
| --- | --- |
| Mac | Apple Silicon (M series), macOS 14 or later; the current DMG does not support Intel Macs |
| iPhone | One connected phone at a time; enable Developer Mode on iOS 16 and later |
| USB cable | Must support data transfer, not just charging |

Your Mac account must be able to authorize administrator access for the connection setup.

The app retains older iOS location-service support and uses a newer connection method on iOS 17 and later. A fully device-tested minimum iOS version and compatibility list are not yet available.

## Install on your Mac

1. Download the DMG for your selected version and open it.
2. Drag **Jardi - Location Tool™** into **Applications**.
3. Eject the DMG and open Jardi from Applications.
4. If you allow Mac location access, Jardi tries to use it as the initial position. You can still enter destinations manually without this permission.

### If macOS blocks opening

If you have verified the package's source and integrity, try opening Jardi, then use **System Settings → Privacy & Security → Open Anyway** and follow the system prompts.

The current package uses an ad-hoc signature and is not Developer ID signed or notarized by Apple. See [Apple's guide to safely opening apps](https://support.apple.com/102445).

## Connect your iPhone

1. Connect it with a data-capable USB cable and unlock it. Choose **Trust** if asked to trust the Mac.
2. On iOS 16 or later, enable **Settings → Privacy & Security → Developer Mode**. Restart the phone when prompted, unlock it, and confirm enabling the mode.
3. Complete the Mac administrator authorization used to establish and clean up phone connection processes. Jardi does not store the administrator password.
4. Wait until Jardi shows the green connected status.

If Developer Mode is missing, check that the phone is connected and trusts the Mac, then see [Apple's Developer Mode instructions](https://developer.apple.com/documentation/xcode/enabling-developer-mode-on-a-device).

## Try your first coordinate

Enter **latitude first, longitude second**, separated by a comma:

```text
25.033968, 121.564468
```

Click **✈️**, then check an iPhone map app. The simulated location should move near Taipei 101.

## Connection stuck?

Check that the phone is unlocked, the cable supports data, the Mac is trusted, and Developer Mode is enabled. Reconnect the cable. If necessary, quit Jardi with **⌘Q** and reopen it. Close other iPhone connection tools if a service is reported as busy.

See [FAQ](FAQ.md) for more troubleshooting.
