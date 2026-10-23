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

// STUN finds each device's public address; TURN relays the data when two
// networks (e.g. mobile data) can't connect directly. These are the free
// PeerJS servers, written out so the setup is visible.
const ICE = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: ['turn:eu-0.turn.peerjs.com:3478', 'turn:us-0.turn.peerjs.com:3478'], username: 'peerjs', credential: 'peerjsp' },
  ],
};
const TIMEOUT = 20000;

// Watches one data connection: reports when it is linking, and fails it if
// the devices can't reach each other (instead of waiting forever).
function watch(conn, handlers) {
  let opened = false;
  const timer = setTimeout(() => !opened && handlers.onError?.('timeout'), TIMEOUT);
  conn.on('open', () => {
    opened = true;
    clearTimeout(timer);
    handlers.onOpen?.();
  });
  conn.on('data', (m) => handlers.onMessage?.(m));
  conn.on('close', () => {
    clearTimeout(timer);
    handlers.onClose?.();
  });
  conn.on('error', () => handlers.onError?.('link'));
  conn.on('iceStateChanged', (state) => {
    if (state === 'checking') handlers.onStatus?.('netLinking');
    if (state === 'failed' && !opened) handlers.onError?.('ice-failed');
  });
}

// Up to three friends join one host (4 players in all).
export const MAX_GUESTS = 3;

// Host handlers: { onOpen(guest), onMessage(msg, guest), onClose(guest), onError(reason), onStatus(key) }
// where guest is a short id for that friend's connection.
// Returns { code, send(msg) to everyone, sendTo(guest, msg), close() }.
export async function hostRoom(handlers) {
  const code = newCode();
  if (local()) return localRoom(code, 'host', handlers);
  const Peer = await loadPeer();
  handlers.onStatus?.('netServer');
  const peer = new Peer(PREFIX + code, { config: ICE });
  const conns = new Map();
  let next = 1;
  peer.on('open', () => handlers.onStatus?.('netShareCode'));
  peer.on('connection', (c) => {
    if (conns.size >= MAX_GUESTS) {
      // Room is full: tell them, then hang up.
      c.on('open', () => {
        c.send({ type: 'full' });
        setTimeout(() => c.close(), 500);
      });
      return;
    }
    const guest = 'g' + next++;
    conns.set(guest, c);
    handlers.onStatus?.('netGuestKnock');
    watch(c, {
      onOpen: () => handlers.onOpen?.(guest),
      onMessage: (m) => handlers.onMessage?.(m, guest),
      onClose: () => {
        conns.delete(guest);
        handlers.onClose?.(guest);
      },
      onError: handlers.onError,
      onStatus: handlers.onStatus,
    });
  });
  // Lost the signalling server (phone slept, Wi-Fi changed): reconnect, same code.
  peer.on('disconnected', () => !peer.destroyed && peer.reconnect());
  peer.on('error', (e) => handlers.onError?.(e.type ?? 'error'));
  return {
    code,
    send: (m) => {
      for (const c of conns.values()) if (c.open) c.send(m);
    },
    sendTo: (guest, m) => {
      const c = conns.get(guest);
      if (c?.open) c.send(m);
    },
    close: () => peer.destroy(),
  };
}

export async function joinRoom(code, handlers) {
  code = code.trim().toUpperCase();
  if (local()) return localRoom(code, 'guest', handlers);
  const Peer = await loadPeer();
  handlers.onStatus?.('netServer');
  const peer = new Peer({ config: ICE });
  let conn = null;
  const serverTimer = setTimeout(() => !peer.open && handlers.onError?.('server-timeout'), TIMEOUT);
  peer.on('open', () => {
    clearTimeout(serverTimer);
    handlers.onStatus?.('netFindRoom');
    conn = peer.connect(PREFIX + code, { reliable: true, serialization: 'json' });
    watch(conn, handlers);
  });
  peer.on('error', (e) => handlers.onError?.(e.type ?? 'error'));
  return {
    code,
    send: (m) => conn?.open && conn.send(m),
    close: () => {
      clearTimeout(serverTimer);
      peer.destroy();
    },
  };
}

// Test transport (?net=local): tabs of one browser talk over a BroadcastChannel.
// Guests pick a random id; the host addresses messages to one or to all.
function localRoom(code, role, handlers) {
  const ch = new BroadcastChannel(PREFIX + code);
  if (role === 'host') {
    const guests = new Set();
    ch.onmessage = ({ data }) => {
      if (data.from !== 'guest') return;
      const g = data.gid;
      if (data.hello) {
        if (!guests.has(g) && guests.size >= MAX_GUESTS) {
          ch.postMessage({ from: 'host', to: g, msg: { type: 'full' } });
          return;
        }
        ch.postMessage({ from: 'host', to: g, hello: true });
        if (!guests.has(g)) {
          guests.add(g);
          handlers.onOpen?.(g);
        }
      } else if (data.bye) {
        if (guests.delete(g)) handlers.onClose?.(g);
      } else if (guests.has(g)) handlers.onMessage?.(data.msg, g);
    };
    return {
      code,
      send: (msg) => ch.postMessage({ from: 'host', msg }),
      sendTo: (g, msg) => ch.postMessage({ from: 'host', to: g, msg }),
      close: () => {
        ch.postMessage({ from: 'host', bye: true });
        ch.close();
      },
    };
  }
  const gid = Math.random().toString(36).slice(2, 8);
  let open = false;
  ch.onmessage = ({ data }) => {
    if (data.from !== 'host' || (data.to && data.to !== gid)) return;
    if (data.hello) {
      if (!open) {
        open = true;
        handlers.onOpen?.();
      }
    } else if (data.bye) {
      open = false;
      handlers.onClose?.();
    } else handlers.onMessage?.(data.msg);
  };
  ch.postMessage({ from: 'guest', gid, hello: true });
  return {
    code,
    send: (msg) => open && ch.postMessage({ from: 'guest', gid, msg }),
    close: () => {
      ch.postMessage({ from: 'guest', gid, bye: true });
      ch.close();
    },
  };
}
