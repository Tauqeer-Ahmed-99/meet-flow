import React, { useEffect, useRef, useState } from "react";
import { X, Video, VideoOff, Mic, MicOff } from "lucide-react";
import useDeviceStore from "../stores/devices";

interface MediaPreviewDialogProps {
  isOpen: boolean;
  isSettingsOpen: boolean;
  onClose: () => void;
  onJoin: (title: string) => void;
  isJoining?: boolean;
}

const MediaPreviewDialog: React.FC<MediaPreviewDialogProps> = ({
  isOpen,
  isSettingsOpen,
  onClose,
  onJoin,
  isJoining,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [title, setTitle] = useState("");

  const {
    isVideoOn,
    isMuted,
    audioDevices,
    videoDevices,
    audioOutputDevices,
    defaultAudioDevice,
    defaultVideoDevice,
    defaultAudioOutputDevice,
    setIsMuted,
    setIsVideoOn,
    setDefaultAudioDevice,
    setDefaultVideoDevice,
    setDefaultAudioOutputDevice,
    setUserInteracted,
  } = useDeviceStore();

  useEffect(() => {
    const startStream = async () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (!isMuted || isVideoOn) {
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            audio: !isMuted
              ? { deviceId: defaultAudioDevice?.deviceId }
              : false,
            video: isVideoOn
              ? {
                  deviceId: defaultVideoDevice?.deviceId,
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                }
              : false,
          });

          setStream(newStream);
          if (videoRef.current) {
            videoRef.current.srcObject = newStream;
          }
        } catch (error) {
          console.error("Error accessing media devices:", error);
        }
      } else {
        setStream(null);
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    };

    if (isOpen) {
      startStream();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, defaultAudioDevice, defaultVideoDevice, isMuted, isVideoOn]);

  const handleJoin = () => {
    localStorage.setItem("isVideoOn", String(isVideoOn));
    localStorage.setItem("isMuted", String(isMuted));
    onJoin(title);
    setUserInteracted(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg">
      <div className="bg-[#1a2b4c]/95 backdrop-blur-lg rounded-xl w-full max-w-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">
            {!isSettingsOpen && "Preview Your"} Audio & Video{" "}
            {isSettingsOpen && "Settings"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-full hover:bg-white/10"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
        <div className="space-y-3">
          {!isSettingsOpen && !isJoining && (
            <div className="w-full">
              <label className="block mb-1 text-white">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 text-white rounded-lg bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex flex-col items-start justify-center w-1/2">
              <label className="block mb-1 text-white">Camera Preview</label>
              <div className="relative w-full overflow-hidden rounded-lg aspect-video bg-black/50">
                {isVideoOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500">
                      <VideoOff className="w-8 h-8 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid w-1/2 grid-cols-1 gap-6">
              <div>
                <label className="block mb-1 text-white">Camera</label>
                <select
                  value={defaultVideoDevice?.deviceId}
                  onChange={(e) =>
                    setDefaultVideoDevice(
                      videoDevices.find(
                        (vd) => vd.deviceId === e.target.value
                      ) ?? null
                    )
                  }
                  className="w-full px-4 py-2 text-white rounded-lg bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  {videoDevices.map((device) => (
                    <option
                      key={device.deviceId}
                      value={device.deviceId}
                      className="text-black"
                    >
                      {device.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-white">Microphone</label>
                <select
                  value={defaultAudioDevice?.deviceId}
                  onChange={(e) =>
                    setDefaultAudioDevice(
                      audioDevices.find(
                        (ad) => ad.deviceId === e.target.value
                      ) ?? null
                    )
                  }
                  className="w-full px-4 py-2 text-white rounded-lg bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  {audioDevices.map((device) => (
                    <option
                      key={device.deviceId}
                      value={device.deviceId}
                      className="text-black"
                    >
                      {device.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-white">Speaker</label>
                <select
                  value={defaultAudioOutputDevice?.deviceId}
                  onChange={(e) =>
                    setDefaultAudioOutputDevice(
                      audioOutputDevices.find(
                        (ad) => ad.deviceId === e.target.value
                      ) ?? null
                    )
                  }
                  className="w-full px-4 py-2 text-white rounded-lg bg-white/10 focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                  {audioOutputDevices.map((device) => (
                    <option
                      key={device.deviceId}
                      value={device.deviceId}
                      className="text-black"
                    >
                      {device.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-full ${
                isMuted
                  ? "bg-red-500 text-white"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              {!isMuted ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </button>
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-4 rounded-full ${
                !isVideoOn
                  ? "bg-red-500 text-white"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              {isVideoOn ? (
                <Video className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6" />
              )}
            </button>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            {isSettingsOpen && (
              <button
                onClick={onClose}
                className="px-6 py-3 text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
              >
                {"Close"}
              </button>
            )}
            {!isSettingsOpen && (
              <button
                onClick={handleJoin}
                className="px-6 py-3 text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
              >
                {"Join Meeting"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPreviewDialog;
