import express from 'express';
import { auth } from '../middleware/auth';
import pool from '../config/db';
import { Memory, ResultSetHeader, Image } from '../types/db';
import { RowDataPacket } from 'mysql2';
import fs from 'fs';
import path from 'path';
import { updateMemoryDates } from '../services/memoryDateUpdater';
import { createMemoryNotification } from '../services/notificationService';

const router = express.Router();

// Get all memories for a couple
router.get('/', auth, async (req: any, res) => {
  const imagesQuery = `
      SELECT 
        id, thumb_big_path, webp_path, memory_id, created_at, display_order
      FROM images
      WHERE memory_id IN (?)
      ORDER BY memory_id, 
        CASE WHEN display_order IS NULL THEN 1 ELSE 0 END, 
        display_order ASC, 
        created_at DESC
    `;
  const memoriesQuery = `
      SELECT 
        m.id,
        m.title,
        m.created_at,
        m.type,
        m.start_date,
        m.end_date,
        m.location,
        m.song,
        CASE 
          WHEN m.type = 'VIAGGIO' THEN 4
          WHEN m.type = 'EVENTO' THEN 4
          ELSE 1
        END AS img_limit,
        (SELECT COUNT(*) FROM images WHERE memory_id = m.id) as tot_img
      FROM memories m
      WHERE m.couple_id = ?
      ORDER BY m.created_at DESC
    `;

  try {
    const coupleId = req.user.coupleId;
    //console.log(`[Memories] Fetching memories for couple ${coupleId}`);

    // 1. Prendi le memories
    const [memories] = await pool.promise().query<Memory[]>(memoriesQuery, [coupleId]);

    if (!Array.isArray(memories) || memories.length === 0) {
      return res.json({ data: [] });
    }

    const memoryIds = memories.map((m: Memory) => m.id);

    // 2. Prendi tutte le immagini associate
    const [images] = await pool.promise().query<Image[]>(imagesQuery, [memoryIds]);

    const memoriesWithImages = await Promise.all(memories.map(async (memory: Memory) => {
      // Ordina già per display_order ASC NULLS LAST, poi created_at DESC
      const relatedImages = (images as Image[])
        .filter((img: Image) => img.memory_id === memory.id)
        .slice(0, memory.img_limit);

      const imgagesConParametri = await Promise.all(
        relatedImages.map(async (img: Image, index: number) => {
          // Per i ricordi di tipo Viaggio, la prima immagine avrà webp_path
          if (memory.type.toUpperCase() === 'VIAGGIO' && index === 0) {
            return {
              id: img.id,
              thumb_big_path: null,
              webp_path: img.webp_path || null
            };
          } 
          // Per i ricordi di tipo Semplice, restituisci solo webp_path
          else if (memory.type.toUpperCase() === 'SEMPLICE') {
            return {
              id: img.id,
              thumb_big_path: null,
              webp_path: img.webp_path || null
            };
          } 
          // Per gli eventi o le altre immagini dei viaggi, restituisci thumb_big_path
          else {
            return {
              id: img.id,
              thumb_big_path: img.thumb_big_path || null,
              webp_path: null
            };
          }
        })
      );

      // Filtra le immagini che non hanno una thumbnail o webp valido
      const validImages = imgagesConParametri.filter(img => 
        (img.thumb_big_path !== null || img.webp_path !== null)
      );

      return {
        ...memory,
        images: validImages
      };
    }));

    //console.log(`[Memories] Found ${memoriesWithImages.length} memories`);
    res.json({ data: memoriesWithImages });
  } catch (error) {
    console.error('[Memories] Error fetching memories:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// Get a single memory
router.get('/:memoryId', auth, async (req: any, res) => {
  try {
    const { memoryId } = req.params;
    const coupleId = req.user.coupleId;

    //console.log(`[Memory] Fetching memory ${memoryId} for couple ${coupleId}`);

    // Prima recuperiamo la memory
    const [memoryRows] = await pool.promise().query<Memory[]>(
      `SELECT 
        m.*,
        u.name as created_by_name
      FROM memories m
      LEFT JOIN users u ON m.created_by_user_id = u.id
      WHERE m.id = ?`,
      [memoryId]
    );

    if (memoryRows.length === 0) {
      //console.log(`[Memory] Not found: ${memoryId}`);
      return res.status(404).json({ error: 'Memory not found' });
    }

    const memory = memoryRows[0];

    // Verify user belongs to the couple that owns the memory
    if (req.user.coupleId !== memory.couple_id) {
      //console.log(`[Memory] Unauthorized access: ${memoryId}`);
      return res.status(403).json({ error: 'Not authorized to view this memory' });
    }

    // Poi recuperiamo le immagini associate
    const [imageRows] = await pool.promise().query<Image[]>(
      `SELECT 
        id,
        thumb_big_path,
        webp_path,
        created_at,
        type
      FROM images 
      WHERE memory_id = ?
      ORDER BY created_at DESC`,
      [memoryId]
    );

    const processedMemory: Memory = {
      ...memory,
      images: []
    };

    const processedImages = await Promise.all(
      imageRows.map(async (img: Image) => {
        return {
          id: img.id,
          thumb_big_path: img.thumb_big_path || null,
          webp_path: img.webp_path || null,
          created_at: img.created_at,
          type: img.type
        };
      })
    );

    // Filtra le immagini valide
    processedMemory.images = processedImages.filter((img): img is NonNullable<typeof img> => img !== null);

    //console.log(`[Memory] Found ${processedMemory.images.length} images for memory ${memoryId}`);
    res.json({ data: processedMemory });
  } catch (error) {
    console.error('[Memory] Error fetching memory:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to fetch memory' });
  }
});

// Create a new memory
router.post('/', auth, async (req: any, res) => {
  try {
    const { title, type, location, song } = req.body;
    const coupleId = req.user.coupleId;

    // Validazione campi obbligatori
    if (!title || !type) {
      return res.status(400).json({ error: 'Titolo e tipo sono obbligatori' });
    }

    // Start a transaction
    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      // Create memory with required and optional fields
      const [memoryResult] = await connection.query<ResultSetHeader>(
        `INSERT INTO memories (
          title,
          type,
          couple_id,
          created_by_user_id,
          location,
          song
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          title,
          type,
          coupleId,
          req.user.id,
          location || null,
          song || null
        ]
      );

      const memoryId = memoryResult.insertId;
      //console.log(`[Memory] Created memory ${memoryId}`);

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
        // Create notification for the new memory
        try {
          await createMemoryNotification(
            userResult[0].name,
            memoryId,
            recipientIds
          );
          //console.log(`[Memory] Notification created for memory ${memoryId}`);
        } catch (notificationError) {
          console.error('[Memory] Error creating notification:', notificationError instanceof Error ? notificationError.message : 'Unknown error');
          // We continue even if notification fails
        }
      }

      await connection.commit();

      res.status(201).json({ data: { id: memoryId } });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[Memory] Error creating memory:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to create memory' });
  }
});

// Update a memory
router.put('/:memoryId', auth, async (req: any, res) => {
  try {
    const { memoryId } = req.params;
    const { title, start_date, end_date, location, song } = req.body;
    const coupleId = req.user.coupleId;

    //console.log(`[Memory] Updating memory ${memoryId}`);

    // Get memory details
    const [memoryResult] = await pool.promise().query<Memory[]>(
      'SELECT * FROM memories WHERE id = ?',
      [memoryId]
    );

    if (memoryResult.length === 0) {
      //console.log(`[Memory] Not found: ${memoryId}`);
      return res.status(404).json({ error: 'Memory not found' });
    }

    const memory = memoryResult[0];

    // Verify user belongs to the couple that owns the memory
    if (req.user.coupleId !== memory.couple_id) {
      //console.log(`[Memory] Unauthorized update: ${memoryId}`);
      return res.status(403).json({ error: 'Not authorized to update this memory' });
    }

    // Update memory
    const [result] = await pool.promise().query<ResultSetHeader>(
      `UPDATE memories
       SET title = IFNULL(?, title),
           start_date = IFNULL(?, start_date),
           end_date = IFNULL(?, end_date),
           location = IFNULL(?, location),
           song = IFNULL(?, song),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, start_date, end_date, location, song, memoryId]
    );

    //console.log(`[Memory] Updated memory ${memoryId}`);
    res.json({ message: 'Memory updated successfully' });
  } catch (error) {
    console.error('[Memory] Error updating memory:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

// Delete a memory
router.delete('/:memoryId', auth, async (req: any, res) => {
  try {
    const { memoryId } = req.params;
    const coupleId = req.user.coupleId;

    //console.log(`[Memory] Deleting memory ${memoryId}`);

    // Get memory details
    const [memoryResult] = await pool.promise().query<Memory[]>(
      'SELECT * FROM memories WHERE id = ?',
      [memoryId]
    );

    if (memoryResult.length === 0) {
      //console.log(`[Memory] Not found: ${memoryId}`);
      return res.status(404).json({ error: 'Memory not found' });
    }

    const memory = memoryResult[0];

    // Verify user belongs to the couple that owns the memory
    if (req.user.coupleId !== memory.couple_id) {
      //console.log(`[Memory] Unauthorized delete: ${memoryId}`);
      return res.status(403).json({ error: 'Not authorized to delete this memory' });
    }

    // Start a transaction
    const connection = await pool.promise().getConnection();
    try {
      await connection.beginTransaction();

      // Get all image paths associated with this memory
      const [imagesResult] = await connection.query<Image[]>(
        'SELECT original_path, webp_path, thumb_big_path, thumb_small_path FROM images WHERE memory_id = ?',
        [memoryId]
      );

      // Delete image files locally
      for (const image of imagesResult) {
        const paths = [
          image.original_path,
          image.webp_path,
          image.thumb_big_path,
          image.thumb_small_path
        ];

        for (const imagePath of paths) {
          if (imagePath) {
            const absolutePath = imagePath.startsWith('/media/')
              ? imagePath.substring(7)
              : imagePath.startsWith('media/') || imagePath.startsWith('media\\')
                ? imagePath.substring(6)
                : imagePath;

            const fullPath = path.join(process.cwd(), 'media', absolutePath);
            try {
              if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
              }
            } catch (error) {
              console.error(`[Memory] Failed to delete file ${fullPath}:`, error instanceof Error ? error.message : 'Unknown error');
            }
          }
        }
      }

      const [deleteImagesResult] = await connection.query<ResultSetHeader>(
        'DELETE FROM images WHERE memory_id = ?',
        [memoryId]
      );

      // Delete the memory
      const [deleteMemoryResult] = await connection.query<ResultSetHeader>(
        'DELETE FROM memories WHERE id = ?',
        [memoryId]
      );

      await connection.commit();
      //console.log(`[Memory] Deleted memory ${memoryId} and ${deleteImagesResult.affectedRows} images`);

      res.json({ message: 'Memory deleted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('[Memory] Error deleting memory:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

// Get random images for carousel
router.get('/carousel/:memoryId', auth, async (req: any, res) => {
  try {
    const { memoryId } = req.params;
    const coupleId = req.user.coupleId;

    //console.log(`[Carousel] Fetching images for memory ${memoryId}`);

    // Verifica che la memory esista e appartenga alla coppia
    const [memoryRows] = await pool.promise().query<Memory[]>(
      'SELECT * FROM memories WHERE id = ? AND couple_id = ?',
      [memoryId, coupleId]
    );

    if (memoryRows.length === 0) {
      //console.log(`[Carousel] Memory not found or unauthorized: ${memoryId}`);
      return res.status(404).json({ error: 'Memory not found or not authorized' });
    }

    // Recupera 5 immagini casuali
    const [imageRows] = await pool.promise().query<Image[]>(
      `SELECT 
        webp_path,
        latitude,
        longitude,
        created_at
      FROM images 
      WHERE memory_id = ?
      ORDER BY RAND()
      LIMIT 5`,
      [memoryId]
    );

    const carouselImages = await Promise.all(
      imageRows.map(async (img: Image) => {
        return {
          image: img.webp_path,
          latitude: img.latitude,
          longitude: img.longitude,
          created_at: img.created_at
        };
      })
    );
    // Filtra le immagini valide
    const validImages = carouselImages.filter((img): img is NonNullable<typeof img> => img !== null);
    res.json({ data: validImages });
  } catch (error) {
    console.error('[Carousel] Error fetching images:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to fetch carousel images' });
  }
});

// Update memory dates based on associated images
router.put('/:memoryId/update-dates', auth, async (req: any, res) => {
  try {
    const memoryId = req.params.memoryId;
    const coupleId = req.user.coupleId;

    // Verifica che il memory esista e appartenga alla coppia
    const [memoryResult] = await pool.promise().query<Memory[]>(
      'SELECT id FROM memories WHERE id = ? AND couple_id = ?',
      [memoryId, coupleId]
    );

    if (!memoryResult || memoryResult.length === 0) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    await updateMemoryDates(memoryId);
    res.json({ message: 'Memory dates updated successfully' });

  } catch (error) {
    console.error('[Memory] Error updating dates:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'Failed to update memory dates' });
  }
});

export default router;