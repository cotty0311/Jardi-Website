# Image coordinate tool

Turn markers on a map image into a coordinate list and a shorter route. Supply at least two real coordinate pairs to calibrate each image.

> The tool cannot determine a map's geographic location from the image alone.

## Step-by-step guide

<div class="step-guide">

1. **Choose images**

   Select one or more images, ideally maps containing circles of similar sizes. Results from multiple images are merged and duplicate points can be removed.
2. **Check the circles**

   The tool detects circles automatically. Use Add/Remove circles to correct the detected markers.
3. **Set calibration coordinates**

   Enter at least **two** known coordinates for each image, using decimal `latitude,longitude`, such as `25.033968, 121.564468`. Red warnings indicate a possible formatting or range error.
4. **Calculate coordinates and a route**

   Click Calculate coordinates and route. The tool estimates the remaining coordinates and arranges a shorter route, which is not guaranteed to be the shortest. Check the results, especially with scaled, rotated, or distorted images. Point order does not guarantee a road-following or physically accessible route.
5. **Copy or save**

   Click Copy list, or enter a filename and save the coordinate sequence for later.

</div>

## Video walkthrough

<figure class="media-card">
<figcaption><strong>From an image to a coordinate list</strong><span>A 58-second silent walkthrough of the image coordinate workflow.</span></figcaption>
<video class="demo-video" controls playsinline preload="none" poster="../images/screenrecord/imagetool-record-demo-poster.jpg" aria-label="Image coordinate tool walkthrough">
<source src="../images/screenrecord/imagetool-record-demo.mp4" type="video/mp4">
Your browser cannot play this video inline. Use the download link below.
</video>
<p class="media-note"><a href="../images/screenrecord/imagetool-record-demo.mp4" download>Download the walkthrough (MP4, about 14 MB) ↓</a></p>
</figure>

## Working with multiple images

Coordinates from all images are combined into one list, useful for adjacent map screenshots. Use Previous/Next to check each image. Adjust the duplicate-distance threshold in meters to control which points are merged.

Keep a little overlap between screenshots so you can reuse known calibration points.

## Use the saved route

1. Copy the list or save it with a recognizable filename.
2. Open **advanced** in the main window and select the file, or paste the coordinate list.
3. Confirm that there are at least two valid points, confirm the settings, then start **🧭** route movement.

Closing the image tool copies the list automatically. Save explicitly first if you need the route later.

## Are images uploaded?

Image detection and coordinate calculation happen on your Mac. Images are **not uploaded**. Images and coordinates remain in the tool's current session; keep the original image files yourself. See [Backups](Data.md) to preserve saved routes.
