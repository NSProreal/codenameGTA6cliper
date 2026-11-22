# CLIP STUDIO / VI — AI Viral Shorts & Stream Clipping Studio

<img src="https://i.ibb.co/C3mSffMN/fullpage-snapshot-127-0-0-1-2026-11-22-18-52-54.png" alt="Image patch" loading="lazy" />

**CLIP STUDIO / VI** is a full-stack AI-powered video clipping and 9:16 vertical short-form editing web application built for long-form gaming streams, Twitch/YouTube VODs, and local OBS recordings.

It combines **Free Google Gemini API (`gemini-2.5-flash`)** multimodal viral moment detection, **OpenCV 5.x** smart speaker/subject tracking, **`yt-dlp` + FFmpeg HTTP range partial stream extraction** (clipping 24-hour multi-GB stream VODs in seconds without downloading the entire file), **`pysubs2` / `libass`** kinetic subtitles, and **Postiz** social publishing.

---

## ✨ Core Features

- **Zero-Wait Stream VOD Partial Extractor (`yt-dlp` + FFmpeg HTTP Range Seeking)**
  - Extracts 15–60 second 720p60 windows directly from multi-hour (even 24-hour / 40+ GB) YouTube and Twitch VODs in ~15 seconds.
  - Automatically probes the **YouTube "Most Replayed" heatmap** to locate top viral peaks when no timestamp is specified.
  - Supports instant keyframe-seek slicing for huge local `.mp4`, `.mkv`, `.mov`, and `.webm` files.
- **Extract More Clips From the Same Video (`+ MORE (SAME VIDEO)` & `+ CLIP HERE`)**
  - Remembers the origin stream URL and every previously clipped timestamp (`vod_start_sec`) in `static/media/sources_registry.json`.
  - Clicking **`+ MORE (SAME VIDEO)`** or the **`+`** icon on any Media Bin card automatically skips existing windows and grabs the next non-overlapping viral moments (`GTA6 #2`, `GTA6 #3`, etc.).
  - Clicking **`+ CLIP HERE`** in the video transport bar slices a new clip starting at your current playhead position.
- **Batch Clip Generation (`CLIPS COUNT: 1–10`)**
  - Select `1` to `10` clips in the top toolbar to extract multiple distinct viral moments from a stream VOD or render a multi-clip batch into 9:16 vertical Shorts at once.
- **Three 9:16 Vertical Framing Modes (`1080×1920 @ 60fps`)**
  - **`9:16 CROP`:** Full edge-to-edge horizontal (`15.8%–84.2%`) and vertical (`0%–100%`) pan + zoom (`1.0x–2.5x`) with spline-interpolated keyframe tracking so far-left or far-right streamer facecams are never cut off.
  - **`SPLIT CAM`:** Stacked vertical gaming layout — top 40% zoomed onto your 2D facecam selection box (`X%` + `Y%` + `Zoom`), bottom 60% centered on the main gameplay action.
  - **`FIT 16:9`:** Full uncropped 16:9 widescreen frame centered inside a 9:16 vertical canvas over an ambient blurred background.
- **AI Viral Hook & Caption Engine**
  - **Free Google Gemini API (`gemini-2.5-flash`):** Uploads the source clip to Gemini to detect high-retention viral hooks, generate word-synced uppercase captions, and compute camera reframe paths.
  - **Local OpenCV + Audio RMS Fallback:** Works 100% offline without an API key using 10Hz audio RMS peak detection + OpenCV YCrCb skin-tone & Sobel motion saliency tracking.
- **Non-Linear Multi-Track Timeline (`SEQUENCE / SHORT_01`)**
  - Interactive filmstrip (`SOURCE`), draggable/editable caption blocks (`CAPTIONS`), motion keyframe nodes (`REFRAME`), and real-time audio RMS bars (`AUDIO`).
  - Optional toggleable crop frame guide (`CROP GUIDE: OFF / ON`) so exported and previewed videos stay completely clean of overlays.
- **Local Export & Postiz Delivery**
  - Hardware-accelerated H.264 MP4 (`1080×1920 @ 60fps`) rendering with burned-in `Anton` ASS subtitles.
  - One-click **Save Locally** (`💾 SAVE LOCALLY`) to `d:\Projects\clin_anti\saved_shorts` (or any custom folder) + **`📂 OPEN`** in Windows Explorer.
  - **Manual or Automatic Postiz Delivery (`🚀 POSTIZ: MANUAL / AUTO`)** for publishing directly to TikTok, YouTube Shorts, Instagram Reels, and X.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend API** | Python 3.10+, FastAPI, Uvicorn |
| **AI & Computer Vision** | `google-genai` (`gemini-2.5-flash`), OpenCV (`opencv-python-headless`), NumPy |
| **Stream & Video Engine** | `yt-dlp`, FFmpeg (`libx264`, `libass`), `pysubs2` (SubStation Alpha `.ass` subtitles) |
| **Frontend UI** | Vanilla ES6 JavaScript, HTML5 Canvas 2D (`1080×1920` live preview), CSS3 Studio Grid |

---

## 📂 Project Structure

```text
d:\Projects\clin_anti\
├── app.py                      # FastAPI server, FFmpeg render engine, yt-dlp range slicer, Gemini & OpenCV pipeline
├── requirements.txt            # Python dependencies
├── run.bat                     # One-click Windows launcher script
├── README.md                   # Project overview & architecture documentation
├── HOW_TO_USE.md               # Step-by-step user guide & troubleshooting
├── saved_shorts/               # Default local folder where saved 9:16 Shorts are copied
├── uploads/                    # Temporary uploaded files & generated .ass subtitle scripts
└── static/
    ├── index.html              # Studio workspace UI layout & modals
    ├── styles.css              # Dark neon theme & responsive studio grid styles
    ├── app.js                  # Timeline controller, 9:16 canvas renderer, & API client
    ├── exports/                # Rendered 1080x1920 @ 60fps MP4 clips
    └── media/                  # Extracted source clips, thumbnails, filmstrips & sources_registry.json
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Python 3.10+** installed and added to `PATH`
- **FFmpeg** (full build with `libx264` and `libass`) installed and available in `PATH`

### 2. Install Dependencies
```powershell
cd d:\Projects\clin_anti
pip install -r requirements.txt
```

### 3. Run the Application
Double-click **`run.bat`** or run:
```powershell
python app.py
```
Then open **[http://127.0.0.1:8000](http://127.0.0.1:8000)** in your browser.

---

## 🔌 REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/project` | Load current project state, Media Bin sources, captions, keyframes, and clips |
| `POST` | `/api/download-url` | Extract `1–10` partial 15–60s viral windows from a YouTube/Twitch URL via `yt-dlp` + FFmpeg |
| `POST` | `/api/more-clips-same-video` | Extract additional non-overlapping viral clips from an already-loaded Media Bin video |
| `POST` | `/api/upload` | Extract a 15–60s window from a local video file with instant keyframe seeking |
| `POST` | `/api/analyze-gemini` | Run Free Google Gemini API (`gemini-2.5-flash`) or local OpenCV viral hook analysis |
| `POST` | `/api/auto-reframe` | Re-run OpenCV smart speaker/facecam tracking on the active video |
| `POST` | `/api/export` | Render a single 9:16 vertical Short (`1080×1920 @ 60fps`) via FFmpeg |
| `POST` | `/api/export-batch` | Batch-render `1–10` distinct 9:16 vertical Shorts at once |
| `POST` | `/api/save-local` | Copy an exported Short to `saved_shorts/` or a custom local folder |
| `POST` | `/api/open-saved-folder` | Open the local `saved_shorts/` directory in Windows File Explorer |
| `POST` | `/api/postiz/deliver` | Deliver an exported Short to Postiz social channels |
| `DELETE` | `/api/sources/{source_id}` | Remove a single source video from the Media Bin (`DELETE /api/sources` clears all) |
| `DELETE` | `/api/clips/{filename}` | Delete a generated clip (`DELETE /api/clips` clears all) |
