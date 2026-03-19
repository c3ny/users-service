type AuthConfig = {
  secret: string;
  expiresIn: `${number}h` | `${number}d`;
};

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export default {
  secret: process.env.JWT_SECRET,
  expiresIn: '1h',
} as AuthConfig;
