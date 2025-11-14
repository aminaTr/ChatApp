import { getSocket } from "./socket.js";
import { createPeerConnection, getPeer } from "../webrtc/peerConnections.js";

// A simple candidate queue per peer
const candidateQueueMap = new Map();

export function setupSignaling(log) {
  const socket = getSocket();
  console.log('in the signaling')
  // --- When we get existing participants after joining a room ---
  socket.on("existing-participants", async (otherUserIds) => {
    for (const remoteUserId of otherUserIds) {
      if (remoteUserId === socket.userId) continue;

      console.log(`Creating peer connection to ${remoteUserId}`);

      const pc = createPeerConnection(remoteUserId, true);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("send-offer", { targetId: remoteUserId, offer });
    }
  });

  // --- When someone new joins the room ---
  socket.on("user-joined", ({ userId }) => {
  if (!getPeer(userId)) {
    console.log("Creating peer for new user: " + userId);
    createPeerConnection(userId, false);
  }
});


// --- When you receive an offer ---
socket.on("receive-offer", async ({ from, offer }) => {
  console.log(`Received offer from ${from}`);
  let pc = getPeer(from);
  if (!pc) {
    // Create a peer if it doesn't exist yet
    pc = createPeerConnection(from, false);
  }

  await pc.setRemoteDescription(offer);

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("send-answer", { targetId: from, answer });

  // Flush any queued ICE candidates
  const queued = candidateQueueMap.get(from);
  if (queued?.length) {
    for (const c of queued) {
      await pc.addIceCandidate(new RTCIceCandidate(c));
    }
    candidateQueueMap.set(from, []);
  }
});

// --- When you receive an answer ---
socket.on("receive-answer", async ({ from, answer }) => {
  const pc = getPeer(from);
  if (!pc) return;

  // Only set remote description if the connection is expecting an answer
  if (pc.signalingState === "have-local-offer") {
    try {
      await pc.setRemoteDescription(answer);

      // Flush any queued ICE candidates
      const queued = candidateQueueMap.get(from);
      if (queued?.length) {
        for (const c of queued) {
          await pc.addIceCandidate(new RTCIceCandidate(c));
        }
        candidateQueueMap.set(from, []);
      }

      console.log(`[WebRTC] Remote answer set for ${from}`);
    } catch (err) {
      console.error("Failed to set remote answer:", err);
    }
  } else {
    console.warn(`[WebRTC] Ignored remote answer from ${from} because signalingState is ${pc.signalingState}`);
  }
});

  // --- When you receive ICE candidates ---
  socket.on("ice-candidate", ({ from, candidate }) => {
    const pc = getPeer(from);
    if (!pc) return;

    if (pc.remoteDescription) {
      // Remote description is set → safe to add
      pc.addIceCandidate(new RTCIceCandidate(candidate));
    } else {
      // Remote description not set yet → queue it
      if (!candidateQueueMap.has(from)) candidateQueueMap.set(from, []);
      candidateQueueMap.get(from).push(candidate);
    }
  });

}
