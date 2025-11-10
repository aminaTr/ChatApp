export let localStream = null;

export async function initLocalAudio() {
  localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return localStream;
}

export function stopLocalAudio() {
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
}

export function attachRemoteAudio(userId, stream) {
  let audio = document.getElementById("audio-" + userId);

  if (!audio) {
    audio = document.createElement("audio");
    audio.id = "audio-" + userId;
    audio.autoplay = true;
    document.body.appendChild(audio);
  }

  audio.srcObject = stream;
}

export function removeAllRemoteAudioElements() {
  const audios = document.querySelectorAll("[id^='audio-']");
  audios.forEach((audio) => {
    audio.srcObject = null;
    audio.remove();
  });
}

// Mute/unmute helpers
export function muteLocalAudio() {
  if (!localStream) return;
  localStream.getAudioTracks().forEach(track => track.enabled = false);
}

export function unmuteLocalAudio() {
  if (!localStream) return;
  localStream.getAudioTracks().forEach(track => track.enabled = true);
}

export function toggleMute() {
  if (!localStream) return;
  localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
  return !localStream.getAudioTracks()[0].enabled; // returns current state
}