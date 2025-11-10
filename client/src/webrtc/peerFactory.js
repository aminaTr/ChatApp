import { getSocket } from "../socket/socket.js";
import { attachRemoteAudio } from "./audioManager.js";
import { registerPeer, removePeer } from "./peerConnections.js";

const iceServers = [
  // Free Google STUN
  { urls: "stun:stun.l.google.com:19302" },

  // Optional TURN (for fallback)
  {
    urls: "turn:relay1.expressturn.com:3478",
    username: "efree",
    credential: "efree",
  },
];


export function buildPeer(targetUserId, isInitiator = false) {
  const socket = getSocket();
  const pc = new RTCPeerConnection({ iceServers });

  // --- ICE candidate handling ---
  pc.onicecandidate = (event) => {
    if (pc.connectionState !== "connected") {
      console.log(`[WebRTC] Sending ICE candidate to ${targetUserId}`);
    }
    if (event.candidate) {
      socket.emit("ice-candidate", {
        targetId: targetUserId, // ✅ send userId instead of socket.id
        candidate: event.candidate,
      });
    }
  };

  // --- Remote track handling ---
  pc.ontrack = (event) => {
    console.log(`[WebRTC] Received remote track from ${targetUserId}`);
    attachRemoteAudio(targetUserId, event.streams[0]);
    const audioEl = document.getElementById("audio-" + targetUserId);
  if (audioEl && audioEl.srcObject) {
    console.log("Remote audio stream:", audioEl.srcObject);
    console.log("Audio tracks:", audioEl.srcObject.getAudioTracks());
    audioEl.play().catch(() => {
      console.log("Autoplay blocked, requires user gesture");
    });
  } else {
    console.log("Audio element not yet available or no stream attached");
  }
  };

  // --- Connection state cleanup ---
  pc.onconnectionstatechange = () => {
    console.log(`[WebRTC] Peer ${targetUserId} state: ${state}`);
    const state = pc.connectionState;
    console.log(`[WebRTC] Peer ${targetUserId} state: ${state}`);
    if (state === "failed" || state === "disconnected" || state === "closed") {
      removePeer(targetUserId);
    }
  };

  // --- Register the peer ---
  registerPeer(targetUserId, pc);

  return pc;
}
