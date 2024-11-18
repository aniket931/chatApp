class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      });
    }
  }

 


  async getLocalStream() {
    try {
      // Capture the local video and audio stream
      this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      
      // Add the stream to the peer connection
      this.localStream.getTracks().forEach(track => {
        this.peer.addTrack(track, this.localStream);
      });
      
      return this.localStream;
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer);
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(new RTCSessionDescription(ans));
      return ans;
    }
  }

  async setLocalDescription(ans) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      return offer;
    }
  }
}

export default new PeerService();
