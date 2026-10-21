// Online rooms for two players. The host creates a room with a short code;
// the guest joins with it. Messages are plain objects.
// Transport: PeerJS (WebRTC, loaded only when someone plays online). With
// ?net=local both players are tabs of one browser (BroadcastChannel), for testing.

const PEERJS_URL = 'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';
const PREFIX = 'kalabendu-room-';
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function newCode() {
  let s = '';
  for (let i = 0; i < 5; i++) s += LETTERS[Math.floor(Math.random() * LETTERS.length)];
  return s;
}

const local = () => new URLSearchParams(location.search).get('net') === 'local';

let peerLib = null;
function loadPeer() {
  if (window.Peer) return Promise.resolve(window.Peer);
  peerLib ??= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = PEERJS_URL;
    s.onload = () => resolve(window.Peer);
    s.onerror = () => {
      peerLib = null;
      reject(new Error('peerjs'));
    };
    document.head.append(s);
  });
  return peerLib;
}

// handlers: { onOpen(), onMessage(msg), onClose(), onError(reason) }
// Returns { code, send(msg), close() }.
export async function hostRoom(handlers) {
  const code = newCode();
  if (local()) return localRoom(code, 'host', handlers);
  const Peer = await loadPeer();
  const peer = new Peer(PREFIX + code);
  let conn = null;
  peer.on('connection', (c) => {
    if (conn) {
      c.close();
      return;
    }
    conn = c;
    c.on('open', () => handlers.onOpen?.());
    c.on('data', (m) => handlers.onMessage?.(m));
    c.on('close', () => {
      conn = null;
      handlers.onClose?.();
    });
  });
  peer.on('error', (e) => handlers.onError?.(e.type ?? 'error'));
  return {
    code,
    send: (m) => conn?.open && conn.send(m),
    close: () => peer.destroy(),
  };
}

export async function joinRoom(code, handlers) {
  code = code.trim().toUpperCase();
  if (local()) return localRoom(code, 'guest', handlers);
  const Peer = await loadPeer();
  const peer = new Peer();
  let conn = null;
  peer.on('open', () => {
    conn = peer.connect(PREFIX + code, { reliable: true, serialization: 'json' });
    conn.on('open', () => handlers.onOpen?.());
    conn.on('data', (m) => handlers.onMessage?.(m));
    conn.on('close', () => handlers.onClose?.());
  });
  peer.on('error', (e) => handlers.onError?.(e.type ?? 'error'));
  return {
    code,
    send: (m) => conn?.open && conn.send(m),
    close: () => peer.destroy(),
  };
}

function localRoom(code, role, handlers) {
  const ch = new BroadcastChannel(PREFIX + code);
  let open = false;
  const other = role === 'host' ? 'guest' : 'host';
  ch.onmessage = ({ data }) => {
    if (data.from !== other) return;
    if (data.hello) {
      if (role === 'host') ch.postMessage({ from: role, hello: true });
      if (!open) {
        open = true;
        handlers.onOpen?.();
      }
      return;
    }
    if (data.bye) {
      open = false;
      handlers.onClose?.();
      return;
    }
    handlers.onMessage?.(data.msg);
  };
  if (role === 'guest') ch.postMessage({ from: role, hello: true });
  return {
    code,
    send: (msg) => open && ch.postMessage({ from: role, msg }),
    close: () => {
      ch.postMessage({ from: role, bye: true });
      ch.close();
    },
  };
}
