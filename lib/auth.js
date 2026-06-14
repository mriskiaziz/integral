export const AUTH_COOKIE = 'integral_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function getSecret() {
  return (
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.JWT_SECRET ||
    'integral-dev-secret-change-me'
  );
}

function base64UrlEncode(value) {
  const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

async function signingKey() {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function createSessionToken(user) {
  const payload = {
    userId: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await crypto.subtle.sign(
    'HMAC',
    await signingKey(),
    new TextEncoder().encode(encodedPayload),
  );

  return `${encodedPayload}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token) {
  if (!token || !token.includes('.')) return null;

  const [encodedPayload, encodedSignature] = token.split('.');
  if (!encodedPayload || !encodedSignature) return null;

  const valid = await crypto.subtle.verify(
    'HMAC',
    await signingKey(),
    base64UrlDecode(encodedSignature),
    new TextEncoder().encode(encodedPayload),
  );

  if (!valid) return null;

  try {
    const payloadText = new TextDecoder().decode(base64UrlDecode(encodedPayload));
    const payload = JSON.parse(payloadText);

    if (!payload.userId || !payload.role || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
