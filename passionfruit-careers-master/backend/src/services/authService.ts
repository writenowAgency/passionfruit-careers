import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../database/config';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface LoginResult {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export class AuthService {
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  async login(email: string, password: string): Promise<LoginResult> {
    try {
      // Find user by email
      const result = await pool.query(
        'SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      const user = result.rows[0];

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password_hash);

      if (!passwordMatch) {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email
        },
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn }
      );

      // Store session
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const tokenHash = await bcrypt.hash(token, 10);
      await pool.query(
        'INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [user.id, tokenHash, expiresAt]
      );

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        }
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login'
      };
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch (error) {
      return null;
    }
  }

  async register(email: string, password: string, firstName: string, lastName: string): Promise<LoginResult> {
    try {
      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return {
          success: false,
          message: 'User already exists'
        };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const result = await pool.query(
        'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name',
        [email, passwordHash, firstName, lastName]
      );

      const user = result.rows[0];

      // Generate token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email
        },
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn }
      );

      return {
        success: true,
        token,
        user
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'An error occurred during registration'
      };
    }
  }
}

export default new AuthService();
