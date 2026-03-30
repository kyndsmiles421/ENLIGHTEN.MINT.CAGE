import { useCallback, useRef, useState, useEffect } from 'react';
import { ImageSegmenter, FilesetResolver } from '@mediapipe/tasks-vision';

const VIRTUAL_BACKGROUNDS = [
  // Sacred Sites
  { id: 'machu-picchu', name: 'Machu Picchu', category: 'Sacred Sites', url: 'https://images.unsplash.com/photo-1574700584428-17f6bcd3bd28?w=1280&q=80' },
  { id: 'temple-corridor', name: 'Ancient Temple', category: 'Sacred Sites', url: 'https://images.unsplash.com/photo-1767533427544-5f88d3fe4eed?w=1280&q=80' },
  { id: 'forest-ruins', name: 'Forest Ruins', category: 'Sacred Sites', url: 'https://images.unsplash.com/photo-1694995608203-c5cac3d0ff14?w=1280&q=80' },
  { id: 'sacred-steps', name: 'Sacred Steps', category: 'Sacred Sites', url: 'https://images.unsplash.com/photo-1771783572316-4d4efa90d886?w=1280&q=80' },
  { id: 'mountain-ruins', name: 'Mountain Citadel', category: 'Sacred Sites', url: 'https://images.unsplash.com/photo-1640303037628-9d9286f3a051?w=1280&q=80' },
  // Nature & Forests
  { id: 'sunlit-forest', name: 'Sunlit Forest', category: 'Nature', url: 'https://images.unsplash.com/photo-1740538643616-bd2501a4bff0?w=1280&q=80' },
  { id: 'forest-path', name: 'Forest Path', category: 'Nature', url: 'https://images.unsplash.com/photo-1587330454197-adb07f0ee321?w=1280&q=80' },
  { id: 'misty-forest', name: 'Misty Forest', category: 'Nature', url: 'https://images.unsplash.com/photo-1758554930451-d3bbc1cb4a59?w=1280&q=80' },
  { id: 'bamboo-grove', name: 'Bamboo Grove', category: 'Nature', url: 'https://images.unsplash.com/photo-1765707886614-fa458eb4f564?w=1280&q=80' },
  { id: 'zen-garden', name: 'Zen Garden', category: 'Nature', url: 'https://images.pexels.com/photos/36586758/pexels-photo-36586758.jpeg?auto=compress&cs=tinysrgb&w=1280' },
  { id: 'forest-bridge', name: 'Forest Bridge', category: 'Nature', url: 'https://images.unsplash.com/photo-1768333220649-5b08c5b85495?w=1280&q=80' },
  // Cosmic
  { id: 'nebula', name: 'Purple Nebula', category: 'Cosmic', url: 'https://images.unsplash.com/photo-1581840130788-0c20b3d547c0?w=1280&q=80' },
  { id: 'deep-space', name: 'Deep Space', category: 'Cosmic', url: 'https://images.unsplash.com/photo-1615392030676-6c532fe0c302?w=1280&q=80' },
  { id: 'emerald-nebula', name: 'Emerald Nebula', category: 'Cosmic', url: 'https://images.unsplash.com/photo-1608780841946-4e3b6827670b?w=1280&q=80' },
  { id: 'star-cluster', name: 'Star Cluster', category: 'Cosmic', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1280&q=80' },
];

const BLUR_LEVELS = [
  { id: 'light', name: 'Light Blur', value: 8 },
  { id: 'medium', name: 'Medium Blur', value: 16 },
  { id: 'heavy', name: 'Heavy Blur', value: 28 },
];

export { VIRTUAL_BACKGROUNDS, BLUR_LEVELS };

export function useVirtualBackground() {
  const segmenterRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const bgImageRef = useRef(null);
  const animFrameRef = useRef(null);
  const videoInputRef = useRef(null);
  const outputStreamRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentBg, setCurrentBg] = useState(null); // { type: 'image'|'blur', id, value? }
  const [error, setError] = useState(null);

  // Initialize MediaPipe segmenter
  const initSegmenter = useCallback(async () => {
    if (segmenterRef.current) return true;
    setIsLoading(true);
    setError(null);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm'
      );
      segmenterRef.current = await ImageSegmenter.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        outputCategoryMask: true,
        outputConfidenceMasks: false,
      });
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Segmenter init error:', err);
      setError('Could not load background processor');
      setIsLoading(false);
      return false;
    }
  }, []);

  // Load a background image
  const loadBgImage = useCallback((url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { bgImageRef.current = img; resolve(img); };
      img.onerror = () => { resolve(null); };
      img.src = url;
    });
  }, []);

  // Process a single frame
  const processFrame = useCallback((timestamp) => {
    const video = videoInputRef.current;
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    const segmenter = segmenterRef.current;

    if (!video || !canvas || !ctx || !segmenter || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    try {
      const result = segmenter.segmentForVideo(video, timestamp);
      const mask = result.categoryMask;

      if (!mask) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        animFrameRef.current = requestAnimationFrame(processFrame);
        return;
      }

      const maskData = mask.getAsUint8Array();
      const w = canvas.width;
      const h = canvas.height;

      // Draw the video frame first
      ctx.drawImage(video, 0, 0, w, h);
      const frame = ctx.getImageData(0, 0, w, h);
      const pixels = frame.data;

      if (currentBg?.type === 'image' && bgImageRef.current) {
        // Virtual background image
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = w;
        bgCanvas.height = h;
        const bgCtx = bgCanvas.getContext('2d');
        bgCtx.drawImage(bgImageRef.current, 0, 0, w, h);
        const bgData = bgCtx.getImageData(0, 0, w, h).data;

        for (let i = 0; i < maskData.length; i++) {
          const isBackground = maskData[i] === 0;
          if (isBackground) {
            const px = i * 4;
            pixels[px] = bgData[px];
            pixels[px + 1] = bgData[px + 1];
            pixels[px + 2] = bgData[px + 2];
          }
        }
        ctx.putImageData(frame, 0, 0);
      } else if (currentBg?.type === 'blur') {
        // Background blur
        const blurAmount = currentBg.value || 16;

        // Create separate foreground and background
        const fgCanvas = document.createElement('canvas');
        fgCanvas.width = w;
        fgCanvas.height = h;
        const fgCtx = fgCanvas.getContext('2d');
        fgCtx.putImageData(frame, 0, 0);

        // Draw blurred background
        ctx.filter = `blur(${blurAmount}px)`;
        ctx.drawImage(video, 0, 0, w, h);
        ctx.filter = 'none';

        // Get blurred data
        const blurFrame = ctx.getImageData(0, 0, w, h);
        const blurPixels = blurFrame.data;

        // Composite: person from original, background from blurred
        for (let i = 0; i < maskData.length; i++) {
          const isPerson = maskData[i] !== 0;
          if (isPerson) {
            const px = i * 4;
            blurPixels[px] = pixels[px];
            blurPixels[px + 1] = pixels[px + 1];
            blurPixels[px + 2] = pixels[px + 2];
          }
        }
        ctx.putImageData(blurFrame, 0, 0);
      } else {
        ctx.putImageData(frame, 0, 0);
      }

      mask.close();
    } catch {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    animFrameRef.current = requestAnimationFrame(processFrame);
  }, [currentBg]);

  // Start processing a video stream
  const startProcessing = useCallback(async (videoElement, bgConfig) => {
    const ok = await initSegmenter();
    if (!ok) return null;

    const video = videoElement;
    videoInputRef.current = video;
    setCurrentBg(bgConfig);

    // Create canvas matching video dimensions
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvasRef.current = canvas;
    ctxRef.current = canvas.getContext('2d', { willReadFrequently: true });

    if (bgConfig?.type === 'image') {
      const bg = VIRTUAL_BACKGROUNDS.find(b => b.id === bgConfig.id);
      if (bg) await loadBgImage(bg.url);
    }

    // Start processing loop
    animFrameRef.current = requestAnimationFrame(processFrame);

    // Capture canvas stream
    const stream = canvas.captureStream(30);
    outputStreamRef.current = stream;
    setIsActive(true);
    return stream;
  }, [initSegmenter, loadBgImage, processFrame]);

  // Change background while processing
  const changeBackground = useCallback(async (bgConfig) => {
    setCurrentBg(bgConfig);
    if (bgConfig?.type === 'image') {
      const bg = VIRTUAL_BACKGROUNDS.find(b => b.id === bgConfig.id);
      if (bg) await loadBgImage(bg.url);
    }
  }, [loadBgImage]);

  // Stop processing
  const stopProcessing = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (outputStreamRef.current) {
      outputStreamRef.current.getTracks().forEach(t => t.stop());
      outputStreamRef.current = null;
    }
    videoInputRef.current = null;
    setIsActive(false);
    setCurrentBg(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProcessing();
      if (segmenterRef.current) {
        segmenterRef.current.close();
        segmenterRef.current = null;
      }
    };
  }, [stopProcessing]);

  return {
    isLoading,
    isActive,
    currentBg,
    error,
    startProcessing,
    stopProcessing,
    changeBackground,
    outputStreamRef,
    canvasRef,
  };
}
