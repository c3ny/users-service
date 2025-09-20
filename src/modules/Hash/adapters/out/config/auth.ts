type AuthConfig = {
  secret: string;
  expiresIn: `${number}h`;
};

export default {
  secret: process.env.JWT_SECRET || 'secret',
  expiresIn: '1h',
} as AuthConfig;
