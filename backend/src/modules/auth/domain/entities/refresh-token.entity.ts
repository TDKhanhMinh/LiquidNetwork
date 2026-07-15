export interface IRefreshToken {
  _id?: any;
  userId: string;
  token: string;
  expiresAt: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  userAgent?: string;
  ipAddress?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
