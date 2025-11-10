import { buildPeer } from "./peerFactory.js";
import { localStream, initLocalAudio, stopLocalAudio, removeAllRemoteAudioElements } from "./audioManager.js";

const peers = {}; // key = userId

export function createPeerConnection(targetUserId, isInitiator = false) {
  
  // If a peer connection already exists for this user, remove it first
  if (peers[targetUserId]) {
    console.log('recreate new peer')
    removePeer(targetUserId);
    stopLocalAudio();
    removeAllRemoteAudioElements();
  }
  
  const pc = buildPeer(targetUserId, isInitiator);

  // Re-init local stream if not present
  if (!localStream) {
    initLocalAudio().then(stream => {
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    });
  } else {
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  }

  // Store this peer connection by userId
  peers[targetUserId] = pc;

  // When this peer connection closes or fails, clean it up
  pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Peer ${targetUserId} state:`, pc.connectionState);
    if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
      console.log("Peer disconnected:", targetUserId);
      removePeer(targetUserId);
    }
  };

  return pc;
}

export function getPeer(userId) {
  return peers[userId];
}

export function registerPeer(userId, pc) {
  peers[userId] = pc;
}

export function removePeer(userId) {
  if (peers[userId]) {
    try {
      peers[userId].close();
    } catch (err) {
      console.error("Error closing peer:", err);
    }
    delete peers[userId];
  }
}

export function closeAllPeers() {
  Object.values(peers).forEach((pc) => {
    try {
      pc.close();
    } catch (err) {
      console.error("Error closing peer:", err);
    }
  });
  Object.keys(peers).forEach((key) => delete peers[key]);
}

export function getAllPeers() {
  return peers; 
}