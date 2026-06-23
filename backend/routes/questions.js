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
 *     Question:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         text:
 *           type: string
 *         type:
 *           type: string
 *         options:
 *           type: string
 *           description: JSON stringified options
 *         correctAnswer:
 *           type: string
 *           description: JSON stringified correct answer(s)
 *         timeLimit:
 *           type: integer
 *         points:
 *           type: integer
 *         userId:
 *           type: integer
 *         quizId:
 *           type: integer
 *           description: ID of the quiz this question belongs to
 */

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Retrieve a list of questions
 *     description: Returns a list of questions belonging to the authenticated user.
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: A list of questions.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *       401:
 *         description: Unauthorized.
 */
// GET questions for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const whereClause = req.user.role === 'admin' ? {} : { userId: req.user.id };
    if (req.query.quizId) {
      whereClause.quizId = parseInt(req.query.quizId);
    }
    const questions = await prisma.question.findMany({ where: whereClause, orderBy: { createdAt: 'desc' } });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Create a new question
 *     description: Creates a new question associated with the authenticated user.
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - type
 *               - options
 *               - correctAnswer
 *             properties:
 *               text:
 *                 type: string
 *               type:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               correctAnswer:
 *                 type: array
 *                 items:
 *                   type: string
 *               timeLimit:
 *                 type: integer
 *               points:
 *                 type: integer
 *               quizId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The created question.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       401:
 *         description: Unauthorized.
 */
// POST new question
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { text, type, options, correctAnswer, timeLimit, points, quizId, theme, mediaUrl } = req.body;
    if (!text || !type || !correctAnswer || (Array.isArray(correctAnswer) && correctAnswer.length === 0)) {
      return res.status(400).json({ error: 'Text, type and correctAnswer are required fields.' });
    }
    
    const normalizedType = type ? type.toUpperCase().replace('-', '_') : 'MULTIPLE_CHOICE';

    const questionData = {
      text,
      type: normalizedType,
      options: JSON.stringify(options || []),
      correctAnswer: JSON.stringify(correctAnswer),
      timeLimit: parseInt(timeLimit) || 20,
      points: parseInt(points) || 1000,
      audioUrl: req.body.audioUrl || null,
      theme: theme || null,
      mediaUrl: mediaUrl || null
    };

    if (req.user && req.user.role !== 'admin') {
      questionData.user = { connect: { id: req.user.id } };
    }

    if (quizId) {
      questionData.quiz = { connect: { id: parseInt(quizId) } };
    }

    const question = await prisma.question.create({
      data: questionData
    });

    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/questions/{id}:
 *   delete:
 *     summary: Delete a question
 *     description: Deletes a specific question by ID. User must own the question or be an admin.
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The question ID
 *     responses:
 *       200:
 *         description: Question deleted successfully.
 *       403:
 *         description: Not authorized to delete this question.
 *       404:
 *         description: Question not found.
 */
// DELETE question
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) return res.status(404).json({ error: 'Question not found' });
    
    if (req.user.role !== 'admin' && question.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this question' });
    }

    await prisma.question.delete({
      where: { id: questionId }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/questions/{id}:
 *   put:
 *     summary: Update a question
 *     description: Updates a specific question by ID. User must own the question or be an admin.
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *               type:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *               correctAnswer:
 *                 type: array
 *                 items:
 *                   type: string
 *               timeLimit:
 *                 type: integer
 *               points:
 *                 type: integer
 *               quizId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: The updated question.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       403:
 *         description: Not authorized to update this question.
 *       404:
 *         description: Question not found.
 */
// UPDATE question
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    const existing = await prisma.question.findUnique({ where: { id: questionId } });
    if (!existing) return res.status(404).json({ error: 'Question not found' });
    
    if (req.user.role !== 'admin' && existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this question' });
    }

    const { text, type, options, correctAnswer, timeLimit, points, quizId, theme, mediaUrl } = req.body;
    if (correctAnswer !== undefined && (!correctAnswer || (Array.isArray(correctAnswer) && correctAnswer.length === 0))) {
      return res.status(400).json({ error: 'correctAnswer cannot be empty.' });
    }
    const normalizedType = type ? type.toUpperCase().replace('-', '_') : 'MULTIPLE_CHOICE';
    const updateData = {
      text: text !== undefined ? text : undefined,
      type: type ? normalizedType : undefined,
      options: options !== undefined ? JSON.stringify(options) : undefined,
      correctAnswer: correctAnswer !== undefined ? JSON.stringify(correctAnswer) : undefined,
      timeLimit: timeLimit !== undefined ? parseInt(timeLimit) : undefined,
      points: points !== undefined ? parseInt(points) : undefined,
      audioUrl: req.body.audioUrl !== undefined ? req.body.audioUrl : undefined,
      theme: theme !== undefined ? theme : undefined,
      mediaUrl: mediaUrl !== undefined ? mediaUrl : undefined
    };

    if (quizId !== undefined) {
      if (quizId === null) {
        updateData.quiz = { disconnect: true };
      } else {
        updateData.quiz = { connect: { id: parseInt(quizId) } };
      }
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: updateData
    });

    res.json(question);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
