import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/db';
import { Idea, IdeaWithTasks, ProcessedIdea, ResultSetHeader } from '../types/db';
import { createIdeaNotification, createIdeaCompletedNotification } from '../services/notificationService';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

// Get all ideas for a couple
router.get('/', auth, async (req: any, res) => {
  try {
    const coupleId = req.user.coupleId;

    const [ideas] = await pool.promise().query<Idea[]>(
      `SELECT 
        i.id,
        i.title,
        i.description,
        i.type,
        i.couple_id,
        i.created_by_user_id,
        i.created_at,
        i.updated_at,
        i.checked,
        i.date_checked,
        u.name as created_by_name
       FROM ideas i
       LEFT JOIN users u ON i.created_by_user_id = u.id
       WHERE i.couple_id = ?
       ORDER BY i.created_at DESC`,
      [coupleId]
    );

    res.json({ data: ideas });
  } catch (error) {
    console.error('Error fetching ideas:', error);
    res.status(500).json({ error: 'Failed to fetch ideas' });
  }
});

// Get a single idea
router.get('/:ideaId', auth, async (req: any, res) => {
  try {
    const { ideaId } = req.params;
    const coupleId = req.user.coupleId;

    const [ideas] = await pool.promise().query<Idea[]>(
      `SELECT 
        i.id,
        i.title,
        i.description,
        i.type,
        i.couple_id,
        i.created_by_user_id,
        i.created_at,
        i.updated_at,
        i.checked,
        i.date_checked,
        u.name as created_by_name
       FROM ideas i
       LEFT JOIN users u ON i.created_by_user_id = u.id
       WHERE i.id = ? AND i.couple_id = ?`,
      [ideaId, coupleId]
    );

    if (ideas.length === 0) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    res.json({ data: ideas[0] });
  } catch (error) {
    console.error('Error fetching idea:', error);
    res.status(500).json({ error: 'Failed to fetch idea' });
  }
});

// Create a new idea
router.post('/', auth, async (req: any, res) => {
  try {
    const coupleId = req.user.coupleId;
    const { title, description, type } = req.body;

    // Start a transaction
    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();
      
      // Create the idea
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO ideas (
          title,
          description,
          type,
          couple_id,
          created_by_user_id,
          checked,
          date_checked
        ) VALUES (?, ?, ?, ?, ?, FALSE, NULL)`,
        [title, description, type, coupleId, req.user.id]
      );

      const [ideas] = await connection.query<Idea[]>(
        `SELECT 
          i.id,
          i.title,
          i.description,
          i.type,
          i.couple_id,
          i.created_by_user_id,
          i.created_at,
          i.updated_at,
          i.checked,
          i.date_checked,
          u.name as created_by_name
         FROM ideas i
         LEFT JOIN users u ON i.created_by_user_id = u.id
         WHERE i.id = ?`,
        [result.insertId]
      );
      
      // Get user name for notification
      const [userResult] = await connection.query<RowDataPacket[]>(
        'SELECT name FROM users WHERE id = ?',
        [req.user.id]
      );
      
      // Get recipient IDs (all users in the couple except creator)
      const [recipientsResult] = await connection.query<RowDataPacket[]>(
        'SELECT id FROM users WHERE couple_id = ? AND id != ?',
        [coupleId, req.user.id]
      );
      
      const recipientIds = recipientsResult.map(row => row.id);
      
      if (recipientIds.length > 0) {
        // Create notification for the new idea
        try {
          await createIdeaNotification(
            userResult[0].name,
            result.insertId,
            recipientIds
          );
          //console.log(`[Idea] Notification created for idea ${result.insertId}`);
        } catch (notificationError) {
          console.error('[Idea] Error creating notification:', notificationError instanceof Error ? notificationError.message : 'Unknown error');
          // We continue even if notification fails
        }
      }
      
      await connection.commit();
      
      res.status(201).json({ data: ideas[0] });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating idea:', error);
    res.status(500).json({ error: 'Failed to create idea' });
  }
});

// Update an idea
router.put('/:ideaId', auth, async (req: any, res) => {
  try {
    const { ideaId } = req.params;
    const coupleId = req.user.coupleId;
    const { title, description } = req.body;

    // Get idea details
    const [ideas] = await pool.promise().query<Idea[]>(
      `SELECT 
        id,
        title,
        description,
        type,
        couple_id,
        created_by_user_id,
        created_at,
        updated_at,
        checked,
        date_checked
       FROM ideas 
       WHERE id = ? AND couple_id = ?`,
      [ideaId, coupleId]
    );

    if (ideas.length === 0) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    await pool.promise().query(
      `UPDATE ideas 
       SET title = ?,
           description = ?,
           updated_at = NOW()
       WHERE id = ? AND couple_id = ?`,
      [title, description, ideaId, coupleId]
    );

    const [updatedIdeas] = await pool.promise().query<Idea[]>(
      `SELECT 
        i.id,
        i.title,
        i.description,
        i.type,
        i.couple_id,
        i.created_by_user_id,
        i.created_at,
        i.updated_at,
        i.checked,
        i.date_checked,
        u.name as created_by_name
       FROM ideas i
       LEFT JOIN users u ON i.created_by_user_id = u.id
       WHERE i.id = ? AND i.couple_id = ?`,
      [ideaId, coupleId]
    );

    res.json({ data: updatedIdeas[0] });
  } catch (error) {
    console.error('Error updating idea:', error);
    res.status(500).json({ error: 'Failed to update idea' });
  }
});

// Mark idea as completed
router.put('/:ideaId/check', auth, async (req: any, res) => {
  try {
    const { ideaId } = req.params;
    const coupleId = req.user.coupleId;
    const { checked } = req.body;

    // Start a transaction
    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();
      
      // Get idea details
      const [ideas] = await connection.query<Idea[]>(
        `SELECT 
          id,
          title,
          description,
          type,
          couple_id,
          created_by_user_id,
          created_at,
          updated_at,
          checked,
          date_checked
         FROM ideas 
         WHERE id = ? AND couple_id = ?`,
        [ideaId, coupleId]
      );

      if (ideas.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ error: 'Idea not found' });
      }

      await connection.query(
        `UPDATE ideas 
         SET checked = ?,
             date_checked = ?,
             updated_at = NOW()
         WHERE id = ? AND couple_id = ?`,
        [checked, checked ? new Date() : null, ideaId, coupleId]
      );

      const [updatedIdeas] = await connection.query<Idea[]>(
        `SELECT 
          i.id,
          i.title,
          i.description,
          i.type,
          i.couple_id,
          i.created_by_user_id,
          i.created_at,
          i.updated_at,
          i.checked,
          i.date_checked,
          u.name as created_by_name
         FROM ideas i
         LEFT JOIN users u ON i.created_by_user_id = u.id
         WHERE i.id = ? AND i.couple_id = ?`,
        [ideaId, coupleId]
      );
      
      // Se l'idea è stata completata (checked = true), invia la notifica
      if (checked) {
        // Get all users in the couple
        const [usersResult] = await connection.query<RowDataPacket[]>(
          'SELECT id FROM users WHERE couple_id = ?',
          [coupleId]
        );
        
        const allUserIds = usersResult.map(row => row.id);
        
        if (allUserIds.length > 0) {
          // Create notification for all members about the completed idea
          try {
            await createIdeaCompletedNotification(
              updatedIdeas[0].title,
              parseInt(ideaId),
              allUserIds
            );
            //console.log(`[Idea] Completion notification created for idea ${ideaId}`);
          } catch (notificationError) {
            console.error('[Idea] Error creating completion notification:', notificationError instanceof Error ? notificationError.message : 'Unknown error');
            // We continue even if notification fails
          }
        }
      }
      
      await connection.commit();
      
      res.json({ data: updatedIdeas[0] });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating idea:', error);
    res.status(500).json({ error: 'Failed to update idea' });
  }
});

// Delete an idea
router.delete('/:ideaId', auth, async (req: any, res) => {
  try {
    const { ideaId } = req.params;
    const coupleId = req.user.coupleId;

    // Get idea details
    const [ideas] = await pool.promise().query<Idea[]>(
      `SELECT 
        id,
        title,
        description,
        type,
        couple_id,
        created_by_user_id,
        created_at,
        updated_at,
        checked,
        date_checked
       FROM ideas 
       WHERE id = ? AND couple_id = ?`,
      [ideaId, coupleId]
    );

    if (ideas.length === 0) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    await pool.promise().query(
      'DELETE FROM ideas WHERE id = ? AND couple_id = ?', 
      [ideaId, coupleId]
    );

    res.json({ message: 'Idea deleted successfully' });
  } catch (error) {
    console.error('Error deleting idea:', error);
    res.status(500).json({ error: 'Failed to delete idea' });
  }
});

export default router;