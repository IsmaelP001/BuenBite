import { Injectable } from "@nestjs/common";
import * as jwt from 'jsonwebtoken';

interface SupabaseJWTPayload {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string; // user ID
  email: string;
  phone?: string;
  app_metadata: {
    provider: string;
    providers: string[];
  };
  user_metadata: Record<string, any>;
  role: string;
  aal?: string;
  amr?: Array<{ method: string; timestamp: number }>;
  session_id?: string;
}

@Injectable()
export class JwtService {
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = 'ys3GetutzmLLhYiduBUsGX4QDAohQltB5g9m3ci/+xv7y3C5Qde33hXkb/wvP6CV2TyQYS5cdlgohDxaULXWMw=='
  }

verifyAndDecodeToken(token: string): SupabaseJWTPayload | null {
  try {
    return jwt.verify(token, process.env.SUPABASE_JWT_SECRET!) as SupabaseJWTPayload;
  } catch {
    return null;
  }
}


  extractUserId(token: string): string | null {
    try {
      const decoded = jwt.decode(token) as SupabaseJWTPayload;
      
      if (!decoded || !decoded.sub) {
        return null;
      }

      const now = Math.floor(Date.now() / 1000);
     
      if (decoded.exp < now) {
        return null;
      }

      return decoded.sub;
    } catch (error) {
      return null;
    }
  }

  payloadToUser(payload: SupabaseJWTPayload) {
    return {
      id: payload.sub,
      aud: payload.aud,
      role: payload.role,
      email: payload.email,
      phone: payload.phone,
      app_metadata: payload.app_metadata,
      user_metadata: payload.user_metadata,
      created_at: new Date().toISOString(), 
      updated_at: new Date().toISOString(), 
    };
  }
}