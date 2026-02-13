import { cookies } from 'next/headers';
import crypto from 'crypto';

const TOKEN_SECRET = process.env.ADMIN_PASSWORD || 'fallback-secret';

/**
 * HMAC 서명된 admin 토큰 생성
 */
export function createAdminToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(`admin:${timestamp}`)
    .digest('hex');
  
  // timestamp:signature 형식
  return Buffer.from(`${timestamp}:${signature}`).toString('base64');
}

/**
 * admin 토큰 검증
 * @returns true if valid, false if invalid
 */
export function verifyAdminToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [timestamp, signature] = decoded.split(':');
    
    if (!timestamp || !signature) {
      return false;
    }
    
    // 서명 검증
    const expectedSignature = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(`admin:${timestamp}`)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return false;
    }
    
    // 토큰 생성 시간 체크 (24시간 이내인지)
    const tokenTime = parseInt(timestamp, 10);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24시간
    
    if (now - tokenTime > maxAge) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * 요청에서 admin 토큰을 확인하고 검증
 * @returns true if authenticated, false otherwise
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    
    if (!token) {
      return false;
    }
    
    return verifyAdminToken(token);
  } catch {
    return false;
  }
}
