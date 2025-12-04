import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import authService from '../services/authService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Login endpoint
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const result = await authService.login(email, password);

    if (result.success) {
      return res.json({
        message: 'Login successful',
        token: result.token,
        user: result.user
      });
    } else {
      return res.status(401).json({ message: result.message });
    }
  }
);

// Register endpoint
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty()
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName } = req.body;
    const result = await authService.register(email, password, firstName, lastName);

    if (result.success) {
      return res.status(201).json({
        message: 'Registration successful',
        token: result.token,
        user: result.user
      });
    } else {
      return res.status(400).json({ message: result.message });
    }
  }
);

// Get current user (protected route)
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  return res.json({ user: req.user });
});

export default router;
