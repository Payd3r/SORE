import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/db';
import { DbRow, Location, ResultSetHeader } from '../types/db';

const router = express.Router();

// Get all locations for a memory
router.get('/memories/:memoryId/locations', auth, async (req: any, res) => {
  try {
    const { memoryId } = req.params;

    // Get memory details to verify ownership
    const [memoryResult] = await pool.promise().query<DbRow[]>(
      'SELECT couple_id FROM memories WHERE id = ?',
      [memoryId]
    );

    if (memoryResult.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    // Verify user belongs to the couple that owns the memory
    if (req.user.coupleId !== memoryResult[0].couple_id) {
      return res.status(403).json({ error: 'Not authorized to view these locations' });
    }

    const [rows] = await pool.promise().query<Location[]>(
      `SELECT l.* FROM locations l
       WHERE l.memory_id = ?
       ORDER BY l.name ASC`,
      [memoryId]
    );

    res.json({ data: rows });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Get a single location
router.get('/locations/:locationId', auth, async (req: any, res) => {
  try {
    const { locationId } = req.params;

    const [rows] = await pool.promise().query<Location[]>(
      `SELECT l.*, m.couple_id 
       FROM locations l
       JOIN memories m ON l.memory_id = m.id
       WHERE l.id = ?`,
      [locationId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const location = rows[0];

    // Verify user belongs to the couple that owns the memory
    if (req.user.coupleId !== location.couple_id) {
      return res.status(403).json({ error: 'Not authorized to view this location' });
    }

    res.json({ data: location });
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// Create a location for a memory
router.post('/memories/:memoryId/locations', auth, async (req: any, res) => {
  try {
    const { memoryId } = req.params;
    const { name, latitude, longitude, address } = req.body;

    // Get memory details to verify ownership
    const [memoryResult] = await pool.promise().query<DbRow[]>(
      'SELECT couple_id FROM memories WHERE id = ?',
      [memoryId]
    );

    if (memoryResult.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    // Verify user belongs to the couple that owns the memory
    if (req.user.coupleId !== memoryResult[0].couple_id) {
      return res.status(403).json({ error: 'Not authorized to add locations to this memory' });
    }

    const [result] = await pool.promise().query<ResultSetHeader>(
      `INSERT INTO locations (
        name,
        latitude,
        longitude,
        address,
        memory_id
      ) VALUES (?, ?, ?, ?, ?)`,
      [name, latitude, longitude, address, memoryId]
    );

    const locationId = result.insertId;

    // Fetch the created location
    const [rows] = await pool.promise().query<Location[]>(
      `SELECT l.* FROM locations l WHERE l.id = ?`,
      [locationId]
    );

    res.status(201).json({ data: rows[0] });
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// Update a location
router.put('/locations/:locationId', auth, async (req: any, res) => {
  try {
    const { locationId } = req.params;
    const { name, latitude, longitude, address } = req.body;

    // Get location and memory details
    const [locationResult] = await pool.promise().query<Location[]>(
      `SELECT l.*, m.couple_id 
       FROM locations l
       JOIN memories m ON l.memory_id = m.id
       WHERE l.id = ?`,
      [locationId]
    );

    if (locationResult.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const location = locationResult[0];

    // Verify user belongs to the couple that owns the memory
    if (req.user.coupleId !== location.couple_id) {
      return res.status(403).json({ error: 'Not authorized to update this location' });
    }

    const [result] = await pool.promise().query<ResultSetHeader>(
      `UPDATE locations
       SET name = IFNULL(?, name),
           latitude = IFNULL(?, latitude),
           longitude = IFNULL(?, longitude),
           address = IFNULL(?, address),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, latitude, longitude, address, locationId]
    );

    // Fetch the updated location
    const [rows] = await pool.promise().query<Location[]>(
      `SELECT l.* FROM locations l WHERE l.id = ?`,
      [locationId]
    );

    res.json({ data: rows[0] });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Delete a location
router.delete('/locations/:locationId', auth, async (req: any, res) => {
  try {
    const { locationId } = req.params;

    // Get location and memory details
    const [locationResult] = await pool.promise().query<Location[]>(
      `SELECT l.*, m.couple_id 
       FROM locations l
       JOIN memories m ON l.memory_id = m.id
       WHERE l.id = ?`,
      [locationId]
    );

    if (locationResult.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const location = locationResult[0];

    // Verify user belongs to the couple that owns the memory
    if (req.user.coupleId !== location.couple_id) {
      return res.status(403).json({ error: 'Not authorized to delete this location' });
    }

    await pool.promise().query<ResultSetHeader>('DELETE FROM locations WHERE id = ?', [locationId]);

    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

export default router;