/**
 * Gets the local IP address of the machine
 * This is needed because localhost only works on the same machine
 * When scanning a QR code from a phone, we need the actual local IP
 */
export async function getLocalIp(): Promise<string> {
  // Default to localhost - this will be replaced if we can detect the actual IP
  return new Promise<string>((resolve) => {
    // Create a dummy connection to get the local IP
    const pc = new RTCPeerConnection({
      iceServers: []
    });
    
    pc.createDataChannel('');
    
    pc.createOffer().then(offer => pc.setLocalDescription(offer));
    
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const candidate = event.candidate.candidate;
        const match = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
        if (match) {
          const ip = match[1];
          // Make sure it's not a loopback or public IP (local network only)
          if (!ip.startsWith('127.') && !ip.startsWith('0.')) {
            pc.close();
            resolve(ip);
            return;
          }
        }
      }
    };
    
    // Fallback: try to get IP from browser
    setTimeout(() => {
      pc.close();
      // Use a heuristic to get the hostname
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Can't automatically detect IP, return empty string to indicate this
        resolve('');
      } else {
        resolve(hostname);
      }
    }, 1000);
  });
}

/**
 * Synchronous version that returns a default or previously obtained IP
 * For use in React components
 */
let cachedIp = '';

export function setCachedIp(ip: string) {
  cachedIp = ip;
}

export function getCachedIp(): string {
  return cachedIp;
}
