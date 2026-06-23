const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const prisma = require('../prismaClient');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';
const CLIENT_ID = '1094295943535-k6dmt5i8mmc114ccod72sp150gpuf33j.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

// Google Login
/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Authenticate with Google
 *     description: Validates a Google ID token and returns a JWT token for the user.
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credential
 *             properties:
 *               credential:
 *                 type: string
 *                 description: The Google ID token received from the Google Sign-In button.
 *     responses:
 *       200:
 *         description: Successfully authenticated. Returns JWT token and user details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for API authentication.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     avatar:
 *                       type: string
 *       400:
 *         description: Missing credential in request body.
 *       401:
 *         description: Invalid Google token.
 */
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Missing credential' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture: avatar } = payload;

    // Find or create user
    let user = await prisma.user.findUnique({ where: { googleId } });
    if (!user) {
      user = await prisma.user.create({
        data: { googleId, email, name, avatar }
      });
    }

    // Issue JWT
    const token = jwt.sign({ id: user.id, email: user.email, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ error: 'Invalid Google token', details: error.message });
  }
});

// Auth middleware for auth routes
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// POST /api/auth/token/automation - Generate/regenerate a 365-day automation token
router.post('/token/automation', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const email = req.user.email;
    const role = req.user.role || 'user';

    const automationToken = jwt.sign(
      { id: userId, email: email, role: role },
      JWT_SECRET,
      { expiresIn: '365d' }
    );

    res.json({ token: automationToken, expiresIn: '365 dias' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
