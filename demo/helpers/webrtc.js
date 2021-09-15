const debug = true;

async function log(...msg) {
  if (debug) {
    const dt = new Date();
    const ts = `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}:${dt.getSeconds().toString().padStart(2, '0')}.${dt.getMilliseconds().toString().padStart(3, '0')}`;
    // eslint-disable-next-line no-console
    console.log(ts, 'webrtc', ...msg);
  }
}

/**
 * helper implementation of webrtc 
 * performs:
 * - discovery
 * - handshake
 * - connct to webrtc stream
 * - assign webrtc stream to video element
 *
 * for development purposes i'm using test webrtc server that reads rtsp stream from a security camera:
 * <https://github.com/vladmandic/stream-rtsp>
 * 
* @param {string} server
* @param {string} streamName
* @param {HTMLVideoElement} elementName
* @return {promise}
*/
async function webRTC(server, streamName, elementName) {
  const suuid = streamName;
  log('client starting');
  log(`server: ${server} stream: ${suuid}`);
  const stream = new MediaStream();
  const connection = new RTCPeerConnection();
  connection.oniceconnectionstatechange = () => log('connection', connection.iceConnectionState);
  connection.onnegotiationneeded = async () => {
    let offer;
    if (connection.localDescription) {
      offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      const res = await fetch(`${server}/stream/receiver/${suuid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        body: new URLSearchParams({
          suuid: `${suuid}`,
          data: `${btoa(connection.localDescription.sdp || '')}`,
        }),
      });
    }
    const data = res && res.ok ? await res.text() : '';
    if (data.length === 0 || !offer) {
      log('cannot connect:', server);
    } else {
      connection.setRemoteDescription(new RTCSessionDescription({
        type: 'answer',
        sdp: atob(data),
      }));
      log('negotiation start:', offer);
    }
  };
  connection.ontrack = (event) => {
    stream.addTrack(event.track);
    const video = (typeof elementName === 'string') ? document.getElementById(elementName) : elementName;
    if (video instanceof HTMLVideoElement) video.srcObject = stream;
    else log('element is not a video element:', elementName);
    // video.onloadeddata = async () => log('resolution:', video.videoWidth, video.videoHeight);
    log('received track:', event.track);
  };

  const res = await fetch(`${server}/stream/codec/${suuid}`);
  const streams = res && res.ok ? await res.json() : [];
  if (streams.length === 0) log('received no streams');
  else log('received streams:', streams);
  for (const s of streams) connection.addTransceiver(s.Type, { direction: 'sendrecv' });

  const channel = connection.createDataChannel(suuid, { maxRetransmits: 10 });
  channel.onmessage = (e) => log('channel message:', channel.label, 'payload', e.data);
  channel.onerror = (e) => log('channel error:', channel.label, 'payload', e);
  // channel.onbufferedamountlow = (e) => log('channel buffering:', channel.label, 'payload', e);
  channel.onclose = () => log('channel close', channel.label);
  channel.onopen = () => {
    log('channel open', channel.label);
    setInterval(() => channel.send('ping'), 1000); // send ping becouse PION doesn't handle RTCSessionDescription.close()
  };
}

export default webRTC;
