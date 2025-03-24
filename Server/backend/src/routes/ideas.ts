import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/db';
import { Idea, IdeaWithTasks, ProcessedIdea, ResultSetHeader } from '../types/db';

const router = express.Router();

// Get all ideas for a couple
router.get('/couples/:coupleId/ideas', auth, async (req: any, res) => {
  try {
    const coupleId = parseInt(req.params.coupleId, 10);

    // Verify user belongs to the couple
    if (req.user.coupleId !== coupleId) {
      return res.status(403).json({ error: 'Not authorized to view these ideas' });
    }

    const [ideas] = await pool.promise().query<IdeaWithTasks[]>(
      `SELECT i.*, u.name as created_by_name,
       (SELECT COUNT(*) FROM ideas i2 WHERE i2.couple_id = ? AND i2.category = 'challenge') as total_tasks,
       (SELECT COUNT(*) FROM ideas i2 WHERE i2.couple_id = ? AND i2.category = 'challenge' AND i2.checked = true) as completed_tasks,
       (SELECT GROUP_CONCAT(
         JSON_OBJECT(
           'id', i2.id,
           'title', i2.title,
           'description', i2.description,
           'due_date', i2.due_date,
           'checked', i2.checked,
           'created_at', i2.created_at,
           'updated_at', i2.updated_at
         )
       ) FROM ideas i2 WHERE i2.couple_id = ? AND i2.category = 'challenge') as tasks
       FROM ideas i
       LEFT JOIN users u ON i.created_by_user_id = u.id
       WHERE i.couple_id = ?
       ORDER BY i.created_at DESC`,
      [coupleId, coupleId, coupleId, coupleId]
    );

    // Process the results to parse the JSON string in tasks
    const processedIdeas: ProcessedIdea[] = ideas.map(idea => ({
      ...idea,
      total_tasks: idea.total_tasks || 0,
      completed_tasks: idea.completed_tasks || 0,
      tasks: idea.tasks ? idea.tasks.split(',').map((task: string) => JSON.parse(task)) : []
    }));

    res.json({ data: processedIdeas });
  } catch (error) {
    console.error('Error fetching ideas:', error);
    res.status(500).json({ error: 'Failed to fetch ideas' });
  }
});

// Get a single idea
router.get('/ideas/:ideaId', auth, async (req: any, res) => {
  try {
    const { ideaId } = req.params;

    const [ideas] = await pool.promise().query<Idea[]>(
      `SELECT i.*, u.name as created_by_name 
       FROM ideas i
       LEFT JOIN users u ON i.created_by_user_id = u.id
       WHERE i.id = ?`,
      [ideaId]
    );

    if (ideas.length === 0) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    const idea = ideas[0];

    // Verify user belongs to the couple that owns the idea
    if (req.user.coupleId !== idea.couple_id) {
      return res.status(403).json({ error: 'Not authorized to view this idea' });
    }

    res.json({ data: idea });
  } catch (error) {
    console.error('Error fetching idea:', error);
    res.status(500).json({ error: 'Failed to fetch idea' });
  }
});

// Create a new idea
router.post('/couples/:coupleId/ideas', auth, async (req: any, res) => {
  try {
    const coupleId = parseInt(req.params.coupleId, 10);
    const { title, description, category, due_date } = req.body;

    // Verify user belongs to the couple
    if (req.user.coupleId !== coupleId) {
      return res.status(403).json({ error: 'Not authorized to create ideas for this couple' });
    }

    const [result] = await pool.promise().query<ResultSetHeader>(
      `INSERT INTO ideas (
        title,
        description,
        category,
        due_date,
        couple_id,
        created_by_user_id,
        checked,
        date_checked
      ) VALUES (?, ?, ?, ?, ?, ?, FALSE, NULL)`,
      [title, description, category, due_date, coupleId, req.user.id]
    );

    const [ideas] = await pool.promise().query<Idea[]>(
      `SELECT i.*, u.name as created_by_name 
       FROM ideas i
       LEFT JOIN users u ON i.created_by_user_id = u.id
       WHERE i.id = ?`,
      [result.insertId]
    );

    res.status(201).json({ data: ideas[0] });
  } catch (error) {
    console.error('Error creating idea:', error);
    res.status(500).json({ error: 'Failed to create idea' });
  }
});

// Update an idea
router.patch('/ideas/:ideaId', auth, async (req: any, res) => {
  try {
    const { ideaId } = req.params;
    const { title, description, category, due_date } = req.body;

    // Get idea details
    const [ideas] = await pool.promise().query<Idea[]>(
      'SELECT * FROM ideas WHERE id = ?',
      [ideaId]
    );

    if (ideas.length === 0) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    const idea = ideas[0];

    // Verify user belongs to the couple that owns the idea
    if (req.user.coupleId !== idea.couple_id) {
      return res.status(403).json({ error: 'Not authorized to update this idea' });
    }

    await pool.promise().query(
      `UPDATE ideas 
       SET title = ?,
           description = ?,
           category = ?,
           due_date = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [title, description, category, due_date, ideaId]
    );

    const [updatedIdeas] = await pool.promise().query<Idea[]>(
      `SELECT i.*, u.name as created_by_name 
       FROM ideas i
       LEFT JOIN users u ON i.created_by_user_id = u.id
       WHERE i.id = ?`,
      [ideaId]
    );

    res.json({ data: updatedIdeas[0] });
  } catch (error) {
    console.error('Error updating idea:', error);
    res.status(500).json({ error: 'Failed to update idea' });
  }
});

// Mark idea as completed
router.patch('/ideas/:ideaId/check', auth, async (req: any, res) => {
  try {
    const { ideaId } = req.params;
    const { checked } = req.body;

    // Get idea details
    const [ideas] = await pool.promise().query<Idea[]>(
      'SELECT * FROM ideas WHERE id = ?',
      [ideaId]
    );

    if (ideas.length === 0) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    const idea = ideas[0];

    // Verify user belongs to the couple that owns the idea
    if (req.user.coupleId !== idea.couple_id) {
      return res.status(403).json({ error: 'Not authorized to update this idea' });
    }

    await pool.promise().query(
      `UPDATE ideas 
       SET checked = ?,
           date_checked = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [checked, checked ? new Date() : null, ideaId]
    );

    const [updatedIdeas] = await pool.promise().query<Idea[]>(
      `SELECT i.*, u.name as created_by_name 
       FROM ideas i
       LEFT JOIN users u ON i.created_by_user_id = u.id
       WHERE i.id = ?`,
      [ideaId]
    );

    res.json({ data: updatedIdeas[0] });
  } catch (error) {
    console.error('Error updating idea:', error);
    res.status(500).json({ error: 'Failed to update idea' });
  }
});

// Delete an idea
router.delete('/ideas/:ideaId', auth, async (req: any, res) => {
  try {
    const { ideaId } = req.params;

    // Get idea details
    const [ideas] = await pool.promise().query<Idea[]>(
      'SELECT * FROM ideas WHERE id = ?',
      [ideaId]
    );

    if (ideas.length === 0) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    const idea = ideas[0];

    // Verify user belongs to the couple that owns the idea
    if (req.user.coupleId !== idea.couple_id) {
      return res.status(403).json({ error: 'Not authorized to delete this idea' });
    }

    await pool.promise().query('DELETE FROM ideas WHERE id = ?', [ideaId]);

    res.json({ message: 'Idea deleted successfully' });
  } catch (error) {
    console.error('Error deleting idea:', error);
    res.status(500).json({ error: 'Failed to delete idea' });
  }
});

export default router;