import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in the .env file.");
  process.exit(1);
}

export const generateToken = (payload: object, expiresIn: string = process.env.JWT_EXPIRES_IN || '1d') => {

  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn } as any);
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as { id: string };
};