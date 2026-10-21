# Virtual movement

Simulated movement is a sequence of location updates. Jardi supports automatic square-spiral movement and movement along your own route.

## Automatic movement 🚶‍♀️

Automatic movement starts at the position currently recorded by Jardi and follows a square spiral. The Mac's location may supply the initial position at launch; after an operation, Jardi uses the recorded simulated iPhone location.

Entering `1` km covers a square with a 1 km radius: **2 km × 2 km**. Movement stops after the area has been covered.

<figure class="media-card">
<figcaption><strong>How does a square spiral move?</strong><span>Adjust speed or use Start, Pause, and Stop to explore the path from the center outward.</span></figcaption>
<iframe class="demo-frame" src="../_Animation/square-spiral/index.html" title="Interactive square-spiral demo" loading="lazy" sandbox="allow-scripts"></iframe>
<p class="media-note">This scaled animation does not connect to an iPhone or represent actual travel distance or duration.</p>
</figure>

## Route movement 🧭

1. Open **advanced**.
2. Choose a route file or paste coordinates, one pair per line. You need at least **two valid coordinates**.
3. Set the speed and route options, then confirm.
4. Back in the main window, click **🧭** to start.

```text
25.033968, 121.564468
25.034568, 121.565068
25.035168, 121.564468
```

> Stop automatic or route movement before opening advanced.

## Advanced options

| Option | Effect |
| --- | --- |
| speed | 1–20 km/hr; applies to automatic movement, route movement, and the bicycle destination control |
| fast | Jumps between points, waiting **20 seconds** at each point |
| start | Starting coordinate number, beginning at 1; random selects a random start |
| reverse | Traverses the coordinate sequence in reverse |
| repeat | Repeats the route until you stop it manually |
| Orbit 🪐 | Covers an area around each target before moving to the next |

If the start index is outside the coordinate list, route movement cannot start.

<figure class="media-card">
<figcaption><strong>Try the advanced options</strong><span>Toggle fast, reverse, repeat, and Orbit to compare the order and style of movement.</span></figcaption>
<iframe class="demo-frame" src="../_Animation/advanced-demo/index.html" title="Interactive advanced route demo" loading="lazy" sandbox="allow-scripts"></iframe>
<p class="media-note">The demo shortens fast waits to about one second and illustrates Orbit with circles. The actual app uses the timing and coverage behavior described above.</p>
</figure>
