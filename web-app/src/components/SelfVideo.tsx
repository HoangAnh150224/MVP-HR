"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useLandmarks } from "@/hooks/useLandmarks";

interface VisionWarning {
  type: string;
  severity: string;
  message: string;
}

interface SelfVideoProps {
  sessionId: string;
  enabled: boolean;
  onWarning?: (warning: { type: string; message: string }) => void;
}

const DETECT_INTERVAL_MS = 100; // ~10 FPS

export default function SelfVideo({ sessionId, enabled, onWarning }: SelfVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const detectIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [warnings, setWarnings] = useState<VisionWarning[]>([]);
  const [loading, setLoading] = useState(false);

  const handleWarning = useCallback((w: VisionWarning[]) => {
    setWarnings(w);
    if (w.length > 0 && onWarning) {
      onWarning({ type: w[0].type, message: w[0].message });
    }
  }, [onWarning]);

  const { connect, sendLandmarks, disconnect } = useLandmarks(
    sessionId,
    handleWarning,
  );

  // Initialize MediaPipe FaceLandmarker
  const initLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return;
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
    );
    landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFacialTransformationMatrixes: false,
      outputFaceBlendshapes: true,
    });
  }, []);

  // Start camera + detection loop
  const startCamera = useCallback(async () => {
    setLoading(true);
    try {
      await initLandmarker();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      connect();

      // Detection loop
      detectIntervalRef.current = setInterval(() => {
        const video = videoRef.current;
        const landmarker = landmarkerRef.current;
        if (!video || !landmarker || video.readyState < 2) return;

        const result = landmarker.detectForVideo(video, performance.now());
        if (result.faceLandmarks && result.faceLandmarks.length > 0) {
          const landmarks = result.faceLandmarks[0].map((lm) => ({
            x: lm.x,
            y: lm.y,
            z: lm.z,
            visibility: lm.visibility ?? 1.0,
          }));

          // Extract blendshapes as a flat dict { categoryName: score }
          let faceBlendshapes: Record<string, number> | undefined;
          if (
            result.faceBlendshapes &&
            result.faceBlendshapes.length > 0
          ) {
            faceBlendshapes = {};
            for (const cat of result.faceBlendshapes[0].categories) {
              faceBlendshapes[cat.categoryName] = cat.score;
            }
          }

          sendLandmarks({
            timestamp: Date.now() / 1000,
            face_landmarks: landmarks,
            ...(faceBlendshapes && {
              face_blendshapes: faceBlendshapes,
            }),
          });
        }
      }, DETECT_INTERVAL_MS);
    } catch (err) {
      console.error("Failed to start camera or MediaPipe:", err);
    } finally {
      setLoading(false);
    }
  }, [initLandmarker, connect, sendLandmarks]);

  // Stop camera + detection loop
  const stopCamera = useCallback(() => {
    if (detectIntervalRef.current) {
      clearInterval(detectIntervalRef.current);
      detectIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    disconnect();
    setWarnings([]);
  }, [disconnect]);

  // React to enabled prop
  useEffect(() => {
    if (enabled) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [enabled, startCamera, stopCamera]);

  return (
    <div className="relative">
      {/* Video feed */}
      <div className="relative h-48 w-64 overflow-hidden rounded-lg border-2 border-gray-600 bg-gray-800">
        {enabled ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full -scale-x-100 object-cover"
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800/70">
                <p className="text-xs text-gray-300">Đang khởi tạo camera...</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-500">Camera đã tắt</p>
          </div>
        )}

        {/* Warning overlay on video */}
        {warnings.length > 0 && enabled && (
          <div className="absolute bottom-0 left-0 right-0 bg-yellow-600/80 px-2 py-1">
            <p className="truncate text-xs font-medium text-white">
              {warnings[0].message}
            </p>
          </div>
        )}
      </div>

      {/* Warnings list below video */}
      {warnings.length > 0 && enabled && (
        <div className="mt-2 space-y-1">
          {warnings.map((w, i) => (
            <div
              key={`${w.type}-${i}`}
              className={`rounded px-2 py-1 text-xs ${
                w.severity === "critical"
                  ? "bg-red-900/50 text-red-300"
                  : "bg-yellow-900/50 text-yellow-300"
              }`}
            >
              {w.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
