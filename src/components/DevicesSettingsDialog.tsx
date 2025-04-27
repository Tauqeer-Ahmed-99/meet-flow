import React from "react";
import { X } from "lucide-react";
import useDeviceStore from "../stores/devices";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioDeviceChanged: (setDefaultAudioDevice: MediaDeviceInfo) => void;
  onVideoDeviceChanged: (videoDevice: MediaDeviceInfo) => void;
}

const DevicesSettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  onAudioDeviceChanged,
  onVideoDeviceChanged,
}) => {
  const {
    audioDevices,
    videoDevices,
    defaultAudioDevice,
    defaultVideoDevice,
    setDefaultAudioDevice,
    setDefaultVideoDevice,
  } = useDeviceStore();

  const handleSave = () => {
    // Save selected devices to localStorage
    localStorage.setItem(
      "defaultAudioDevice",
      JSON.stringify(defaultAudioDevice)
    );
    localStorage.setItem(
      "defaultVideoDevice",
      JSON.stringify(defaultVideoDevice)
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#1a2b4c]/95 backdrop-blur-lg rounded-xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Device Settings</h2>
          <button
            onClick={onClose}
            className="p-2 transition-colors rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block mb-2 text-white">Microphone</label>
            <select
              value={defaultAudioDevice?.deviceId}
              onChange={(e) => {
                const newDevice = audioDevices.find(
                  (ad) => ad.deviceId === e.target.value
                );
                setDefaultAudioDevice(newDevice ?? null);
                onAudioDeviceChanged(newDevice as MediaDeviceInfo);
              }}
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
            <label className="block mb-2 text-white">Camera</label>
            <select
              value={defaultVideoDevice?.deviceId}
              onChange={(e) => {
                const newDevice = videoDevices.find(
                  (vd) => vd.deviceId === e.target.value
                );
                setDefaultVideoDevice(newDevice ?? null);
                onVideoDeviceChanged(newDevice as MediaDeviceInfo);
              }}
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

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-white transition-colors rounded-lg hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevicesSettingsDialog;
