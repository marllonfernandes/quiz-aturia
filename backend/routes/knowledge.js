const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, etc. }
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Knowledge:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         userId:
 *           type: integer
 */

/**
 * @swagger
 * /api/knowledge:
 *   get:
 *     summary: Retrieve a list of knowledge entries
 *     description: Returns a list of knowledge entries belonging to the authenticated user.
 *     tags: [Knowledge]
 *     responses:
 *       200:
 *         description: A list of knowledge entries.
 *       401:
 *         description: Unauthorized.
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const knowledge = await prisma.knowledge.findMany({ 
      where: { userId: req.user.id }, 
      orderBy: { createdAt: 'desc' } 
    });
    res.json(knowledge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/knowledge:
 *   post:
 *     summary: Create a new knowledge entry
 *     tags: [Knowledge]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required fields.' });
    }
    
    const knowledgeData = {
      title,
      content,
      userId: req.user.id
    };

    const knowledge = await prisma.knowledge.create({
      data: knowledgeData
    });

    res.json(knowledge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/knowledge/{id}:
 *   delete:
 *     summary: Delete a knowledge entry
 *     tags: [Knowledge]
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const knowledgeId = parseInt(req.params.id);
    const knowledge = await prisma.knowledge.findUnique({ where: { id: knowledgeId } });
    if (!knowledge) return res.status(404).json({ error: 'Knowledge entry not found' });
    
    if (req.user.role !== 'admin' && knowledge.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this knowledge entry' });
    }

    await prisma.knowledge.delete({
      where: { id: knowledgeId }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/knowledge/{id}:
 *   put:
 *     summary: Update a knowledge entry
 *     tags: [Knowledge]
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const knowledgeId = parseInt(req.params.id);
    const existing = await prisma.knowledge.findUnique({ where: { id: knowledgeId } });
    if (!existing) return res.status(404).json({ error: 'Knowledge entry not found' });
    
    if (req.user.role !== 'admin' && existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this knowledge entry' });
    }

    const { title, content } = req.body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;

    const knowledge = await prisma.knowledge.update({
      where: { id: knowledgeId },
      data: updateData
    });

    res.json(knowledge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
