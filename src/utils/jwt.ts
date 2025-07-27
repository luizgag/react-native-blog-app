import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  userId: number;
  userName: string;
  userType: string;
  exp: number;
  iat: number;
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}

export function getUserFromToken(token: string): { id: number; userType: string } | null {
  try {
    const decoded = decodeToken(token);
    if (!decoded) return null;

    return {
      id: decoded.userId,
      userType: decoded.userType,
    };
  } catch {
    return null;
  }
}