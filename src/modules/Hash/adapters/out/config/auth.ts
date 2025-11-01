type AuthConfig = {
  secret: string;
  expiresIn: `${number}h` | `${number}d`;
};

export default {
  secret: process.env.JWT_SECRET || 'secret',
  expiresIn: '1h',
} as AuthConfig;
