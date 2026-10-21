# Practice examples

Try three short exercises after completing [installation and connection](Install.md). Check that Jardi is ready before starting.

## Jump to one coordinate

1. Enter the following coordinate in the destination field.
2. Click **✈️** and check the location in an iPhone map app.
3. Click Clear location when finished and read the result message.

```text
25.033968, 121.564468
```

**Expected result:** the map shows a position near the destination. If it still shows the old position, allow it to update and check the connection status.

## Follow a three-point route

This example practices route setup; it is not a walking-navigation route.

```text
25.033968, 121.564468
25.034568, 121.565068
25.035168, 121.564468
```

1. Open advanced, choose pasted coordinates, and paste the three lines.
2. Set speed to **5 km/hr** and start index to **1**.
3. Turn off fast, Orbit, reverse, and repeat.
4. Confirm, then click **🧭** in the main window.
5. Watch the progress. Pause and resume, or stop and clear the location.

**Expected result:** Jardi simulates movement along the line segments between points in sequence. Save the route in advanced if you want to reuse it.

## Save your route

1. Paste the same coordinates in advanced.
2. Enter a recognizable name, such as “My first route”.
3. Choose Save As.
4. Switch to file input and check that your route is available.
5. Use Open folder in the CSV editor to locate your personal data and make a backup.

**Expected result:** the route remains available the next time you open Jardi. See [Places, routes, and backups](Data.md).

## Explore further

Try reverse, repeat, or Orbit one at a time to understand each effect. See [Advanced options](UserGuide_1-2.md#advanced-options).
