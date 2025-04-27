import { create } from "zustand";
import { LocalStorage } from "../utils/localstorage";

interface DeviceStore {
  userInteracted: boolean;
  isVideoOn: boolean;
  isMuted: boolean;
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  audioOutputDevices: MediaDeviceInfo[];
  defaultAudioDevice: MediaDeviceInfo | null;
  defaultVideoDevice: MediaDeviceInfo | null;
  defaultAudioOutputDevice: MediaDeviceInfo | null;

  setUserInteracted: (userInteracted: boolean) => void;

  setIsVideoOn: (isVideoOn: boolean) => void;
  setIsMuted: (isMuted: boolean) => void;

  setAudioDevices: (audioDevices: MediaDeviceInfo[]) => void;
  setVideoDevices: (videoDevices: MediaDeviceInfo[]) => void;
  setAudioOutputDevices: (audioOutPutDevices: MediaDeviceInfo[]) => void;

  setDefaultAudioDevice: (audioDevices: MediaDeviceInfo | null) => void;
  setDefaultVideoDevice: (videoDevices: MediaDeviceInfo | null) => void;
  setDefaultAudioOutputDevice: (
    audioOutputDevice: MediaDeviceInfo | null
  ) => void;
}

const useDeviceStore = create<DeviceStore>()((set) => {
  const defaultAD = LocalStorage.getItem<MediaDeviceInfo>("defaultAudioDevice");
  const defaultVD = LocalStorage.getItem<MediaDeviceInfo>("defaultVideoDevice");
  const defaultAOPD = LocalStorage.getItem<MediaDeviceInfo>(
    "defaultAudioOutputDevice"
  );

  navigator.mediaDevices
    .getUserMedia({ audio: true, video: true })
    .then(() => {
      return navigator.mediaDevices.enumerateDevices();
    })
    .then((devices) => {
      const audioDevices = devices.filter(
        (device) => device.kind === "audioinput"
      );

      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      const audioOutputDevices = devices.filter(
        (device) => device.kind === "audiooutput"
      );

      const defaultAudioDevice = defaultAD
        ? (audioDevices.find(
            (ad) => ad.deviceId === defaultAD.deviceId
          ) as MediaDeviceInfo)
        : audioDevices[0] ?? null;

      const defaultVideoDevice = defaultVD
        ? (audioDevices.find(
            (ad) => ad.deviceId === defaultVD.deviceId
          ) as MediaDeviceInfo)
        : audioDevices[0] ?? null;

      const defaultAudioOutputDevice = defaultAOPD
        ? (audioOutputDevices.find(
            (ad) => ad.deviceId === defaultAOPD.deviceId
          ) as MediaDeviceInfo)
        : audioDevices[0] ?? null;

      set(() => ({
        audioDevices,
        videoDevices,
        audioOutputDevices,
        defaultAudioDevice,
        defaultVideoDevice,
        defaultAudioOutputDevice,
      }));
    });

  return {
    userInteracted: false,
    isVideoOn: true,
    isMuted: false,
    audioDevices: [],
    videoDevices: [],
    audioOutputDevices: [],
    defaultAudioDevice: {} as MediaDeviceInfo,
    defaultVideoDevice: {} as MediaDeviceInfo,
    defaultAudioOutputDevice: {} as MediaDeviceInfo,

    setUserInteracted: (userInteracted) => set(() => ({ userInteracted })),

    setIsVideoOn: (isVideoOn) => set(() => ({ isVideoOn })),
    setIsMuted: (isMuted) => set(() => ({ isMuted })),

    setAudioDevices: (audioDevices: MediaDeviceInfo[]) =>
      set(() => ({ audioDevices })),
    setVideoDevices: (videoDevices: MediaDeviceInfo[]) =>
      set(() => ({ videoDevices })),
    setAudioOutputDevices: (audioOutputDevices: MediaDeviceInfo[]) =>
      set(() => ({ audioOutputDevices })),

    setDefaultAudioDevice: (audioDevice: MediaDeviceInfo | null) =>
      set(() => ({ defaultAudioDevice: audioDevice })),
    setDefaultVideoDevice: (videoDevice: MediaDeviceInfo | null) =>
      set(() => ({ defaultVideoDevice: videoDevice })),
    setDefaultAudioOutputDevice: (audioOutputDevice: MediaDeviceInfo | null) =>
      set(() => ({ defaultAudioOutputDevice: audioOutputDevice })),
  };
});

export default useDeviceStore;
