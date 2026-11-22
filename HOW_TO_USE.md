# How to Use CLIP STUDIO / VI — Step-by-Step Guide

This guide walks through launching **CLIP STUDIO / VI**, importing stream VODs or local videos, extracting multiple clips from the same stream, framing your facecam and gameplay, and exporting 9:16 vertical Shorts.

---

## 1. Starting the Application

### Option A: One-Click Windows Launcher
1. Open the project folder `d:\Projects\clin_anti` in Windows Explorer.
2. Double-click **`run.bat`**.
3. Open your browser to **[http://127.0.0.1:8000](http://127.0.0.1:8000)**.

### Option B: Command Line (PowerShell / Terminal)
```powershell
cd d:\Projects\clin_anti
python app.py
```
Then visit **[http://127.0.0.1:8000](http://127.0.0.1:8000)**.

---

## 2. Setting Clip Duration & Number of Clips

In the **top toolbar** before importing or exporting:
1. **Shorts Length (`15S` – `60S`):** Click a quick preset (`15S`, `20S`, `30S`, `45S`, `60S`) or drag the duration slider to choose how long each vertical Short should be.
2. **Clips Count (`CLIPS COUNT: 1–10`):** Use the dropdown to pick how many clips (`1` to `10`) you want to extract from a stream URL or batch-render at once.
3. **Speaker Crop (`SPEAKER CROP: ON / OFF`):** Leave **ON** to automatically locate and track the streamer's facecam or high-action region using OpenCV.

---

## 3. Importing a YouTube / Twitch Stream VOD or Local Video

You do **not** need to download multi-gigabyte stream recordings first.

1. Click **`+ VOD URL / FILE`** in the top toolbar.
2. Set **Short Window Length (`15–60s`)** and **How Many Clips to Extract (`1–10`)**.
3. **Start Timestamp (Optional):**
   - Leave **blank** to let the engine automatically scan the **YouTube "Most Replayed" heatmap** (or spaced viral peaks) and pull the top moments.
   - Or enter a specific start time in seconds (e.g., `3600` for 1 hour into the stream).
4. **For a YouTube or Twitch URL:**
   - Paste the URL under **`01 / YOUTUBE OR TWITCH STREAM URL`**, enter a short tag (e.g., `GTA6`), and click **`↓ EXTRACT VIRAL WINDOW VIA YT-DLP`**.
5. **For a Local Recording (`.mp4`, `.mkv`, `.mov`, `.webm`):**
   - Choose your file under **`02 / LOCAL MP4, MKV, MOV, WEBM FILE`** and click **`↑ EXTRACT LOCAL WINDOW & SPEAKER-TRACK`**.

All extracted clips appear as cards inside **`MEDIA BIN / SOURCE MOMENTS`**.

---

## 4. Extracting More Clips From the Same Video

You can pull additional clips from any video in your Media Bin without re-pasting the URL or getting duplicate scenes:

- **Method 1 — `+ MORE (SAME VIDEO)` Button (Media Bin Header):**
  - Select how many new clips you want (`CLIPS COUNT: 1–10` in the top bar) and click **`+ MORE (SAME VIDEO)`**.
  - The studio checks which timestamps were already clipped from that stream URL, skips them, and extracts the next viral peaks (`GTA6 #2`, `GTA6 #3`, etc.).
- **Method 2 — `+` Button on Any Media Bin Card:**
  - Hover over any thumbnail card in the Media Bin and click the mint **`+`** button in the top-left corner of that card to extract more clips from that specific video.
- **Method 3 — `+ CLIP HERE` Button (Video Player Transport Bar):**
  - Scrub or play the video in the 16:9 Program Monitor to a moment you like, then click **`+ CLIP HERE`** (next to `CROP GUIDE`) to create a sub-clip starting at the current playhead time.

---

## 5. Framing Your 9:16 Vertical Output (`9:16 CROP`, `SPLIT CAM`, `FIT 16:9`)

Use the **Inspector Panel** on the right (and the **Vertical Output Preview** beside it) to customize how the 16:9 video is framed into `1080×1920`:

### A. Layout Modes (`02 / MOTION CROP`)
- **`9:16 CROP`:** Full-height vertical crop. Drag the **`X`** (`15.8%–84.2%`), **`Y`** (`0%–100%`), and **`ZOOM`** (`1.0x–2.5x`) sliders to position the frame anywhere from the far-left edge to the far-right edge.
- **`SPLIT CAM`:** Top 40% shows the zoomed streamer facecam; bottom 60% shows the center gameplay. Use **`X`** and **`Y`** to center the top box directly over the streamer's facecam.
- **`FIT 16:9`:** Shows the entire uncropped 16:9 video centered over a blurred vertical background.

### B. Interactive Program Monitor Dragging & Crop Guide
- Click **`CROP GUIDE: OFF`** in the transport bar beneath the 16:9 video if you want to turn **ON** the visual green reframe guide (`CROP GUIDE: ON`).
- You can also click and drag directly on the 16:9 Program Monitor to move the crop center (`X%`, `Y%`) at the current timestamp.
- By default, **`CROP GUIDE: OFF`** keeps the video preview clean, and exported MP4 files never contain green frames or timers.

---

## 6. Editing Captions & AI Viral Detection

### Editing Captions Manually
1. Click any pink caption block in the **`CAPTIONS`** timeline lane (or play the video to that timestamp).
2. In the right Inspector under **`01 / CAPTION`** (`ACTIVE LINE TEXT`), type your new caption text.
3. Toggle **`ALL CAPS`** or **`BEAT CUT`** as needed. Both the 16:9 monitor and 9:16 preview update live.

### Running Free Google Gemini AI Analysis (Optional)
1. Click **`⚡ AI VIRAL DETECT`** in the top toolbar.
2. Paste a free API key from **[Google AI Studio](https://aistudio.google.com/apikey)** (or leave it blank to use the built-in local OpenCV + Audio RMS analyzer).
3. Click **`⚡ RUN GEMINI VIRAL & SPEAKER ANALYSIS`** to automatically generate viral hooks, timed captions, and camera tracking keyframes.

---

## 7. Exporting, Saving Locally & Removing Clips

### Exporting 9:16 Vertical Shorts
- Click **`EXPORT MP4`** in the top-right corner.
  - If `CLIPS COUNT` is `1`, it renders your active timeline edit (`1080×1920 @ 60fps`).
  - If `CLIPS COUNT` is `2–10`, it batch-renders multiple distinct Shorts and adds them all to the **`GENERATED CLIPS / DOWNLOADS`** gallery at the bottom-left.

### Saving Clips to Your Computer
In the **`GENERATED CLIPS / DOWNLOADS`** gallery:
- **`⬇ MP4`:** Downloads the MP4 through your browser.
- **`💾 SAVE LOCALLY`:** Copies the MP4 directly into `d:\Projects\clin_anti\saved_shorts` (or any custom folder path configured in **`🚀 POSTIZ`** settings).
- **`📂 OPEN`:** Opens your `saved_shorts` folder directly in Windows File Explorer.

### Removing Videos & Clips
- **Remove a single Media Bin video:** Hover over its card in the Media Bin and click the pink **`✕`** button in the top-right corner.
- **Remove all Media Bin videos:** Click **`🗑 CLEAR`** in the Media Bin header.
- **Remove a generated clip:** Click the **`✕`** button on any clip card in `GENERATED CLIPS / DOWNLOADS`, or click **`🗑 CLEAR ALL`** to delete all generated exports.

---

## 8. Postiz Social Delivery (`MANUAL` or `AUTO`)

1. Click **`🚀 POSTIZ: MANUAL`** in the top toolbar.
2. Choose **Manual** (click `🚀 POSTIZ` per clip) or **Automatic** (auto-publish every rendered Short immediately after FFmpeg finishes).
3. Enter your Postiz API Base URL, API Key, target platforms (`TikTok`, `YouTube Shorts`, `Instagram Reels`, `X`), and default hashtags, then click **`SAVE POSTIZ & LOCAL EXPORT CONFIG`**.
