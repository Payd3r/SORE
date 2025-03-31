import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    coupleId: number;
  };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(403).json({ error: 'Token non fornito' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
        id: string;
        email: string;
        coupleId: number;
      };

      req.user = decoded;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(403).json({ error: 'Token non valido o scaduto' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ error: 'Errore di autenticazione' });
  }
};
