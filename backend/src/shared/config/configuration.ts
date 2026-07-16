/**
 * Interface định nghĩa cấu trúc của cấu hình ứng dụng
 * Giúp có Type Safety khi lấy config thông qua ConfigService
 */
export interface AppConfig {
  env: string;
  port: number;
  database: {
    uri: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    origin: string;
  };
  swagger: {
    enabled: boolean;
  };
  throttler: {
    ttl: number;
    limit: number;
  };
  auth: {
    googleEnabled: boolean;
  };
}

/**
 * Hàm configuration trả về object chứa các thông số cấu hình.
 * Các giá trị sẽ được ánh xạ từ biến môi trường (process.env).
 */
export default (): AppConfig => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    uri: process.env.MONGODB_URI || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  swagger: {
    enabled: process.env.ENABLE_SWAGGER !== 'false',
  },
  throttler: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  },
  auth: {
    googleEnabled: process.env.GOOGLE_AUTH_ENABLED === 'true',
  },
});
