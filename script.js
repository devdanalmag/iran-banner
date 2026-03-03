/* ========================================
   I Stand With Iran - Banner Generator
   ======================================== */

(function () {
  "use strict";

  // DOM Elements - Country Selection
  const countrySelectScreen = document.getElementById('countrySelectScreen');
  const cardIran = document.getElementById('cardIran');
  const cardIsrael = document.getElementById('cardIsrael');
  const bannerApp = document.getElementById('bannerApp');
  const memeScreen = document.getElementById('memeScreen');
  const memeVideo = document.getElementById('memeVideo');
  const memeBackBtn = document.getElementById('memeBackBtn');
  const backToSelectBtn = document.getElementById('backToSelectBtn');

  // DOM Elements - Banner Generator
  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("fileInput");
  const uploadSection = document.getElementById("uploadSection");
  const previewSection = document.getElementById("previewSection");
  const canvas = document.getElementById("bannerCanvas");
  const ctx = canvas.getContext("2d");
  const photoSizeSlider = document.getElementById("photoSize");
  const photoYSlider = document.getElementById("photoY");
  const photoXSlider = document.getElementById("photoX");
  const downloadBtn = document.getElementById("downloadBtn");
  const postXBtn = document.getElementById("postXBtn");
  const changePhotoBtn = document.getElementById("changePhotoBtn");
  const particlesContainer = document.getElementById("particles");

  // State
  const CANVAS_W = 1280;
  const CANVAS_H = 720;
  let bgImage = null;
  let userPhoto = null;

  // ========================================
  // Country Selection Navigation
  // ========================================
  cardIran.addEventListener('click', () => {
    countrySelectScreen.style.display = 'none';
    bannerApp.style.display = 'flex';
  });

  cardIsrael.addEventListener('click', () => {
    countrySelectScreen.style.display = 'none';
    memeScreen.style.display = 'flex';
    memeVideo.currentTime = 0;
    memeVideo.play().catch(() => {});
  });

  memeBackBtn.addEventListener('click', () => {
    memeScreen.style.display = 'none';
    memeVideo.pause();
    countrySelectScreen.style.display = 'flex';
  });

  backToSelectBtn.addEventListener('click', () => {
    bannerApp.style.display = 'none';
    countrySelectScreen.style.display = 'flex';
  });

  // ========================================
  // Background Particles
  // ========================================
  function createParticles() {
    const colors = ["#009b3a", "#c8102e", "#d4a843", "#ffffff"];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      const size = Math.random() * 4 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                left: ${Math.random() * 100}%;
                animation-duration: ${Math.random() * 15 + 10}s;
                animation-delay: ${Math.random() * 10}s;
                box-shadow: 0 0 ${size * 2}px ${color};
            `;
      particlesContainer.appendChild(p);
    }
  }

  // ========================================
  // Load Background Image
  // ========================================
  function loadBackground() {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        bgImage = img;
        resolve();
      };
      img.onerror = reject;
      img.src = "background.png";
    });
  }

  // ========================================
  // File Upload Handling
  // ========================================
  uploadArea.addEventListener("click", () => fileInput.click());

  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("drag-over");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("drag-over");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        userPhoto = img;
        showPreview();
        renderBanner();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ========================================
  // Show/Hide Sections
  // ========================================
  function showPreview() {
    uploadSection.style.display = "none";
    previewSection.style.display = "block";
  }

  function showUpload() {
    previewSection.style.display = "none";
    uploadSection.style.display = "block";
    fileInput.value = "";
    userPhoto = null;
  }

  changePhotoBtn.addEventListener("click", showUpload);

  // ========================================
  // Render Banner on Canvas
  // ========================================
  function renderBanner() {
    if (!bgImage || !userPhoto) return;

    const sizePercent = parseInt(photoSizeSlider.value) / 100;
    const yPercent = parseInt(photoYSlider.value) / 100;
    const xPercent = parseInt(photoXSlider.value) / 100;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Step 1: Draw the full background
    ctx.drawImage(bgImage, 0, 0, CANVAS_W, CANVAS_H);

    // Calculate user photo dimensions (maintain aspect ratio)
    const photoAspect = userPhoto.width / userPhoto.height;
    const maxPhotoH = CANVAS_H * sizePercent;
    const photoH = maxPhotoH;
    const photoW = photoH * photoAspect;

    // Position
    const photoX = CANVAS_W * xPercent - photoW / 2;
    const photoY = CANVAS_H * yPercent - photoH / 4;

    const centerX = photoX + photoW / 2;
    const centerY = photoY + photoH / 2;
    const radiusX = photoW / 2;
    const radiusY = photoH / 2;

    // Step 2: Create off-screen canvas for soft-edged photo
    const offCanvas = document.createElement('canvas');
    offCanvas.width = CANVAS_W;
    offCanvas.height = CANVAS_H;
    const offCtx = offCanvas.getContext('2d');

    // Draw the user photo on the off-screen canvas
    offCtx.drawImage(userPhoto, photoX, photoY, photoW, photoH);

    // Apply soft edge mask using destination-in compositing
    // This uses a radial gradient that goes from opaque center to transparent edges
    offCtx.globalCompositeOperation = 'destination-in';

    // We need to simulate an elliptical gradient using a scale transform
    offCtx.save();
    offCtx.translate(centerX, centerY);
    offCtx.scale(1, radiusY / radiusX); // Scale to make circular gradient elliptical
    
    const grad = offCtx.createRadialGradient(0, 0, radiusX * 0.45, 0, 0, radiusX * 0.95);
    grad.addColorStop(0, 'rgba(0,0,0,1)');     // Fully opaque center
    grad.addColorStop(0.5, 'rgba(0,0,0,1)');   // Stay opaque a good way out
    grad.addColorStop(0.75, 'rgba(0,0,0,0.6)'); // Start fading
    grad.addColorStop(0.9, 'rgba(0,0,0,0.2)'); // Mostly transparent
    grad.addColorStop(1, 'rgba(0,0,0,0)');      // Fully transparent at edge

    offCtx.fillStyle = grad;
    offCtx.fillRect(-radiusX * 2, -radiusX * 2, radiusX * 4, radiusX * 4);
    offCtx.restore();
    offCtx.globalCompositeOperation = 'source-over';

    // Step 3: Draw the soft-edged photo onto the main canvas
    ctx.drawImage(offCanvas, 0, 0);

    // Step 4: Draw "I STAND WITH IRAN" text
    drawText();
  }

  function drawText() {
    const text = 'I STAND WITH IRAN';

    ctx.save();

    // Auto-size to fill ~95% canvas width (edge-to-edge like the template)
    const targetWidth = CANVAS_W * 0.95;
    const fontFamily = '"Impact", "Oswald", "Arial Black", sans-serif';

    let fontSize = 200;
    ctx.font = `900 ${fontSize}px ${fontFamily}`;
    let measured = ctx.measureText(text).width;
    fontSize = Math.floor(fontSize * (targetWidth / measured));
    ctx.font = `900 ${fontSize}px ${fontFamily}`;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    const textX = CANVAS_W / 2;
    const textY = CANVAS_H - 8;

    // Layer 1: Dark shadow for 3D depth (bottom-right)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 4;

    // Thin dark outline for definition
    ctx.strokeStyle = 'rgba(30, 20, 10, 0.7)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, textX, textY);

    // Layer 2: Warm golden/beige gradient fill (matching the template)
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    const textGrad = ctx.createLinearGradient(0, textY - fontSize, 0, textY);
    textGrad.addColorStop(0, '#f2e6ce');    // Light warm cream at top
    textGrad.addColorStop(0.3, '#e8d4b0');  // Warm beige
    textGrad.addColorStop(0.6, '#d4bc8e');  // Golden tan
    textGrad.addColorStop(1, '#c2a472');    // Deeper warm gold at bottom
    ctx.fillStyle = textGrad;
    ctx.fillText(text, textX, textY);

    // Layer 3: Subtle top-edge highlight for embossed/3D look
    ctx.globalCompositeOperation = 'lighter';
    ctx.shadowColor = 'rgba(255, 240, 200, 0.2)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = -1;
    ctx.fillStyle = 'rgba(255, 245, 220, 0.12)';
    ctx.fillText(text, textX, textY);
    ctx.globalCompositeOperation = 'source-over';

    ctx.restore();
  }

  // ========================================
  // Slider Events
  // ========================================
  photoSizeSlider.addEventListener("input", renderBanner);
  photoYSlider.addEventListener("input", renderBanner);
  photoXSlider.addEventListener("input", renderBanner);

  // ========================================
  // Download as PNG (using toBlob for reliable format)
  // ========================================
  downloadBtn.addEventListener("click", () => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "I-Stand-With-Iran-Banner.png";
      link.href = url;
      link.click();
      // Clean up the object URL after a short delay
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }, "image/png");
  });

  // ========================================
  // Post on X (Twitter) - with image via Web Share API
  // ========================================
  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "toast-notification";
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  postXBtn.addEventListener("click", () => {
    const shareText = "I Stand With Iran 🇮🇷✊\n\n#IStandWithIran #Iran #Solidarity #StandWithIran";

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      // Create a File object from the blob
      const file = new File([blob], "I-Stand-With-Iran-Banner.png", { type: "image/png" });

      // Try native Web Share API (works on mobile + modern desktop — shares the actual image)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            text: shareText,
            files: [file],
          });
          return; // User shared successfully
        } catch (err) {
          if (err.name === "AbortError") return; // User cancelled
          // Share failed, fall through to fallback
        }
      }

      // Fallback: download the image + open X compose with text
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "I-Stand-With-Iran-Banner.png";
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      // Open X/Twitter compose
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
      setTimeout(() => {
        window.open(tweetUrl, "_blank", "noopener,noreferrer");
      }, 800);

      showToast("📸 Banner downloaded! Attach it to your tweet on X.");
    }, "image/png");
  });

  // ========================================
  // Init
  // ========================================
  createParticles();
  loadBackground().catch(() => {
    console.error("Failed to load background image.");
  });
})();
