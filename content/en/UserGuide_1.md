# Virtual location

Set your iPhone's simulated location to a destination using coordinates, world landmarks, or saved places.

> Stop automatic movement or route movement before using a destination control or clearing the location.

## Enter coordinates 🚴 ✈️

Enter `latitude, longitude`, in that order. Latitude must be between -90 and 90; longitude between -180 and 180. Use decimal degrees and a comma.

```text
25.033968, 121.564468
```

- Click **✈️** to jump directly to the destination.
- Click **🚴** to move from the current simulated location at the selected speed. Change the speed in **advanced**.

## World landmarks 🌍 and saved places 🔍

Choose a place from either dropdown, then click **🌍** or **🔍** to jump there.

To add or remove places, **right-click the dropdown** and choose **Edit Coordinates**.

![Opening the coordinate editor from the dropdown](../images/screenshot/open_edit_csv-light-en.png)

See [Places, routes, and backups](Data.md) for the CSV editor.

## Clear location

**Clear location** tries to obtain the Mac's current location, synchronize it to the phone, and then release simulated location.

1. Stop the route, click Clear location, and read the result message.
2. If the Mac's location cannot be obtained, Jardi still attempts to release simulated location. Check the result.
3. Check your location in an iPhone map app, then quit Jardi with **⌘Q**.
4. If the phone still shows an old location, reopen the map app or restart the iPhone if needed.

Releasing simulated location does not guarantee an immediate fresh GPS fix. Check the phone and Jardi's result message.

> **Stop** ends movement at the current simulated position. Use **Clear location** when you want to return to your actual location.
