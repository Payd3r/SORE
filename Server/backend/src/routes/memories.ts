import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/db';
import { DbRow, Memory, ResultSetHeader } from '../types/db';

const router = express.Router();

// Get all memories for a couple
router.get('/couples/:coupleId/memories', auth, async (req: any, res) => {
  try {
    const coupleId = parseInt(req.params.coupleId, 10);
    const { category, month, year } = req.query;

    // Verify user belongs to the couple
    if (req.user.coupleId !== coupleId) {
      return res.status(403).json({ error: 'Not authorized to view these memories' });
    }

    let query = `
      SELECT m.*, u.name as created_by_name,
      (SELECT GROUP_CONCAT(
        JSON_OBJECT(
          'id', i.id,
          'url', i.url,
          'description', i.description
        )
      ) FROM images i WHERE i.memory_id = m.id) as images,
      (SELECT GROUP_CONCAT(
        JSON_OBJECT(
          'id', l.id,
          'name', l.name,
          'latitude', l.latitude,
          'longitude', l.longitude
        )
      ) FROM locations l WHERE l.memory_id = m.id) as locations
      FROM memories m
      LEFT JOIN users u ON m.created_by_user_id = u.id
      WHERE m.couple_id = ?`;

    const queryParams = [coupleId];
    let paramCount = 2;

    if (category) {
      query += ` AND m.category = ?`;
      queryParams.push(category);
      paramCount++;
    }

    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM m.date) = ? AND EXTRACT(YEAR FROM m.date) = ?`;
      queryParams.push(parseInt(month as string), parseInt(year as string));
      paramCount += 2;
    }

    query += ' ORDER BY m.date DESC';

    const [rows] = await pool.promise().query<Memory[]>(query, queryParams);

    // Process the results
    const processedMemories = rows.map(memory => ({
      ...memory,
      images: memory.images ? memory.images.split(',').map((img: string) => JSON.parse(img)) : [],
      locations: memory.locations ? memory.locations.split(',').map((loc: string) => JSON.parse(loc)) : []
    }));

    res.json({ data: processedMemories });
  } catch (error) {
    console.error('Error fetching memories:', error);
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// Get a single memory
router.get('/memories/:memoryId', auth, async (req: any, res) => {
  try {
    const { memoryId } = req.params;

    const [rows] = await pool.promise().query<Memory[]>(
      `SELECT m.*, u.name as created_by_name,
      (SELECT GROUP_CONCAT(
        JSON_OBJECT(
          'id', i.id,
          'url', i.url,
          'description', i.description,
          'created_by_user_id', i.created_by_user_id
        )
      ) FROM images i WHERE i.memory_id = m.id) as images,
      (SELECT GROUP_CONCAT(
        JSON_OBJECT(
          'id', l.id,
          'name', l.name,
          'latitude', l.latitude,
          'longitude', l.longitude,
          'address', l.address
        )
      ) FROM locations l WHERE l.memory_id = m.id) as locations
      FROM memories m
      LEFT JOIN users u ON m.created_by_user_id = u.id
      WHERE m.id = ?`,
      [memoryId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    const memory = rows[0];

    // Verify user belongs to the couple that owns the memory
    if (req.user.coupleId !== memory.couple_id) {
      return res.status(403).json({ error: 'Not authorized to view this memory' });
    }

    // Process the results
    const processedMemory = {
      ...memory,
      images: memory.images ? memory.images.split(',').map((img: string) => JSON.parse(img)) : [],
      locations: memory.locations ? memory.locations.split(',').map((loc: string) => JSON.parse(loc)) : []
    };

    res.json({ data: processedMemory });
  } catch (error) {
    console.error('Error fetching memory:', error);
    res.status(500).json({ error: 'Failed to fetch memory' });
  }
});

// Create a new memory
router.post('/couples/:coupleId/memories', auth, async (req: any, res) => {
  try {
    const coupleId = parseInt(req.params.coupleId, 10);
    const { title, description, date, category, locations, type } = req.body;

    // Verify user belongs to the couple
    if (parseInt(req.user.coupleId, 10) !== coupleId) {
      return res.status(403).json({ error: 'Not authorized to create memories for this couple' });
    }

    // Start a transaction
    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      // Create memory
      const [memoryResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO memories (
          title,
          description,
          date,
          category,
          type,
          couple_id,
          created_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, description, date, category, type, coupleId, req.user.id]
      );

      const memoryId = memoryResult.insertId;

      // Add locations if provided
      if (locations && locations.length > 0) {
        for (const location of locations) {
          await connection.query<ResultSetHeader>(
            `INSERT INTO locations (
              name,
              latitude,
              longitude,
              address,
              memory_id
            ) VALUES (?, ?, ?, ?, ?)`,
            [
              location.name,
              location.latitude,
              location.longitude,
              location.address,
              memoryId
            ]
          );
        }
      }

      await connection.commit();

      // Fetch the created memory
      const [rows] = await connection.query<Memory[]>(
        `SELECT m.*, u.name as created_by_name
         FROM memories m
         LEFT JOIN users u ON m.created_by_user_id = u.id
         WHERE m.id = ?`,
        [memoryId]
      );

      res.status(201).json({ data: rows[0] });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating memory:', error);
    res.status(500).json({ error: 'Failed to create memory' });
  }
});

// Update a memory
router.put('/memories/:memoryId', auth, async (req: any, res) => {
  try {
    const { memoryId } = req.params;
    const { title, description, date, category, locations } = req.body;

    // Get memory details
    const [memoryResult] = await pool.promise().query<Memory[]>(
      'SELECT * FROM memories WHERE id = ?',
      [memoryId]
    );

    if (memoryResult.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    const memory = memoryResult[0];

    // Verify user belongs to the couple that owns the memory
    if (req.user.coupleId !== memory.couple_id) {
      return res.status(403).json({ error: 'Not authorized to update this memory' });
    }

    // Start a transaction
    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      // Update memory
      const [result] = await connection.query<ResultSetHeader>(
        `UPDATE memories
         SET title = IFNULL(?, title),
             description = IFNULL(?, description),
             date = IFNULL(?, date),
             category = IFNULL(?, category),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [title, description, date, category, memoryId]
      );

      // Update locations if provided
      if (locations) {
        // Delete existing locations
        await connection.query<ResultSetHeader>('DELETE FROM locations WHERE memory_id = ?', [memoryId]);

        // Add new locations
        for (const location of locations) {
          await connection.query<ResultSetHeader>(
            `INSERT INTO locations (
              name,
              latitude,
              longitude,
              address,
              memory_id
            ) VALUES (?, ?, ?, ?, ?)`,
            [
              location.name,
              location.latitude,
              location.longitude,
              location.address,
              memoryId
            ]
          );
        }
      }

      await connection.commit();

      // Fetch the complete memory with locations
      const [updatedResult] = await connection.query<Memory[]>(
        `SELECT m.*, u.name as created_by_name,
        (SELECT GROUP_CONCAT(
          JSON_OBJECT(
            'id', l.id,
            'name', l.name,
            'latitude', l.latitude,
            'longitude', l.longitude,
            'address', l.address
          )
        ) FROM locations l WHERE l.memory_id = m.id) as locations
        FROM memories m
        LEFT JOIN users u ON m.created_by_user_id = u.id
        WHERE m.id = ?`,
        [memoryId]
      );

      res.json({ data: updatedResult[0] });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating memory:', error);
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

// Delete a memory
router.delete('/memories/:memoryId', auth, async (req: any, res) => {
  try {
    const { memoryId } = req.params;

    // Get memory details
    const [memoryResult] = await pool.promise().query<Memory[]>(
      'SELECT * FROM memories WHERE id = ?',
      [memoryId]
    );

    if (memoryResult.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    const memory = memoryResult[0];

    // Verify user belongs to the couple that owns the memory
    if (req.user.coupleId !== memory.couple_id) {
      return res.status(403).json({ error: 'Not authorized to delete this memory' });
    }

    // Start a transaction
    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      // Delete associated locations
      await connection.query<ResultSetHeader>('DELETE FROM locations WHERE memory_id = ?', [memoryId]);

      // Delete associated images
      await connection.query<ResultSetHeader>('DELETE FROM images WHERE memory_id = ?', [memoryId]);

      // Delete the memory
      await connection.query<ResultSetHeader>('DELETE FROM memories WHERE id = ?', [memoryId]);

      await connection.commit();

      res.json({ message: 'Memory deleted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

export default router;