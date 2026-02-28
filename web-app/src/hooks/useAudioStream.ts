"use client";

import { useState, useCallback, useRef, useEffect } from "react";

const VOICE_AGENT_WS_URL =
  process.env.NEXT_PUBLIC_VOICE_AGENT_WS_URL || "ws://localhost:8081";

interface AudioStreamMessage {
  type: "audio" | "transcript" | "status" | "error";
  data?: string;
  speaker?: "ai" | "user";
  text?: string;
  isFinal?: boolean;
  state?: string;
  message?: string;
}

interface TranscriptEntry {
  speaker: "ai" | "user";
  text: string;
}

interface UseAudioStreamOptions {
  sessionId: string;
  onTranscript?: (speaker: "ai" | "user", text: string) => void;
  onStatusChange?: (state: string) => void;
  onError?: (message: string) => void;
}

export function useAudioStream({
  sessionId,
  onTranscript,
  onStatusChange,
  onError,
}: UseAudioStreamOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<
    "disconnected" | "connecting" | "connected"
  >("disconnected");
  const [micEnabled, setMicEnabled] = useState(true);
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const playbackQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);

  // Playback audio queue
  const playNextInQueue = useCallback(() => {
    const ctx = playbackContextRef.current;
    if (!ctx || playbackQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const buffer = playbackQueueRef.current.shift()!;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => playNextInQueue();
    source.start();
  }, []);

  const enqueueAudio = useCallback(
    (base64Pcm: string) => {
      const ctx = playbackContextRef.current;
      if (!ctx) return;

      // Decode base64 to PCM bytes
      const binaryStr = atob(base64Pcm);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      // Convert PCM 16-bit LE to Float32 (24kHz mono from Gemini)
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768;
      }

      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      playbackQueueRef.current.push(audioBuffer);
      if (!isPlayingRef.current) {
        playNextInQueue();
      }
    },
    [playNextInQueue],
  );

  // Connect to voice-agent-service WebSocket
  const connect = useCallback(
    async (metadata?: object) => {
      if (wsRef.current) return;

      setConnectionState("connecting");

      try {
        // 1. Get mic audio stream
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
        streamRef.current = stream;

        // 2. Set up audio capture (PCM 16-bit 16kHz mono)
        const audioContext = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        // 3. Set up playback context (24kHz for Gemini output)
        playbackContextRef.current = new AudioContext({ sampleRate: 24000 });

        // 4. Connect WebSocket to voice-agent-service
        const ws = new WebSocket(`${VOICE_AGENT_WS_URL}/ws/interview`);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
          setConnectionState("connected");
          onStatusChange?.("connected");

          // Send config message with session info
          ws.send(
            JSON.stringify({
              type: "config",
              sessionId,
              ...metadata,
            }),
          );

          // Start sending audio
          processor.onaudioprocess = (e) => {
            if (!micEnabled) return;
            if (ws.readyState !== WebSocket.OPEN) return;

            const inputData = e.inputBuffer.getChannelData(0);
            // Convert Float32 to PCM 16-bit LE
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
            }

            // Convert to base64
            const bytes = new Uint8Array(pcm16.buffer);
            let binary = "";
            for (let i = 0; i < bytes.length; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);

            ws.send(JSON.stringify({ type: "audio", data: base64 }));
          };

          source.connect(processor);
          processor.connect(audioContext.destination);
        };

        ws.onmessage = (event) => {
          const msg: AudioStreamMessage = JSON.parse(event.data);

          switch (msg.type) {
            case "audio":
              if (msg.data) enqueueAudio(msg.data);
              break;
            case "transcript":
              if (msg.speaker && msg.text) {
                onTranscript?.(msg.speaker, msg.text);
                if (msg.isFinal) {
                  setTranscripts((prev) => [
                    ...prev,
                    { speaker: msg.speaker!, text: msg.text! },
                  ]);
                }
              }
              break;
            case "status":
              if (msg.state) {
                onStatusChange?.(msg.state);
                if (msg.state === "disconnected" || msg.state === "ended") {
                  setIsConnected(false);
                  setConnectionState("disconnected");
                }
              }
              break;
            case "error":
              onError?.(msg.message || "Unknown error");
              break;
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          setConnectionState("disconnected");
        };

        ws.onerror = () => {
          onError?.("WebSocket connection failed");
          setIsConnected(false);
          setConnectionState("disconnected");
        };
      } catch (err: any) {
        onError?.(err.message || "Failed to start audio");
        setConnectionState("disconnected");
      }
    },
    [sessionId, micEnabled, onTranscript, onStatusChange, onError, enqueueAudio],
  );

  // Disconnect and clean up
  const disconnect = useCallback(() => {
    // Send end message
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "end" }));
    }

    // Close WebSocket
    wsRef.current?.close();
    wsRef.current = null;

    // Stop audio capture
    processorRef.current?.disconnect();
    processorRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;

    // Stop mic stream
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    // Stop playback
    playbackQueueRef.current = [];
    isPlayingRef.current = false;
    playbackContextRef.current?.close();
    playbackContextRef.current = null;

    setIsConnected(false);
    setConnectionState("disconnected");
  }, []);

  // Toggle mic
  const toggleMic = useCallback(() => {
    const stream = streamRef.current;
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicEnabled(audioTrack.enabled);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connectionState,
    micEnabled,
    transcripts,
    connect,
    disconnect,
    toggleMic,
  };
}
