// CLIP STUDIO / VI — Frontend Interactive NLE, Gemini AI, Smart Speaker Crop & Postiz Engine

const TOOLKIT_REPOS = [
  { num: "01", name: "yt-dlp", url: "https://github.com/yt-dlp/yt-dlp", role: "Download source videos (Partial VOD range)" },
  { num: "02", name: "OpenCut", url: "https://github.com/OpenCut-app/OpenCut", role: "Edit clips on a timeline" },
  { num: "03", name: "OpenCV", url: "https://github.com/opencv/opencv", role: "Build tracking & Smart Speaker cropping" },
  { num: "04", name: "OBS Studio", url: "https://github.com/obsproject/obs-studio", role: "Record gameplay and reactions" },
  { num: "05", name: "AI Shorts", url: "https://github.com/Anil-matcha/AI-Shorts-Generator", role: "Find highlights and crop vertical clips" },
  { num: "06", name: "Mediabunny", url: "https://github.com/Vanilagy/mediabunny", role: "Convert and export media in browser" },
  { num: "07", name: "Whisper", url: "https://github.com/openai/whisper", role: "Turn dialogue into transcripts" },
  { num: "08", name: "whisper.cpp", url: "https://github.com/ggml-org/whisper.cpp", role: "Run transcription locally" },
  { num: "09", name: "stable-ts", url: "https://github.com/jianfch/stable-ts", role: "Refine timestamps at word level" },
  { num: "10", name: "pyannote.audio", url: "https://github.com/pyannote/pyannote-audio", role: "Identify who speaks when (Speaker Crop)" },
  { num: "11", name: "Supervision", url: "https://github.com/roboflow/supervision", role: "Build tracking and detection overlays" },
  { num: "12", name: "Norfair", url: "https://github.com/tryolabs/norfair", role: "Track subjects across frames" },
  { num: "13", name: "DeepFilterNet", url: "https://github.com/Rikorose/DeepFilterNet", role: "Clean up noisy microphone audio" },
  { num: "14", name: "Demucs", url: "https://github.com/facebookresearch/demucs", role: "Separate vocals and music stems" },
  { num: "15", name: "pysubs2", url: "https://github.com/tkarabela/pysubs2", role: "Batch-edit subtitle timing and styles" },
  { num: "16", name: "libass", url: "https://github.com/libass/libass", role: "Render styled ASS subtitles" },
  { num: "17", name: "Editly", url: "https://github.com/mifi/editly", role: "Assemble clips with code" },
  { num: "18", name: "Kdenlive", url: "https://github.com/KDE/kdenlive", role: "Cut and add keyframes" },
  { num: "19", name: "Shotcut", url: "https://github.com/mltframework/shotcut", role: "Mix tracks and apply video filters" },
  { num: "20", name: "Real-ESRGAN", url: "https://github.com/xinntao/Real-ESRGAN", role: "Restore and upscale video frames" },
  { num: "21", name: "RIFE", url: "https://github.com/hzwer/ECCV2022-RIFE", role: "Interpolate intermediate frames" },
  { num: "22", name: "PyAV", url: "https://github.com/PyAV-Org/PyAV", role: "Decode and process video in Python" }
];

const state = {
  duration: 20.0, // 15..60 sec target Short duration
  sourceFileDuration: 20.0,
  numClips: 1, // 1..10 clips to extract/generate
  currentTime: 8.5,
  activeSourceUrl: "/static/media/gta6_demo_source.mp4",
  activeSourceId: "src_speed",
  autoReframe: true,
  smartSpeakerCrop: true,
  layoutMode: "crop_9_16", // "crop_9_16" | "split_gamer" | "fit_blur"
  cropXPercent: 43.1,
  cropYPercent: 52.0,
  cropZoom: 1.0,
  fontSize: 44,
  rgbBoost: 6.0,
  sources: [],
  captions: [],
  keyframes: [],
  waveform: [],
  clips: [],
  activeCaptionId: "cap_2",
  isDraggingCrop: false,
  isDraggingFacecam: false,
  isScrubbingTimeline: false,
  isExporting: false,
  cursorsEnabled: true,
  lastLogId: 0,
  postiz: {
    mode: "manual", // "manual" | "auto"
    api_url: "https://api.postiz.com/public/v1",
    api_key: "",
    channels: ["tiktok", "youtube_shorts", "instagram_reels"],
    caption_template: "GTA VI moment that broke the stream 🔥 #GTA6 #GTAVI #Shorts #Gaming",
    schedule_type: "now"
  }
};

// DOM Elements
const video = document.getElementById("sourceVideo");
const programViewport = document.getElementById("programViewport");
const cropOverlayBox = document.getElementById("cropOverlayBox");
const cropTopTag = document.getElementById("cropTopTag");
const cropBottomTag = document.getElementById("cropBottomTag");
const liveStageCaption = document.getElementById("liveStageCaption");
const inspectorCaptionInput = document.getElementById("inspectorCaptionInput");
const fontSizeSlider = document.getElementById("fontSizeSlider");
const fontSizeVal = document.getElementById("fontSizeVal");
const cropXSlider = document.getElementById("cropXSlider");
const cropXPercentText = document.getElementById("cropXPercentText");
const rgbBoostSlider = document.getElementById("rgbBoostSlider");
const rgbBoostVal = document.getElementById("rgbBoostVal");
const addKeyframeBtn = document.getElementById("addKeyframeBtn");
const previewCanvas = document.getElementById("verticalPreviewCanvas");
const previewCtx = previewCanvas.getContext("2d");
const phoneCaptionText = document.getElementById("phoneCaptionText");
const phaseCode = document.getElementById("phaseCode");
const phaseDesc = document.getElementById("phaseDesc");
const phaseTimecode = document.getElementById("phaseTimecode");
const mainTimecode = document.getElementById("mainTimecode");
const currentSourceLabel = document.getElementById("currentSourceLabel");
const currentViralityBadge = document.getElementById("currentViralityBadge");
const speakerLockBadge = document.getElementById("speakerLockBadge");
const activeToolsLine = document.getElementById("activeToolsLine");
const programProgressFill = document.getElementById("programProgressFill");
const programProgressTrack = document.getElementById("programProgressTrack");
const timelinePlayhead = document.getElementById("timelinePlayhead");
const mediaBinGrid = document.getElementById("mediaBinGrid");
const captionsLane = document.getElementById("captionsLane");
const reframeTimelineSvg = document.getElementById("reframeTimelineSvg");
const waveformBars = document.getElementById("waveformBars");
const cutDividers = document.getElementById("cutDividers");
const filmstripBg = document.getElementById("filmstripBg");
const toolkitGrid = document.getElementById("toolkitGrid");
const playPauseBtn = document.getElementById("playPauseBtn");
const pauseIcon = document.getElementById("pauseIcon");
const playIcon = document.getElementById("playIcon");
const engineStatusPill = document.getElementById("engineStatusPill");
const logsTerminal = document.getElementById("logsTerminal");
const clipsGalleryList = document.getElementById("clipsGalleryList");

// ---------- INITIALIZATION ----------

async function initStudio() {
  setupInteractions();
  loadSavedSettings();

  try {
    const res = await fetch("/api/project-init");
    const data = await res.json();
    state.duration = data.duration || 20.0;
    state.sourceFileDuration = data.source_total_duration || 20.0;
    state.sources = data.sources || [];
    state.captions = data.captions || [];
    state.keyframes = data.keyframes || [];
    state.waveform = data.waveform || [];
    state.clips = data.clips || [];
    if (data.default_local_save_dir) {
      const folderInput = document.getElementById("localSaveDirInput");
      if (folderInput) folderInput.value = data.default_local_save_dir;
    }
    state.activeSourceUrl = data.active_source || "/static/media/gta6_demo_source.mp4";
    if (state.sources.length > 0) {
      state.activeSourceId = state.sources[0].id;
      state.activeSourceUrl = state.sources[0].video_url;
      video.src = state.activeSourceUrl;
      if (state.sources[0].filmstrip) {
        filmstripBg.style.backgroundImage = `url('${state.sources[0].filmstrip}')`;
      }
    }
  } catch (err) {
    console.error("Failed to fetch project init:", err);
  }

  renderMediaBin();
  renderRulerTicks();
  renderTimelineCaptions();
  renderTimelineReframeCurve();
  renderWaveform();
  renderClipsGallery();
  renderToolkitGrid();

  video.addEventListener("loadedmetadata", () => {
    if (video.duration && !isNaN(video.duration)) {
      state.sourceFileDuration = video.duration;
    }
    video.currentTime = 8.5;
    syncUIAtTime(8.5);
  });

  video.addEventListener("play", () => {
    pauseIcon.classList.remove("hidden");
    playIcon.classList.add("hidden");
  });

  video.addEventListener("pause", () => {
    pauseIcon.classList.add("hidden");
    playIcon.classList.remove("hidden");
  });

  // Start Live Logs polling
  pollPipelineLogs();
  setInterval(pollPipelineLogs, 1200);

  requestAnimationFrame(renderLoop);
}

function loadSavedSettings() {
  const savedKey = localStorage.getItem("gta6_gemini_api_key");
  if (savedKey) {
    document.getElementById("geminiApiKeyInput").value = savedKey;
  }
  const savedPostiz = localStorage.getItem("gta6_postiz_config");
  if (savedPostiz) {
    try {
      const parsed = JSON.parse(savedPostiz);
      Object.assign(state.postiz, parsed);
      document.getElementById("postizModeSelect").value = state.postiz.mode;
      document.getElementById("postizScheduleSelect").value = state.postiz.schedule_type;
      document.getElementById("postizApiUrlInput").value = state.postiz.api_url;
      document.getElementById("postizApiKeyInput").value = state.postiz.api_key || "";
      document.getElementById("postizCaptionInput").value = state.postiz.caption_template;
      updatePostizHeaderBadge();
    } catch (_) {}
  }
}

function updatePostizHeaderBadge() {
  const badge = document.getElementById("postizModeBadge");
  const btn = document.getElementById("openPostizModalBtn");
  badge.textContent = state.postiz.mode.toUpperCase();
  btn.classList.toggle("auto-active", state.postiz.mode === "auto");
}

// ---------- 15-60 SECOND SHORTS DURATION SCALING ----------

function setShortsTargetDuration(newDur) {
  const clamped = Math.max(15, Math.min(60, Math.round(newDur)));
  const oldDur = state.duration || 20.0;
  const ratio = clamped / oldDur;

  state.duration = clamped;

  // Proportionally scale caption segments & keyframes across the new 15-60s duration
  state.captions.forEach((c) => {
    c.start = parseFloat((c.start * ratio).toFixed(2));
    c.end = parseFloat((c.end * ratio).toFixed(2));
  });
  if (state.captions.length) {
    state.captions[state.captions.length - 1].end = clamped;
  }

  state.keyframes.forEach((k) => {
    k.time = parseFloat((k.time * ratio).toFixed(2));
  });

  // Update UI badges & controls
  document.getElementById("shortsDurationSlider").value = clamped;
  document.getElementById("shortsDurationReadout").textContent = `${clamped}s`;
  document.getElementById("timelineDurationLabel").textContent = `${clamped.toFixed(2)} SEC`;
  document.getElementById("shortDurPill").textContent = `${clamped}S`;
  document.getElementById("geminiTargetDurInput").value = clamped;
  document.getElementById("importWindowDurInput").value = clamped;

  document.querySelectorAll(".dur-preset-btn").forEach((btn) => {
    btn.classList.toggle("active", parseInt(btn.dataset.dur, 10) === clamped);
  });

  renderRulerTicks();
  renderTimelineCaptions();
  renderTimelineReframeCurve();
  syncUIAtTime(Math.min(state.currentTime, clamped));
}

function renderRulerTicks() {
  const ruler = document.getElementById("rulerTicks");
  const d = state.duration;
  const ticks = [0, d * 0.25, d * 0.5, d * 0.75, d];
  const pcts = [0, 25, 50, 75, 98.5];
  ruler.innerHTML = ticks
    .map((val, i) => `<span style="left: ${pcts[i]}%">${String(Math.round(val)).padStart(2, "0")}</span>`)
    .join("");
}

// ---------- LIVE PROCESSING LOGS ----------

let importProgressTimerId = null;
let importProgressStartMs = 0;

function renderModalProgressState(prog) {
  const panel = document.getElementById("importProgressPanel");
  if (!panel || !prog) return;
  const stageEl = document.getElementById("importProgressStage");
  const clipBadgeEl = document.getElementById("importProgressClipBadge");
  const timerEl = document.getElementById("importProgressTimer");
  const pctEl = document.getElementById("importProgressPct");
  const fillEl = document.getElementById("importProgressBarFill");
  const statusEl = document.getElementById("importModalStatus");
  const spinnerEl = document.getElementById("importProgressSpinner");

  const pct = Math.max(0, Math.min(100, prog.percent || 0));
  if (stageEl) stageEl.textContent = prog.stage || "PROCESSING";
  if (clipBadgeEl) clipBadgeEl.textContent = `CLIP ${prog.current_clip || 0} / ${prog.total_clips || 1}`;
  if (timerEl) {
    const elapsed = importProgressStartMs
      ? ((Date.now() - importProgressStartMs) / 1000).toFixed(1)
      : (prog.elapsed_sec || 0).toFixed(1);
    timerEl.textContent = `${elapsed}s`;
  }
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (fillEl) fillEl.style.width = `${pct}%`;
  if (statusEl && prog.detail) statusEl.textContent = prog.detail;
  if (spinnerEl) {
    spinnerEl.classList.toggle("done", !prog.active && pct >= 100);
  }
}

function startImportProgressMonitor(totalClips, initialStage, initialDetail, btnEl = null) {
  const panel = document.getElementById("importProgressPanel");
  const feedEl = document.getElementById("importModalLogFeed");
  if (panel) panel.classList.remove("hidden");
  if (feedEl) feedEl.innerHTML = "";
  importProgressStartMs = Date.now();

  renderModalProgressState({
    active: true,
    percent: 5,
    current_clip: 0,
    total_clips: totalClips,
    stage: initialStage,
    detail: initialDetail,
  });

  if (importProgressTimerId) clearInterval(importProgressTimerId);
  importProgressTimerId = setInterval(async () => {
    await pollPipelineLogs();
    if (btnEl && btnEl.disabled) {
      const pctText = document.getElementById("importProgressPct")?.textContent || "";
      const stageText = document.getElementById("importProgressStage")?.textContent || "EXTRACTING";
      if (btnEl.classList.contains("media-more-btn")) {
        btnEl.textContent = pctText || "…";
      } else {
        btnEl.textContent = `${stageText} (${pctText})...`;
      }
    }
  }, 400);
}

function stopImportProgressMonitor(finalPct, finalStage, finalDetail, isError = false) {
  if (importProgressTimerId) {
    clearInterval(importProgressTimerId);
    importProgressTimerId = null;
  }
  const totalClips = parseInt(document.getElementById("importNumClipsInput")?.value, 10) || state.numClips || 1;
  renderModalProgressState({
    active: false,
    percent: finalPct,
    current_clip: isError ? 0 : totalClips,
    total_clips: totalClips,
    stage: finalStage,
    detail: finalDetail,
  });
  importProgressStartMs = 0;
}

async function pollPipelineLogs() {
  try {
    const res = await fetch(`/api/logs?since_id=${state.lastLogId}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data.progress && (data.progress.active || importProgressTimerId)) {
      renderModalProgressState(data.progress);
    }
    if (data.logs && data.logs.length > 0) {
      const modalFeed = document.getElementById("importModalLogFeed");
      data.logs.forEach((entry) => {
        const row = document.createElement("div");
        row.className = `log-row ${entry.level || "info"}`;
        row.innerHTML = `
          <span class="log-ts">${entry.ts}</span>
          <span class="log-tool">${entry.tool}</span>
          <span class="log-msg">${entry.message}</span>
        `;
        logsTerminal.appendChild(row);

        if (modalFeed) {
          const mLine = document.createElement("div");
          mLine.className = "import-log-line";
          mLine.innerHTML = `
            <span class="import-log-ts">${entry.ts}</span>
            <span class="import-log-tool">[${entry.tool}]</span>
            <span class="import-log-msg ${entry.level || "info"}">${entry.message}</span>
          `;
          modalFeed.appendChild(mLine);
          modalFeed.scrollTop = modalFeed.scrollHeight;
        }
      });
      state.lastLogId = data.latest_id;
      logsTerminal.scrollTop = logsTerminal.scrollHeight;
      document.getElementById("logsCountLabel").textContent = `${logsTerminal.children.length} EVENTS`;
    }
  } catch (_) {}
}

// ---------- GENERATED CLIPS GALLERY & POSTIZ MANUAL PUBLISH ----------

function renderClipsGallery() {
  clipsGalleryList.innerHTML = "";
  if (!state.clips || state.clips.length === 0) {
    clipsGalleryList.innerHTML = `<div class="log-msg" style="padding:12px;color:#9388a8;font-family:var(--font-mono);font-size:11px;">No clips exported yet. Click "EXPORT / H.264" to generate your first 9:16 vertical short.</div>`;
    return;
  }

  state.clips.forEach((clip) => {
    const card = document.createElement("div");
    card.className = "clip-item-card";
    const durLabel = `${Math.round(clip.duration || 20)}S`;
    const speakerLabel = clip.smart_speaker_crop ? "SPEAKER CROP" : "CENTER CROP";
    const localNote = clip.local_path ? ` · 💾 SAVED LOCALLY` : "";
    card.innerHTML = `
      <div class="clip-item-left">
        <div class="clip-item-title-row">
          <span class="clip-name">${clip.filename}</span>
          <span class="clip-badge-dur">${durLabel}</span>
          <span class="clip-badge-postiz" id="pstatus_${clip.id}">${clip.postiz_status || "READY"}</span>
        </div>
        <div class="clip-meta-sub" title="${clip.local_path || ""}">
          ${clip.resolution || "1080x1920"} · ${clip.size_mb || 0} MB · ${speakerLabel}${localNote}
        </div>
      </div>
      <div class="clip-item-actions">
        <button class="clip-act-btn dl save-local-item-btn" data-filename="${clip.filename}" title="Save MP4 to your local folder on disk & download">💾 SAVE LOCAL</button>
        <a href="${clip.download_url}" download="${clip.filename}" class="clip-act-btn" title="Browser Download MP4">↓ MP4</a>
        <a href="${clip.download_url}" target="_blank" class="clip-act-btn" title="Preview in new tab">▶</a>
        <button class="clip-act-btn postiz" data-filename="${clip.filename}" title="Deliver this clip to Postiz now">🚀 POSTIZ</button>
        <button class="clip-act-btn del delete-clip-btn" data-filename="${clip.filename}" title="Remove this generated clip">🗑</button>
      </div>
    `;

    const saveLocalBtn = card.querySelector(".save-local-item-btn");
    saveLocalBtn.addEventListener("click", () => saveExistingClipLocally(clip.filename, clip.download_url, saveLocalBtn));

    const postizBtn = card.querySelector(".clip-act-btn.postiz");
    postizBtn.addEventListener("click", () => deliverClipToPostizManual(clip.filename, postizBtn));

    const delClipBtn = card.querySelector(".delete-clip-btn");
    delClipBtn.addEventListener("click", () => deleteGeneratedClip(clip.filename));

    clipsGalleryList.appendChild(card);
  });
}

async function deleteGeneratedClip(filename) {
  try {
    const res = await fetch(`/api/clips/${encodeURIComponent(filename)}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok && data.clips) {
      state.clips = data.clips;
      renderClipsGallery();
      pollPipelineLogs();
    }
  } catch (_) {}
}

async function deleteSourceVideo(sourceId, e) {
  if (e) e.stopPropagation();
  try {
    const res = await fetch(`/api/sources/${encodeURIComponent(sourceId)}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok && data.sources) {
      state.sources = data.sources;
      if (state.sources.length > 0 && !state.sources.some((s) => s.id === state.activeSourceId)) {
        const nextSrc = state.sources[0];
        state.activeSourceId = nextSrc.id;
        state.activeSourceUrl = nextSrc.video_url;
        video.src = nextSrc.video_url;
      }
      renderMediaBin();
      pollPipelineLogs();
    }
  } catch (_) {}
}

async function saveExistingClipLocally(filename, downloadUrl, btnEl) {
  const folderInput = document.getElementById("localSaveDirInput");
  const targetFolder = folderInput ? folderInput.value.trim() : "";
  const origText = btnEl.textContent;
  btnEl.disabled = true;
  btnEl.textContent = "SAVING...";

  try {
    const res = await fetch("/api/save-local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clip_filename: filename,
        target_folder: targetFolder || null
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Local save failed");

    // Also trigger browser file download
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    btnEl.textContent = "✓ SAVED";
    if (data.clips) {
      state.clips = data.clips;
    }
    pollPipelineLogs();
    setTimeout(() => {
      renderClipsGallery();
    }, 1000);
  } catch (err) {
    btnEl.textContent = "ERR";
    setTimeout(() => {
      btnEl.textContent = origText;
      btnEl.disabled = false;
    }, 2000);
  }
}

async function openLocalSaveFolder() {
  const folderInput = document.getElementById("localSaveDirInput");
  const folderPath = folderInput ? folderInput.value.trim() : "";
  try {
    await fetch("/api/open-local-folder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folder_path: folderPath || null })
    });
    pollPipelineLogs();
  } catch (_) {}
}

async function deliverClipToPostizManual(filename, btnEl) {
  const origText = btnEl.textContent;
  btnEl.disabled = true;
  btnEl.textContent = "SENDING...";

  try {
    const res = await fetch("/api/postiz/deliver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clip_filename: filename,
        api_url: state.postiz.api_url,
        api_key: state.postiz.api_key || null,
        channels: state.postiz.channels,
        caption: state.postiz.caption_template,
        schedule_type: state.postiz.schedule_type
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Postiz delivery failed");

    state.clips = data.clips || state.clips;
    renderClipsGallery();
    pollPipelineLogs();
  } catch (err) {
    btnEl.textContent = "ERR";
    setTimeout(() => {
      btnEl.textContent = origText;
      btnEl.disabled = false;
    }, 2000);
  }
}

// ---------- MEDIA BIN, TIMELINE & TOOLKIT RENDERERS ----------

async function extractMoreFromSameVideo(sourceId = state.activeSourceId, startOffset = null, btnEl = null) {
  const targetBtn = btnEl || document.getElementById("moreClipsSameVideoBtn");
  const origText = targetBtn ? targetBtn.textContent : "";
  const numToExtract = state.numClips || 1;
  if (targetBtn) {
    targetBtn.disabled = true;
    targetBtn.textContent = origText === "+" ? "…" : `EXTRACTING 0/${numToExtract}...`;
  }
  startImportProgressMonitor(
    numToExtract,
    "PROBING NEXT VIRAL MOMENTS",
    `Extracting ${numToExtract} more non-overlapping clip(s) from same video...`,
    targetBtn
  );
  try {
    const res = await fetch("/api/more-clips-same-video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_id: sourceId || state.activeSourceId || null,
        num_clips: numToExtract,
        target_duration: state.duration || 30.0,
        start_offset: startOffset
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to extract more clips from this video");
    applyImportedSource(data, state.duration);
    await pollPipelineLogs();
    stopImportProgressMonitor(100, "EXTRACTION COMPLETE", `✓ Added ${data.num_clips_extracted || 1} more clip(s) into Media Bin!`);
  } catch (err) {
    console.error("More clips error:", err);
    stopImportProgressMonitor(0, "EXTRACTION ERROR", `Error: ${err.message}`, true);
  } finally {
    if (targetBtn) {
      targetBtn.disabled = false;
      targetBtn.textContent = origText;
    }
  }
}

function renderMediaBin() {
  mediaBinGrid.innerHTML = "";
  if (!state.sources || state.sources.length === 0) {
    mediaBinGrid.innerHTML = `<div style="grid-column:1/-1;color:#9388a8;font-family:var(--font-mono);font-size:10.5px;padding:8px 0;">No source videos in Media Bin. Click "+ VOD URL / FILE" to add a video.</div>`;
    return;
  }
  state.sources.forEach((src) => {
    const card = document.createElement("div");
    card.className = `media-card ${src.id === state.activeSourceId ? "active" : ""}`;
    card.innerHTML = `
      <button class="media-more-btn" title="Extract more clips from this same video">+</button>
      <button class="media-remove-btn" title="Remove this video from Media Bin">✕</button>
      <div class="media-thumb-wrap">
        <img src="${src.thumbnail}" alt="${src.tag}" />
      </div>
      <div class="media-card-tag">${src.tag}</div>
    `;
    const moreCardBtn = card.querySelector(".media-more-btn");
    moreCardBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      extractMoreFromSameVideo(src.id, null, moreCardBtn);
    });

    const removeBtn = card.querySelector(".media-remove-btn");
    removeBtn.addEventListener("click", (e) => deleteSourceVideo(src.id, e));

    card.addEventListener("click", () => {
      state.activeSourceId = src.id;
      if (src.video_url && state.activeSourceUrl !== src.video_url) {
        state.activeSourceUrl = src.video_url;
        video.src = src.video_url;
      }
      if (src.filmstrip) {
        filmstripBg.style.backgroundImage = `url('${src.filmstrip}')`;
      }
      video.currentTime = src.start_focus || 0;
      renderMediaBin();
      syncUIAtTime(video.currentTime);
    });
    mediaBinGrid.appendChild(card);
  });
}

function renderTimelineCaptions() {
  captionsLane.innerHTML = "";
  cutDividers.innerHTML = "";

  state.captions.forEach((cap, idx) => {
    const leftPct = Math.max(0, (cap.start / state.duration) * 100);
    const widthPct = Math.max(4, ((cap.end - cap.start) / state.duration) * 100);

    if (idx > 0) {
      const cutLine = document.createElement("div");
      cutLine.className = "cut-line";
      cutLine.style.left = `${leftPct}%`;
      cutDividers.appendChild(cutLine);
    }

    const block = document.createElement("div");
    block.className = `timeline-caption-block ${cap.id === state.activeCaptionId ? "active" : ""}`;
    block.style.left = `${leftPct}%`;
    block.style.width = `calc(${widthPct}% - 4px)`;
    block.dataset.id = cap.id;
    block.textContent = cap.text;

    if (cap.id === state.activeCaptionId) {
      const cursor = document.createElement("div");
      cursor.className = "agent-cursor";
      cursor.style.bottom = "-22px";
      cursor.style.left = "14px";
      cursor.innerHTML = `
        <svg class="cursor-arrow peach-fill" viewBox="0 0 24 24"><path d="M4 3l16 7-7 2-2 7z"/></svg>
        <span class="cursor-pill peach-bg">09 Captions</span>
      `;
      block.appendChild(cursor);
    }

    block.addEventListener("click", (e) => {
      e.stopPropagation();
      state.activeCaptionId = cap.id;
      const targetVideoTime = Math.min(state.sourceFileDuration - 0.1, cap.start + 0.25);
      video.currentTime = Math.max(0, targetVideoTime);
      syncUIAtTime(cap.start + 0.25);
    });

    captionsLane.appendChild(block);
  });
}

function renderTimelineReframeCurve() {
  if (!state.keyframes.length) return;
  const sorted = [...state.keyframes].sort((a, b) => a.time - b.time);

  let pathD = "";
  let nodesHtml = "";

  sorted.forEach((kf, idx) => {
    const x = Math.min(1000, Math.max(0, (kf.time / state.duration) * 1000));
    const effectiveX = state.smartSpeakerCrop ? kf.x_percent : 50.0;
    const y = 26 - ((effectiveX - 20) / 60) * 20;
    if (idx === 0) {
      pathD += `M ${x.toFixed(1)} ${y.toFixed(1)} `;
    } else {
      pathD += `L ${x.toFixed(1)} ${y.toFixed(1)} `;
    }
    const fillCol = kf.speaker_active && state.smartSpeakerCrop ? "#5CE6C4" : "#A88BEB";
    nodesHtml += `
      <polygon
        points="${x},${y - 4.5} ${x + 4.5},${y} ${x},${y + 4.5} ${x - 4.5},${y}"
        fill="${fillCol}"
        stroke="#110d17"
        stroke-width="1"
      />
    `;
  });

  reframeTimelineSvg.innerHTML = `
    <line x1="0" y1="16" x2="1000" y2="16" stroke="#231c30" stroke-width="1" />
    <path d="${pathD}" fill="none" stroke="#A88BEB" stroke-width="1.8" />
    ${nodesHtml}
  `;
}

function renderWaveform() {
  waveformBars.innerHTML = "";
  const bars = state.waveform.length ? state.waveform : Array.from({ length: 140 }, () => 0.5);
  bars.forEach((val, idx) => {
    const bar = document.createElement("div");
    bar.className = "wave-bar";
    bar.style.height = `${Math.round(val * 100)}%`;
    bar.dataset.idx = idx;
    waveformBars.appendChild(bar);
  });
}

function renderToolkitGrid(activePhaseIdx = 1) {
  if (!toolkitGrid) return;
  toolkitGrid.innerHTML = "";
  const highlightMap = {
    0: { "01": "active-pink", "04": "active-mint", "07": "active-mint", "14": "active-lavender" },
    1: { "03": "active-mint", "09": "active-pink", "10": "active-lavender", "13": "active-peach", "16": "active-peach", "17": "active-lavender", "19": "active-lime" },
    2: { "03": "active-mint", "10": "active-mint", "11": "active-mint", "12": "active-lavender", "15": "active-pink", "22": "active-peach" },
    3: { "06": "active-mint", "09": "active-pink", "16": "active-peach", "20": "active-peach", "21": "active-lavender" }
  };
  const currentHighlights = highlightMap[activePhaseIdx] || highlightMap[1];

  TOOLKIT_REPOS.forEach((item) => {
    const div = document.createElement("div");
    const activeClass = currentHighlights[item.num] || "";
    div.className = `toolkit-item ${activeClass}`;
    div.title = `${item.name} — ${item.role} (Click to view GitHub repo)`;
    div.innerHTML = `
      <span class="tool-num">${item.num}</span>
      <span class="tool-name">${item.name}</span>
    `;
    div.addEventListener("click", () => {
      window.open(item.url, "_blank", "noopener");
    });
    toolkitGrid.appendChild(div);
  });
}

// ---------- INTERPOLATION & REAL-TIME SYNC ----------

function getInterpolatedCropX(time) {
  if (!state.smartSpeakerCrop) return 50.0;
  if (!state.keyframes.length) return state.cropXPercent;
  const sorted = [...state.keyframes].sort((a, b) => a.time - b.time);
  if (time <= sorted[0].time) return sorted[0].x_percent;
  if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].x_percent;

  for (let i = 0; i < sorted.length - 1; i++) {
    const k0 = sorted[i];
    const k1 = sorted[i + 1];
    if (time >= k0.time && time <= k1.time) {
      const t = (time - k0.time) / Math.max(0.01, k1.time - k0.time);
      const smoothT = t * t * (3 - 2 * t);
      return k0.x_percent + (k1.x_percent - k0.x_percent) * smoothT;
    }
  }
  return state.cropXPercent;
}

function getNearestKeyframe(time) {
  if (!state.keyframes.length) return { index: 1, item: null };
  let bestIdx = 0;
  let bestDist = Infinity;
  state.keyframes.forEach((kf, i) => {
    const d = Math.abs(kf.time - time);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  });
  return { index: bestIdx + 1, item: state.keyframes[bestIdx] };
}

function formatMainTimecode(sec) {
  const whole = Math.floor(sec);
  const frames = Math.floor((sec - whole) * 60);
  return `00:${String(whole).padStart(2, "0")}:${String(frames).padStart(2, "0")}`;
}

function syncUIAtTime(t) {
  state.currentTime = Math.max(0, Math.min(state.duration, t));
  const pct = (state.currentTime / state.duration) * 100;

  programProgressFill.style.width = `${pct}%`;
  const laneWidth = captionsLane.clientWidth || 900;
  const pxOffset = (pct / 100) * laneWidth;
  timelinePlayhead.style.left = `${pxOffset}px`;

  phaseTimecode.textContent = `${state.currentTime.toFixed(2).padStart(5, "0")} / ${state.duration.toFixed(2)}`;
  mainTimecode.textContent = formatMainTimecode(state.currentTime);

  let activeCap = state.captions.find((c) => state.currentTime >= c.start && state.currentTime <= c.end);
  if (!activeCap && state.captions.length) {
    activeCap = state.captions[state.captions.length - 1];
  }

  if (activeCap) {
    const phaseIdx = state.captions.indexOf(activeCap);
    phaseCode.textContent = activeCap.phase_code || "02 / CUT";
    phaseDesc.textContent = activeCap.phase_desc || "SPLIT / Find the moment";
    currentSourceLabel.textContent = activeCap.source_label || "ISHOWSPEED / REACTION";
    activeToolsLine.textContent = activeCap.tools_label || "AI Shorts + OpenCut";
    currentViralityBadge.textContent = `VIRAL SCORE: ${activeCap.virality_score || 98}%`;

    const lbl = (activeCap.source_label || "").toUpperCase();
    let matchedSrcId = state.activeSourceId;
    if (lbl.includes("TRAILER")) matchedSrcId = "src_trailer";
    else if (lbl.includes("SPEED")) matchedSrcId = "src_speed";
    else if (lbl.includes("KAI")) matchedSrcId = "src_kai";
    if (matchedSrcId !== state.activeSourceId && state.sources.some((s) => s.id === matchedSrcId)) {
      state.activeSourceId = matchedSrcId;
      renderMediaBin();
    }

    if (document.activeElement !== liveStageCaption && document.activeElement !== inspectorCaptionInput) {
      liveStageCaption.textContent = activeCap.text;
      inspectorCaptionInput.value = activeCap.text;
    }
    phoneCaptionText.textContent = activeCap.text;

    if (state.activeCaptionId !== activeCap.id) {
      state.activeCaptionId = activeCap.id;
      renderTimelineCaptions();
      renderToolkitGrid(phaseIdx);
    }
  }

  if (state.autoReframe && !state.isDraggingCrop) {
    state.cropXPercent = getInterpolatedCropX(state.currentTime);
  }
  updateCropBoxPosition(state.cropXPercent);

  const waveChildren = waveformBars.children;
  const cutoff = Math.floor((pct / 100) * waveChildren.length);
  for (let i = 0; i < waveChildren.length; i++) {
    if (i <= cutoff) waveChildren[i].classList.add("played");
    else waveChildren[i].classList.remove("played");
  }

  const currentAmp = state.waveform[cutoff] || 0.7;
  const meterBars = document.querySelectorAll("#levelMeter .meter-bar");
  meterBars.forEach((bar, i) => {
    const jitter = Math.sin(state.currentTime * 15 + i * 1.7) * 18;
    const h = Math.max(20, Math.min(98, currentAmp * 85 + jitter));
    bar.style.height = `${h.toFixed(0)}%`;
  });
}

function setNumClipsToGenerate(count) {
  const clamped = Math.max(1, Math.min(10, parseInt(count, 10) || 1));
  state.numClips = clamped;

  const mainInput = document.getElementById("numClipsMainInput");
  if (mainInput) mainInput.value = clamped;
  const importInput = document.getElementById("importNumClipsInput");
  if (importInput) importInput.value = clamped;

  document.querySelectorAll(".clips-count-btn").forEach((btn) => {
    btn.classList.toggle("active", parseInt(btn.dataset.count, 10) === clamped);
  });

  const pill = document.getElementById("shortClipsCountPill");
  if (pill) pill.textContent = `${clamped} CLIP${clamped > 1 ? "S" : ""}`;

  const exportBtnText = document.getElementById("exportBtnText");
  if (exportBtnText && !state.isExporting) {
    exportBtnText.textContent = clamped > 1 ? `EXPORT ${clamped} CLIPS / H.264` : "EXPORT / H.264";
  }
}

function updateCropBoxPosition(xPercent, yPercent = state.cropYPercent) {
  // 15.8% to 84.2% allows the 31.64% wide 9:16 box to reach left: 0% (far-left edge) and left: 68.36% (far-right edge)
  const clampedX = Math.max(15.8, Math.min(84.2, xPercent));
  const clampedY = Math.max(20.0, Math.min(80.0, yPercent));
  state.cropXPercent = clampedX;
  state.cropYPercent = clampedY;

  const nearest = getNearestKeyframe(state.currentTime);
  const kfNum = String(nearest.index).padStart(2, "0");
  const isSpeaker = state.smartSpeakerCrop && nearest.item?.speaker_active;

  const facecamBox = document.getElementById("facecamOverlayBox");

  if (!state.cropGuideVisible) {
    cropOverlayBox.classList.add("hidden");
    if (facecamBox) facecamBox.classList.add("hidden");
  } else if (state.layoutMode === "fit_blur") {
    cropOverlayBox.classList.remove("hidden");
    cropOverlayBox.style.left = "1%";
    cropOverlayBox.style.width = "98%";
    cropOverlayBox.style.top = "2%";
    cropOverlayBox.style.height = "96%";
    if (facecamBox) facecamBox.classList.add("hidden");
    cropTopTag.textContent = "16:9 FULL FIT IN 9:16 BLUR";
  } else if (state.layoutMode === "split_gamer") {
    cropOverlayBox.classList.remove("hidden");
    if (facecamBox) {
      facecamBox.classList.remove("hidden");
      const fw = 26 / state.cropZoom;
      const fh = 32 / state.cropZoom;
      const fLeft = Math.max(0, Math.min(100 - fw, clampedX - fw / 2));
      const fTop = Math.max(0, Math.min(100 - fh, clampedY - fh / 2));
      facecamBox.style.width = `${fw.toFixed(1)}%`;
      facecamBox.style.height = `${fh.toFixed(1)}%`;
      facecamBox.style.left = `${fLeft.toFixed(1)}%`;
      facecamBox.style.top = `${fTop.toFixed(1)}%`;
    }
    cropOverlayBox.style.width = "31.64%";
    cropOverlayBox.style.left = "34.18%";
    cropOverlayBox.style.top = "2%";
    cropOverlayBox.style.height = "96%";
    cropTopTag.textContent = "GAMEPLAY (BOTTOM 62%)";
  } else {
    cropOverlayBox.classList.remove("hidden");
    if (facecamBox) facecamBox.classList.add("hidden");
    const boxWidthPct = 31.64 / state.cropZoom;
    const boxHeightPct = 96.0 / state.cropZoom;
    const leftPct = Math.max(0, Math.min(100 - boxWidthPct, clampedX - boxWidthPct / 2));
    const topPct = Math.max(2, Math.min(98 - boxHeightPct, clampedY - boxHeightPct / 2));
    cropOverlayBox.style.width = `${boxWidthPct.toFixed(2)}%`;
    cropOverlayBox.style.height = `${boxHeightPct.toFixed(2)}%`;
    cropOverlayBox.style.left = `${leftPct.toFixed(2)}%`;
    cropOverlayBox.style.top = `${topPct.toFixed(2)}%`;
    cropTopTag.textContent = isSpeaker ? `9:16 / SPEAKER ${kfNum}` : `9:16 / CROP ${kfNum}`;
  }

  cropBottomTag.textContent = `X ${clampedX.toFixed(1)}%`;
  cropXPercentText.textContent = `${clampedX.toFixed(1)}%`;
  cropXSlider.value = clampedX.toFixed(1);
  const ySlider = document.getElementById("cropYSlider");
  if (ySlider) ySlider.value = Math.round(clampedY);
  const zoomText = document.getElementById("cropZoomText");
  if (zoomText) zoomText.textContent = `${state.cropZoom.toFixed(2)}x`;
  addKeyframeBtn.textContent = `+ KEYFRAME ${kfNum}`;

  if (!state.smartSpeakerCrop) {
    speakerLockBadge.textContent = "🎙 SPEAKER CROP: OFF (CENTER)";
  } else {
    speakerLockBadge.textContent = isSpeaker ? "🎙 SPEAKER LOCK: ACTIVE" : "🎙 SPEAKER SCAN: TRACKING";
  }

  const nodeX = 15 + ((state.currentTime / state.duration) * 150);
  const nodeY = 60 - ((clampedX - 15.8) / 68.4) * 48;
  const activeNode = document.getElementById("activeSplineNode");
  const activeRing = document.getElementById("activeSplineRing");
  if (activeNode && activeRing) {
    activeNode.setAttribute("cx", nodeX.toFixed(1));
    activeNode.setAttribute("cy", nodeY.toFixed(1));
    activeRing.setAttribute("cx", nodeX.toFixed(1));
    activeRing.setAttribute("cy", nodeY.toFixed(1));
  }
}

// ---------- LIVE 9:16 VERTICAL CANVAS RENDERER ----------

function renderLoop() {
  if (!video.paused && !video.ended && !state.isScrubbingTimeline) {
    const mappedTime = (video.currentTime / Math.max(1, state.sourceFileDuration)) * state.duration;
    syncUIAtTime(mappedTime);
  }
  drawVerticalPreview();
  requestAnimationFrame(renderLoop);
}

function drawVerticalPreview() {
  if (video.readyState < 2) return;

  const vw = video.videoWidth || 566;
  const vh = video.videoHeight || 318;
  const cw = previewCanvas.width;
  const ch = previewCanvas.height;

  const sat = 100 + state.rgbBoost * 4;
  const con = 100 + state.rgbBoost * 1.5;
  video.style.filter = `saturate(${sat}%) contrast(${con}%)`;

  previewCtx.clearRect(0, 0, cw, ch);

  if (state.layoutMode === "fit_blur") {
    // 1. Blurred vertical background fill
    previewCtx.filter = `blur(12px) brightness(72%) saturate(${sat}%)`;
    const bgCropW = vh * (9 / 16);
    const bgX = (vw - bgCropW) / 2;
    previewCtx.drawImage(video, bgX, 0, bgCropW, vh, -10, -10, cw + 20, ch + 20);

    // 2. Crisp uncropped 16:9 landscape frame fitted in center
    previewCtx.filter = `saturate(${sat}%) contrast(${con}%)`;
    const fitH = Math.round(cw * (9 / 16));
    const fitY = Math.round((ch - fitH) / 2);
    previewCtx.drawImage(video, 0, 0, vw, vh, 0, fitY, cw, fitH);
  } else if (state.layoutMode === "split_gamer") {
    previewCtx.filter = `saturate(${sat}%) contrast(${con}%)`;
    const topH = Math.floor(ch * 0.38);
    const botH = ch - topH;

    // Top 38%: Tight 2D Facecam crop centered on (cropXPercent, cropYPercent)
    const faceCropW = (vh * 0.52) / state.cropZoom;
    const faceCropH = (vh * 0.35) / state.cropZoom;
    const faceX = Math.max(0, Math.min(vw - faceCropW, (state.cropXPercent / 100) * vw - faceCropW / 2));
    const faceY = Math.max(0, Math.min(vh - faceCropH, (state.cropYPercent / 100) * vh - faceCropH / 2));
    previewCtx.drawImage(video, faceX, faceY, faceCropW, faceCropH, 0, 0, cw, topH);

    // Bottom 62%: Center Gameplay
    const gameCropW = vh * (9 / 16);
    const gameX = (vw - gameCropW) / 2;
    previewCtx.drawImage(video, gameX, 0, gameCropW, vh, 0, topH, cw, botH);
  } else {
    previewCtx.filter = `saturate(${sat}%) contrast(${con}%)`;
    const cropW = (vh * (9 / 16)) / state.cropZoom;
    const cropH = vh / state.cropZoom;
    const centerX = (state.cropXPercent / 100) * vw;
    const centerY = (state.cropYPercent / 100) * vh;
    const srcX = Math.max(0, Math.min(vw - cropW, centerX - cropW / 2));
    const srcY = Math.max(0, Math.min(vh - cropH, centerY - cropH / 2));
    previewCtx.drawImage(video, srcX, srcY, cropW, cropH, 0, 0, cw, ch);
  }
}

// ---------- USER INTERACTIONS ----------

function setupInteractions() {
  playPauseBtn.addEventListener("click", togglePlay);
  video.addEventListener("click", togglePlay);

  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.isContentEditable) return;
    if (e.code === "Space") {
      e.preventDefault();
      togglePlay();
    }
  });

  // Toggle Crop Frame Guide (OFF by default so no green frame covers video)
  const toggleCropGuideBtn = document.getElementById("toggleCropGuideBtn");
  if (toggleCropGuideBtn) {
    toggleCropGuideBtn.addEventListener("click", () => {
      state.cropGuideVisible = !state.cropGuideVisible;
      toggleCropGuideBtn.classList.toggle("active", state.cropGuideVisible);
      toggleCropGuideBtn.textContent = `CROP GUIDE: ${state.cropGuideVisible ? "ON" : "OFF"}`;
      updateCropBoxPosition(state.cropXPercent, state.cropYPercent);
    });
  }

  // Extract More Clips From Same Video (Media Bin Header button)
  const moreClipsSameVideoBtn = document.getElementById("moreClipsSameVideoBtn");
  if (moreClipsSameVideoBtn) {
    moreClipsSameVideoBtn.addEventListener("click", () => {
      extractMoreFromSameVideo(state.activeSourceId, null, moreClipsSameVideoBtn);
    });
  }

  // Sub-clip current video starting at the playhead timestamp
  const subclipAtPlayheadBtn = document.getElementById("subclipAtPlayheadBtn");
  if (subclipAtPlayheadBtn) {
    subclipAtPlayheadBtn.addEventListener("click", () => {
      extractMoreFromSameVideo(state.activeSourceId, video.currentTime || 0, subclipAtPlayheadBtn);
    });
  }

  // Clear All Source Videos in Media Bin
  const clearAllSourcesBtn = document.getElementById("clearAllSourcesBtn");
  if (clearAllSourcesBtn) {
    clearAllSourcesBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("/api/sources", { method: "DELETE" });
        if (res.ok) {
          state.sources = [];
          renderMediaBin();
          pollPipelineLogs();
        }
      } catch (_) {}
    });
  }

  // Clear All Generated Clips in Gallery
  const clearAllClipsBtn = document.getElementById("clearAllClipsBtn");
  if (clearAllClipsBtn) {
    clearAllClipsBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("/api/clips", { method: "DELETE" });
        if (res.ok) {
          state.clips = [];
          renderClipsGallery();
          pollPipelineLogs();
        }
      } catch (_) {}
    });
  }

  // Number of Clips to Generate (1-10)
  document.querySelectorAll(".clips-count-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setNumClipsToGenerate(parseInt(btn.dataset.count, 10));
    });
  });

  const numClipsMainInput = document.getElementById("numClipsMainInput");
  if (numClipsMainInput) {
    numClipsMainInput.addEventListener("input", (e) => {
      setNumClipsToGenerate(parseInt(e.target.value, 10) || 1);
    });
  }

  // 15-60 Second Shorts Preset Buttons & Slider
  document.querySelectorAll(".dur-preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setShortsTargetDuration(parseInt(btn.dataset.dur, 10));
    });
  });

  const durSlider = document.getElementById("shortsDurationSlider");
  durSlider.addEventListener("input", (e) => {
    setShortsTargetDuration(parseInt(e.target.value, 10));
  });

  // Smart Speaker Cropping Toggle
  const smartSpeakerBtn = document.getElementById("smartSpeakerToggleBtn");
  smartSpeakerBtn.addEventListener("click", () => {
    state.smartSpeakerCrop = !state.smartSpeakerCrop;
    smartSpeakerBtn.classList.toggle("active", state.smartSpeakerCrop);
    smartSpeakerBtn.textContent = `SPEAKER CROP: ${state.smartSpeakerCrop ? "ON" : "OFF"}`;
    document.getElementById("safeAreaLabel").textContent = state.smartSpeakerCrop
      ? "9:16 / SMART SPEAKER"
      : "9:16 / CENTER SAFE AREA";
    document.getElementById("outputSubspecs").textContent = state.smartSpeakerCrop
      ? "SPEAKER CROP + LIBASS CAPTIONS"
      : "CENTER CROP + LIBASS CAPTIONS";
    renderTimelineReframeCurve();
    syncUIAtTime(state.currentTime);
  });

  // Step Back / Next Viral Cut
  document.getElementById("stepBackBtn").addEventListener("click", () => {
    const cur = state.currentTime;
    const prev = [...state.captions].reverse().find((c) => c.start < cur - 0.5);
    const target = prev ? prev.start : 0;
    video.currentTime = (target / state.duration) * state.sourceFileDuration;
    syncUIAtTime(target);
  });

  document.getElementById("stepNextBtn").addEventListener("click", () => {
    const cur = state.currentTime;
    const next = state.captions.find((c) => c.start > cur + 0.2);
    const target = next ? next.start : 0;
    video.currentTime = (target / state.duration) * state.sourceFileDuration;
    syncUIAtTime(target);
  });

  const muteBtn = document.getElementById("muteBtn");
  muteBtn.addEventListener("click", () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? "🔇" : "🔊";
  });

  cropOverlayBox.addEventListener("mousedown", (e) => {
    e.preventDefault();
    state.isDraggingCrop = true;
  });

  const facecamBox = document.getElementById("facecamOverlayBox");
  if (facecamBox) {
    facecamBox.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      state.isDraggingFacecam = true;
    });
  }

  window.addEventListener("mousemove", (e) => {
    if (state.isDraggingCrop || state.isDraggingFacecam) {
      const rect = programViewport.getBoundingClientRect();
      const relX = ((e.clientX - rect.left) / rect.width) * 100;
      const relY = ((e.clientY - rect.top) / rect.height) * 100;
      state.autoReframe = false;
      document.getElementById("autoTrackToggleBtn").textContent = "AUTO-REFRAME: MANUAL";
      updateCropBoxPosition(relX, relY);
    }
    if (state.isScrubbingTimeline) {
      scrubTimelineToMouse(e);
    }
  });

  window.addEventListener("mouseup", () => {
    state.isDraggingCrop = false;
    state.isDraggingFacecam = false;
    state.isScrubbingTimeline = false;
  });

  const autoTrackBtn = document.getElementById("autoTrackToggleBtn");
  autoTrackBtn.addEventListener("click", () => {
    state.autoReframe = !state.autoReframe;
    autoTrackBtn.classList.toggle("active", state.autoReframe);
    autoTrackBtn.textContent = `AUTO-REFRAME: ${state.autoReframe ? "ON" : "MANUAL"}`;
  });

  const toggleCursorsBtn = document.getElementById("toggleCursorsBtn");
  toggleCursorsBtn.addEventListener("click", () => {
    state.cursorsEnabled = !state.cursorsEnabled;
    document.body.classList.toggle("cursors-off", !state.cursorsEnabled);
    toggleCursorsBtn.classList.toggle("active", state.cursorsEnabled);
    toggleCursorsBtn.textContent = `AGENT CURSORS: ${state.cursorsEnabled ? "ON" : "OFF"}`;
  });

  inspectorCaptionInput.addEventListener("input", (e) => {
    const val = e.target.value.toUpperCase();
    liveStageCaption.textContent = val;
    phoneCaptionText.textContent = val;
    updateActiveCaptionText(val);
  });

  liveStageCaption.addEventListener("input", () => {
    const val = liveStageCaption.textContent.toUpperCase();
    inspectorCaptionInput.value = val;
    phoneCaptionText.textContent = val;
    updateActiveCaptionText(val);
  });

  fontSizeSlider.addEventListener("input", (e) => {
    state.fontSize = parseInt(e.target.value, 10);
    fontSizeVal.textContent = `${state.fontSize} PX`;
    liveStageCaption.style.fontSize = `${Math.round(state.fontSize * 0.86)}px`;
  });

  cropXSlider.addEventListener("input", (e) => {
    state.autoReframe = false;
    document.getElementById("autoTrackToggleBtn").textContent = "AUTO-REFRAME: MANUAL";
    updateCropBoxPosition(parseFloat(e.target.value), state.cropYPercent);
  });

  const cropYSlider = document.getElementById("cropYSlider");
  if (cropYSlider) {
    cropYSlider.addEventListener("input", (e) => {
      state.autoReframe = false;
      document.getElementById("autoTrackToggleBtn").textContent = "AUTO-REFRAME: MANUAL";
      updateCropBoxPosition(state.cropXPercent, parseFloat(e.target.value));
    });
  }

  const cropZoomSlider = document.getElementById("cropZoomSlider");
  if (cropZoomSlider) {
    cropZoomSlider.addEventListener("input", (e) => {
      state.cropZoom = parseFloat(e.target.value);
      updateCropBoxPosition(state.cropXPercent, state.cropYPercent);
    });
  }

  addKeyframeBtn.addEventListener("click", () => {
    const t = parseFloat(state.currentTime.toFixed(2));
    const existing = state.keyframes.find((k) => Math.abs(k.time - t) < 0.6);
    if (existing) {
      existing.x_percent = parseFloat(state.cropXPercent.toFixed(1));
      existing.y_percent = parseFloat(state.cropYPercent.toFixed(1));
    } else {
      state.keyframes.push({
        id: `kf_${state.keyframes.length + 1}`,
        time: t,
        x_percent: parseFloat(state.cropXPercent.toFixed(1)),
        y_percent: parseFloat(state.cropYPercent.toFixed(1)),
        scale: state.cropZoom,
        label: `KEYFRAME ${state.keyframes.length + 1}`,
        speaker_active: state.smartSpeakerCrop
      });
    }
    state.autoReframe = true;
    document.getElementById("autoTrackToggleBtn").textContent = "AUTO-REFRAME: ON";
    renderTimelineReframeCurve();
  });

  rgbBoostSlider.addEventListener("input", (e) => {
    state.rgbBoost = parseFloat(e.target.value);
    rgbBoostVal.textContent = `+${state.rgbBoost.toFixed(1)}`;
  });

  const modeCropBtn = document.getElementById("modeCropBtn");
  const modeSplitBtn = document.getElementById("modeSplitBtn");
  const modeFitBlurBtn = document.getElementById("modeFitBlurBtn");

  function setLayoutMode(newMode) {
    state.layoutMode = newMode;
    modeCropBtn.classList.toggle("active", newMode === "crop_9_16");
    modeSplitBtn.classList.toggle("active", newMode === "split_gamer");
    if (modeFitBlurBtn) modeFitBlurBtn.classList.toggle("active", newMode === "fit_blur");
    updateCropBoxPosition(state.cropXPercent, state.cropYPercent);
  }

  modeCropBtn.addEventListener("click", () => setLayoutMode("crop_9_16"));
  modeSplitBtn.addEventListener("click", () => setLayoutMode("split_gamer"));
  if (modeFitBlurBtn) modeFitBlurBtn.addEventListener("click", () => setLayoutMode("fit_blur"));

  programProgressTrack.addEventListener("click", (e) => {
    const rect = programProgressTrack.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pct * state.sourceFileDuration;
    syncUIAtTime(pct * state.duration);
  });

  const tracksWrap = document.getElementById("timelineTracksWrap");
  tracksWrap.addEventListener("mousedown", (e) => {
    state.isScrubbingTimeline = true;
    scrubTimelineToMouse(e);
  });

  document.getElementById("exportH264Btn").addEventListener("click", () => runH264Export(false));
  const saveLocalMainBtn = document.getElementById("saveLocallyMainBtn");
  if (saveLocalMainBtn) {
    saveLocalMainBtn.addEventListener("click", () => runH264Export(true));
  }

  const openLocalFolderBtn = document.getElementById("openLocalFolderBtn");
  if (openLocalFolderBtn) {
    openLocalFolderBtn.addEventListener("click", openLocalSaveFolder);
  }
  const openSavedFolderGalleryBtn = document.getElementById("openSavedFolderGalleryBtn");
  if (openSavedFolderGalleryBtn) {
    openSavedFolderGalleryBtn.addEventListener("click", openLocalSaveFolder);
  }

  // Clear Live Logs
  document.getElementById("clearLogsBtn").addEventListener("click", async () => {
    await fetch("/api/logs/clear", { method: "POST" });
    logsTerminal.innerHTML = "";
    state.lastLogId = 0;
    pollPipelineLogs();
  });

  setupModals();
}

function togglePlay() {
  if (video.paused || video.ended) {
    video.play();
  } else {
    video.pause();
  }
}

function scrubTimelineToMouse(e) {
  const rect = captionsLane.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  video.currentTime = pct * state.sourceFileDuration;
  syncUIAtTime(pct * state.duration);
}

function updateActiveCaptionText(newText) {
  const cap = state.captions.find((c) => c.id === state.activeCaptionId);
  if (cap) {
    cap.text = newText;
    const block = captionsLane.querySelector(`[data-id="${cap.id}"]`);
    if (block) block.childNodes[0].nodeValue = newText;
  }
}

// ---------- EXPORT / H.264 + LOCAL DISK SAVE + AUTOMATIC POSTIZ DELIVERY ----------

async function runH264Export(triggerBrowserDownload = false) {
  if (state.isExporting) return;
  state.isExporting = true;

  const btn = document.getElementById("exportH264Btn");
  const saveBtn = document.getElementById("saveLocallyMainBtn");
  const btnText = document.getElementById("exportBtnText");
  const banner = document.getElementById("exportResultBanner");
  const folderInput = document.getElementById("localSaveDirInput");
  const localSaveDir = folderInput ? folderInput.value.trim() : "";

  btn.disabled = true;
  if (saveBtn) saveBtn.disabled = true;
  btnText.textContent = `RENDERING ${state.numClips} CLIP(S) × ${Math.round(state.duration)}S...`;
  banner.classList.add("hidden");

  try {
    const res = await fetch("/api/export-short", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_video: state.activeSourceUrl,
        source_videos: state.sources.map((s) => s.video_url),
        start_time: 0.0,
        end_time: state.duration,
        target_duration: state.duration,
        num_clips: state.numClips,
        font_size: state.fontSize,
        rgb_boost: state.rgbBoost,
        crop_zoom: state.cropZoom,
        crop_y_percent: state.cropYPercent,
        layout_mode: state.layoutMode,
        smart_speaker_crop: state.smartSpeakerCrop,
        auto_save_local: true,
        local_save_dir: localSaveDir || null,
        keyframes: state.keyframes,
        captions: state.captions,
        postiz: {
          enabled: state.postiz.mode === "auto",
          mode: state.postiz.mode,
          api_url: state.postiz.api_url,
          api_key: state.postiz.api_key || null,
          channels: state.postiz.channels,
          caption_template: state.postiz.caption_template,
          schedule_type: state.postiz.schedule_type
        }
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Export failed");

    const countGen = data.num_clips_generated || 1;
    btnText.textContent = triggerBrowserDownload
      ? `✓ SAVED ${countGen} CLIP(S) LOCALLY`
      : `✓ EXPORTED ${countGen} CLIP(S)`;
    banner.classList.remove("hidden");
    const postizNote = data.postiz_result ? ` · 🚀 ${data.postiz_result.postiz_status}` : "";
    const localSavedNote = data.local_path
      ? `<div style="margin-top:3px;color:#d8d0e8;font-size:9.5px;">💾 SAVED ${countGen} CLIP(S) TO: ${data.local_path}</div>`
      : "";
    banner.innerHTML = `
      RENDERED ${countGen} × ${data.resolution} @ ${data.fps}FPS (${data.duration}S · ${data.size_mb} MB)${postizNote}
      <a href="${data.download_url}" download="${data.filename}">↓ DOWNLOAD MP4</a>
      <a href="${data.download_url}" target="_blank">▶ PREVIEW</a>
      ${localSavedNote}
    `;

    if (triggerBrowserDownload && data.generated_batch) {
      data.generated_batch.forEach((item, idx) => {
        setTimeout(() => {
          const a = document.createElement("a");
          a.href = item.download_url;
          a.download = item.filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }, idx * 350);
      });
    } else if (triggerBrowserDownload && data.download_url) {
      const a = document.createElement("a");
      a.href = data.download_url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    if (data.clips) {
      state.clips = data.clips;
      renderClipsGallery();
    }
    pollPipelineLogs();
  } catch (err) {
    btnText.textContent = "EXPORT ERROR — RETRY";
    banner.classList.remove("hidden");
    banner.textContent = `Error: ${err.message}`;
  } finally {
    state.isExporting = false;
    btn.disabled = false;
    if (saveBtn) saveBtn.disabled = false;
    setTimeout(() => {
      btnText.textContent = state.numClips > 1 ? `EXPORT ${state.numClips} CLIPS / H.264` : "EXPORT / H.264";
    }, 3500);
  }
}
window.runH264Export = runH264Export;

// ---------- MODALS: GEMINI AI, YT-DLP / UPLOAD, POSTIZ DELIVERY ----------

function setupModals() {
  const geminiModal = document.getElementById("geminiModal");
  const importModal = document.getElementById("importModal");
  const postizModal = document.getElementById("postizModal");

  document.getElementById("openGeminiModalBtn").addEventListener("click", () => {
    document.getElementById("geminiTargetDurInput").value = Math.round(state.duration);
    document.getElementById("geminiSpeakerCropSelect").value = String(state.smartSpeakerCrop);
    geminiModal.classList.remove("hidden");
  });
  document.getElementById("closeGeminiModalBtn").addEventListener("click", () => geminiModal.classList.add("hidden"));
  document.getElementById("cancelGeminiModalBtn").addEventListener("click", () => geminiModal.classList.add("hidden"));

  document.getElementById("openImportModalBtn").addEventListener("click", () => {
    document.getElementById("importWindowDurInput").value = Math.round(state.duration);
    const impNum = document.getElementById("importNumClipsInput");
    if (impNum) impNum.value = state.numClips;
    importModal.classList.remove("hidden");
  });
  document.getElementById("quickAddMediaBtn").addEventListener("click", () => importModal.classList.remove("hidden"));
  document.getElementById("closeImportModalBtn").addEventListener("click", () => importModal.classList.add("hidden"));

  document.getElementById("openPostizModalBtn").addEventListener("click", () => postizModal.classList.remove("hidden"));
  document.getElementById("configPostizFromGalleryBtn").addEventListener("click", () => postizModal.classList.remove("hidden"));
  document.getElementById("closePostizModalBtn").addEventListener("click", () => postizModal.classList.add("hidden"));
  document.getElementById("cancelPostizModalBtn").addEventListener("click", () => postizModal.classList.add("hidden"));

  // Save Postiz Configuration
  document.getElementById("savePostizConfigBtn").addEventListener("click", () => {
    const checkedChannels = Array.from(document.querySelectorAll(".channel-checkbox-row input:checked")).map(
      (el) => el.value
    );
    state.postiz = {
      mode: document.getElementById("postizModeSelect").value,
      schedule_type: document.getElementById("postizScheduleSelect").value,
      api_url: document.getElementById("postizApiUrlInput").value.trim(),
      api_key: document.getElementById("postizApiKeyInput").value.trim(),
      channels: checkedChannels.length ? checkedChannels : ["tiktok"],
      caption_template: document.getElementById("postizCaptionInput").value.trim()
    };
    localStorage.setItem("gta6_postiz_config", JSON.stringify(state.postiz));
    updatePostizHeaderBadge();
    document.getElementById("postizModalStatus").textContent = `✓ Saved Postiz Delivery Mode: ${state.postiz.mode.toUpperCase()} (${state.postiz.channels.join(", ")})`;
    setTimeout(() => postizModal.classList.add("hidden"), 700);
  });

  // Run Gemini Viral Moment Detection
  document.getElementById("runGeminiAnalyzeBtn").addEventListener("click", async () => {
    const statusEl = document.getElementById("geminiModalStatus");
    const runBtn = document.getElementById("runGeminiAnalyzeBtn");
    const apiKey = document.getElementById("geminiApiKeyInput").value.trim();
    const promptFocus = document.getElementById("geminiPromptInput").value.trim();
    const targetDur = parseFloat(document.getElementById("geminiTargetDurInput").value) || state.duration;
    const speakerCrop = document.getElementById("geminiSpeakerCropSelect").value === "true";

    if (apiKey) localStorage.setItem("gta6_gemini_api_key", apiKey);

    state.smartSpeakerCrop = speakerCrop;
    const smartSpeakerBtn = document.getElementById("smartSpeakerToggleBtn");
    smartSpeakerBtn.classList.toggle("active", state.smartSpeakerCrop);
    smartSpeakerBtn.textContent = `SPEAKER CROP: ${state.smartSpeakerCrop ? "ON" : "OFF"}`;

    runBtn.disabled = true;
    statusEl.textContent = `Analyzing ${targetDur}s sequence, Smart Speaker tracks, and audio spikes...`;

    try {
      const res = await fetch("/api/analyze-viral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_video: state.activeSourceUrl,
          gemini_api_key: apiKey || null,
          target_duration: targetDur,
          num_clips: state.numClips,
          smart_speaker_crop: speakerCrop,
          prompt_focus: promptFocus
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Viral analysis failed");

      state.captions = data.captions || state.captions;
      state.keyframes = data.keyframes || state.keyframes;
      state.waveform = data.waveform || state.waveform;
      state.duration = data.duration || targetDur;
      state.activeCaptionId = state.captions[0]?.id || "cap_1";

      setShortsTargetDuration(state.duration);
      renderWaveform();
      syncUIAtTime(0.2);
      pollPipelineLogs();

      engineStatusPill.textContent = apiKey ? "GEMINI 2.5 FLASH ACTIVE" : "OPENCV + SPEAKER AI ACTIVE";
      statusEl.textContent = `✓ ${data.engine}`;
      setTimeout(() => geminiModal.classList.add("hidden"), 900);
    } catch (err) {
      statusEl.textContent = `Error: ${err.message}`;
    } finally {
      runBtn.disabled = false;
    }
  });

  // Run yt-dlp Partial Stream VOD Download (Supports 1 to 10 clips!)
  document.getElementById("runYtdlpBtn").addEventListener("click", async () => {
    const url = document.getElementById("ytdlpUrlInput").value.trim();
    const tag = document.getElementById("ytdlpTagInput").value.trim();
    const winDur = parseFloat(document.getElementById("importWindowDurInput").value) || 30.0;
    const numClipsToExtract = parseInt(document.getElementById("importNumClipsInput")?.value, 10) || 1;
    const startRaw = document.getElementById("importStartOffsetInput").value.trim();
    const startOffset = startRaw !== "" ? parseFloat(startRaw) : null;
    const statusEl = document.getElementById("importModalStatus");
    const btn = document.getElementById("runYtdlpBtn");
    const origBtnText = "↓ EXTRACT VIRAL WINDOW VIA YT-DLP";

    if (!url) {
      const panel = document.getElementById("importProgressPanel");
      if (panel) panel.classList.remove("hidden");
      statusEl.textContent = "Please paste a valid YouTube, Twitch, or X/Twitter video URL.";
      return;
    }

    setNumClipsToGenerate(numClipsToExtract);
    btn.disabled = true;
    startImportProgressMonitor(
      numClipsToExtract,
      "PROBING STREAM VOD HEATMAP",
      `Probing VOD heatmap & extracting ${numClipsToExtract} viral clip(s) × ${winDur}s via yt-dlp...`,
      btn
    );

    try {
      const res = await fetch("/api/download-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          label: tag || null,
          target_duration: winDur,
          num_clips: numClipsToExtract,
          start_offset: startOffset
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "yt-dlp failed");

      applyImportedSource(data, winDur);
      await pollPipelineLogs();
      stopImportProgressMonitor(
        100,
        "EXTRACTION COMPLETE",
        `✓ Extracted ${data.num_clips_extracted || 1} viral clip(s) into Media Bin!`
      );
      setTimeout(() => importModal.classList.add("hidden"), 1200);
    } catch (err) {
      stopImportProgressMonitor(0, "EXTRACTION FAILED", `Error: ${err.message}`, true);
    } finally {
      btn.disabled = false;
      btn.textContent = origBtnText;
    }
  });

  // Run Local Video File Partial Window Extraction
  document.getElementById("runUploadBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("localVideoFileInput");
    const tag = document.getElementById("uploadTagInput").value.trim();
    const winDur = parseFloat(document.getElementById("importWindowDurInput").value) || 30.0;
    const numClipsToExtract = parseInt(document.getElementById("importNumClipsInput")?.value, 10) || 1;
    const startRaw = document.getElementById("importStartOffsetInput").value.trim();
    const startOffset = startRaw !== "" ? parseFloat(startRaw) : 0.0;
    const statusEl = document.getElementById("importModalStatus");
    const btn = document.getElementById("runUploadBtn");
    const origBtnText = "↑ EXTRACT LOCAL WINDOW & SPEAKER-TRACK";

    if (!fileInput.files || !fileInput.files[0]) {
      const panel = document.getElementById("importProgressPanel");
      if (panel) panel.classList.remove("hidden");
      statusEl.textContent = "Please select a local MP4/MKV/MOV video file first.";
      return;
    }

    setNumClipsToGenerate(numClipsToExtract);
    btn.disabled = true;
    startImportProgressMonitor(
      1,
      "EXTRACTING LOCAL VIDEO WINDOW",
      `Fast-seeking local file to ${startOffset}s and extracting ${winDur}s window...`,
      btn
    );

    try {
      const formData = new FormData();
      formData.append("file", fileInput.files[0]);
      formData.append("tag", tag || "GTA6");
      formData.append("target_duration", String(winDur));
      formData.append("start_offset", String(startOffset));
      formData.append("smart_speaker_crop", String(state.smartSpeakerCrop));

      const res = await fetch("/api/upload-video", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");

      applyImportedSource(data, winDur);
      await pollPipelineLogs();
      stopImportProgressMonitor(
        100,
        "EXTRACTION COMPLETE",
        `✓ Extracted & Speaker-Tracked ${data.source.title}!`
      );
      setTimeout(() => importModal.classList.add("hidden"), 1200);
    } catch (err) {
      stopImportProgressMonitor(0, "EXTRACTION FAILED", `Error: ${err.message}`, true);
    } finally {
      btn.disabled = false;
      btn.textContent = origBtnText;
    }
  });
}

function applyImportedSource(data, targetDur) {
  if (data.sources && data.sources.length) {
    state.sources = data.sources;
  } else if (data.source) {
    state.sources.unshift(data.source);
  }
  const primarySrc = data.source || state.sources[0];

  state.activeSourceId = primarySrc.id;
  state.activeSourceUrl = primarySrc.video_url;
  state.sourceFileDuration = primarySrc.duration || data.duration || targetDur;
  state.waveform = data.waveform || state.waveform;
  state.keyframes = data.keyframes || state.keyframes;

  video.src = primarySrc.video_url;
  if (primarySrc.filmstrip) {
    filmstripBg.style.backgroundImage = `url('${primarySrc.filmstrip}')`;
  }
  setShortsTargetDuration(targetDur || data.duration || 30);
  renderMediaBin();
  renderWaveform();
  renderTimelineReframeCurve();
  video.currentTime = 0;
  video.play();
}

initStudio();
