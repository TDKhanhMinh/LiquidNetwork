export interface ITokenService {
  generateAccessToken(payload: any): string;
  generateRefreshToken(userId: string): string;
  hashRefreshToken(token: string): Promise<string>;
  verifyRefreshToken(token: string, hash: string): Promise<boolean>;
}
