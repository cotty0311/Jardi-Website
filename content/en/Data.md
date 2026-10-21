# Places, routes, and backups

Save favorite places and routes to reuse them later. Jardi includes a CSV editor and keeps your personal route files locally.

## Edit places and routes

1. Choose **File → Edit CSV Data…**, or press **⌘⇧E**.
2. Select the data file.
3. Add, edit, or delete rows; check names and coordinate formatting.
4. Save your changes.

You can also right-click the route-file dropdown in advanced and choose **Edit Coordinates**. Preserve the existing column structure when first editing a CSV.

## Save pasted coordinates

In advanced, switch to pasted coordinates and enter one `latitude,longitude` pair per line. After successful parsing, enter a filename and choose Save As. The route will appear in the file list.

## Personal data folder

```text
~/Library/Application Support/Jardi/Data/
```

On the first launch after upgrading, Jardi imports legacy data. Existing files with the same name in the new folder take precedence. A complete legacy copy is stored in `Migration Backup/` for comparison; the original old folder is not deleted.

Import runs only once. Subsequent additions, edits, and deletions use the Jardi folder. Check your favorites and routes before deciding whether to remove old backups.

## Make a backup

1. Click Open folder in the CSV editor.
2. Save your changes and quit Jardi.
3. Copy the entire `Data` folder to your chosen backup location.
4. To restore, back up the current data first, then replace the relevant files while Jardi is closed.

App updates do not overwrite existing personal copies. Deleting the app does not automatically delete this folder.

## Before sharing

Routes may contain home, work, or other private locations. Remove anything you do not want to share from CSVs, images, or diagnostic logs; logs may also contain device identifiers.
