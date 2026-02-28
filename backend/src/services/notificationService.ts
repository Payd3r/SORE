import pool from '../config/db';
import { ResultSetHeader } from 'mysql2';
import { sendPushToUser } from './pushService';

/**
 * Tipi di notifiche supportate dall'applicazione
 */
export enum NotificationType {
  NEW_MEMORY = 'new_memory',
  NEW_IDEA = 'new_idea',
  IDEA_COMPLETED = 'idea_completed',
  NEW_PHOTOS = 'new_photos',
  UPLOAD_COMPLETED = 'upload_completed',
  MEMORY_ANNIVERSARY = 'memory_anniversary',
  COUPLE_ANNIVERSARY = 'couple_anniversary',
  BIRTHDAY = 'birthday',
  FUTURE_MEMORY_7D = 'future_memory_7d',
  FUTURE_MEMORY_1D = 'future_memory_1d',
  FUTURE_MEMORY_TODAY = 'future_memory_today',
}

/**
 * Interfaccia dati per la creazione di una notifica
 */
export interface NotificationData {
  user_id: number | string;
  title: string;
  body: string;
  url?: string;
  icon?: string;
  /** Tipo per filtraggio e opt-out per tipo in futuro */
  type?: string;
}

/**
 * Crea una nuova notifica nel database
 * @param data Dati della notifica
 * @returns ID della notifica creata
 */
export async function createNotification(data: NotificationData): Promise<number> {
  try {
    // Deduplicazione: evita notifiche duplicate per stesso evento (user + url) nello stesso giorno
    if (data.url) {
      const [existing] = await pool.promise().query(
        `SELECT id FROM notifications 
         WHERE user_id = ? AND url = ? AND DATE(created_at) = CURDATE() 
         LIMIT 1`,
        [data.user_id, data.url]
      );
      if ((existing as any[]).length > 0) {
        return 0; // già inviata oggi, non creare duplicate
      }
    }

    const [result] = await pool.promise().query<ResultSetHeader>(
      `INSERT INTO notifications (user_id, title, body, url, icon, status, type, created_at) 
       VALUES (?, ?, ?, ?, ?, 0, ?, NOW())`,
      [data.user_id, data.title, data.body, data.url || null, data.icon || null, data.type || null]
    );

    // Invia la push in background senza bloccare la creazione notifica su DB.
    void sendPushToUser(data.user_id, {
      title: data.title,
      body: data.body,
      url: data.url,
      icon: data.icon || '/icons/icon-152x152.png',
      notificationId: result.insertId,
      createdAt: new Date().toISOString(),
    });

    return result.insertId;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Crea notifiche per un nuovo ricordo
 * @param creatorName Nome dell'utente che ha creato il ricordo
 * @param memoryId ID del ricordo
 * @param recipientIds Array di ID degli utenti destinatari
 * @returns Array degli ID delle notifiche create
 */
export async function createMemoryNotification(
  creatorName: string, 
  memoryId: number, 
  recipientIds: number[]
): Promise<number[]> {
  try {
    const notificationPromises = recipientIds.map(userId =>
      createNotification({
        user_id: userId,
        title: 'Nuovo ricordo',
        body: `${creatorName} ha creato un nuovo ricordo!`,
        url: `/ricordo/${memoryId}`,
        type: NotificationType.NEW_MEMORY
      })
    );
    
    return Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error creating memory notifications:', error);
    throw error;
  }
}

/**
 * Crea notifiche per una nuova idea
 * @param creatorName Nome dell'utente che ha creato l'idea
 * @param ideaId ID dell'idea
 * @param recipientIds Array di ID degli utenti destinatari
 * @returns Array degli ID delle notifiche create
 */
export async function createIdeaNotification(
  creatorName: string, 
  ideaId: number, 
  recipientIds: number[]
): Promise<number[]> {
  try {
    const notificationPromises = recipientIds.map(userId =>
      createNotification({
        user_id: userId,
        title: 'Nuova idea',
        body: `${creatorName} ha creato una nuova idea!`,
        url: `/idee/${ideaId}`,
        type: NotificationType.NEW_IDEA
      })
    );
    
    return Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error creating idea notifications:', error);
    throw error;
  }
}

/**
 * Crea notifiche per un'idea completata
 * @param ideaTitle Titolo dell'idea
 * @param ideaId ID dell'idea
 * @param recipientIds Array di ID degli utenti destinatari
 * @returns Array degli ID delle notifiche create
 */
export async function createIdeaCompletedNotification(
  ideaTitle: string,
  ideaId: number,
  recipientIds: number[]
): Promise<number[]> {
  try {
    const notificationPromises = recipientIds.map(userId =>
      createNotification({
        user_id: userId,
        title: 'Idea completata',
        body: `Congratulazioni per aver completato l'idea "${ideaTitle}"!`,
        url: `/idee/${ideaId}`,
        type: NotificationType.IDEA_COMPLETED
      })
    );
    
    return Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error creating idea completed notifications:', error);
    throw error;
  }
}

/**
 * Crea notifiche per nuove foto aggiunte
 * @param uploaderName Nome dell'utente che ha caricato le foto
 * @param count Numero di foto caricate
 * @param recipientIds Array di ID degli utenti destinatari
 * @param memoryId ID del ricordo (opzionale): se presente, l'URL punta a /ricordo/:id invece di /galleria
 * @returns Array degli ID delle notifiche create
 */
export async function createNewPhotosNotification(
  uploaderName: string,
  count: number,
  recipientIds: number[],
  memoryId?: number
): Promise<number[]> {
  try {
    const url = memoryId ? `/ricordo/${memoryId}` : '/galleria';
    const notificationPromises = recipientIds.map(userId =>
      createNotification({
        user_id: userId,
        title: 'Nuove foto',
        body: `${uploaderName} ha aggiunto ${count} ${count === 1 ? 'nuova foto' : 'nuove foto'}!`,
        url,
        type: NotificationType.NEW_PHOTOS
      })
    );

    return Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error creating new photos notifications:', error);
    throw error;
  }
}

/**
 * Crea notifiche per ricordi futuri in scadenza
 * @param memoryTitle Titolo del ricordo
 * @param memoryId ID del ricordo
 * @param recipientIds Array di ID degli utenti destinatari
 * @param daysAhead 7 = tra 7 giorni, 1 = domani, 0 = oggi
 * @returns Array degli ID delle notifiche create
 */
export async function createFutureMemoryReminderNotification(
  memoryTitle: string,
  memoryId: number,
  recipientIds: number[],
  daysAhead: 7 | 1 | 0 = 7
): Promise<number[]> {
  try {
    const { title, body, type } =
      daysAhead === 7
        ? { title: 'Manca una settimana!', body: `Manca una settimana a "${memoryTitle}"!`, type: NotificationType.FUTURE_MEMORY_7D }
        : daysAhead === 1
          ? { title: 'Domani!', body: `Domani: ${memoryTitle}!`, type: NotificationType.FUTURE_MEMORY_1D }
          : { title: 'Oggi!', body: `Oggi è il giorno di "${memoryTitle}"!`, type: NotificationType.FUTURE_MEMORY_TODAY };

    const notificationPromises = recipientIds.map(userId =>
      createNotification({
        user_id: userId,
        title,
        body,
        url: `/ricordo/${memoryId}`,
        type
      })
    );
    return Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error creating future memory reminder notifications:', error);
    throw error;
  }
}

/**
 * Crea notifiche per anniversario di coppia
 * @param coupleName Nome della coppia
 * @param recipientIds Array di ID degli utenti della coppia
 * @returns Array degli ID delle notifiche create
 */
export async function createCoupleAnniversaryNotification(
  coupleName: string,
  recipientIds: number[]
): Promise<number[]> {
  try {
    const notificationPromises = recipientIds.map(userId =>
      createNotification({
        user_id: userId,
        title: 'Buon anniversario!',
        body: `Oggi è un giorno speciale per ${coupleName}. Auguri!`,
        url: `/profilo`,
        type: NotificationType.COUPLE_ANNIVERSARY
      })
    );
    return Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error creating couple anniversary notifications:', error);
    throw error;
  }
}

/**
 * Genera notifiche automatiche basate sul tempo (anniversari, compleanni, ecc.)
 * Da eseguire tramite cron job giornaliero
 * @returns true se l'esecuzione è avvenuta con successo
 */
export async function generateTimeBasedNotifications(): Promise<boolean> {
  try {
    // 1. Anniversari di ricordi (1 anno fa oggi)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const formattedDate = oneYearAgo.toISOString().split('T')[0];
    
    // Trova i ricordi creati esattamente un anno fa
    const [memories] = await pool.promise().query(
      `SELECT m.id, m.title, m.couple_id
       FROM memories m 
       WHERE DATE(m.created_at) = ?`,
      [formattedDate]
    );
    
    // Crea notifiche per ogni ricordo trovato
    for (const memory of (memories as any[])) {
      // Prendi tutti gli utenti della coppia
      const [users] = await pool.promise().query(
        'SELECT id FROM users WHERE couple_id = ?',
        [memory.couple_id]
      );
      const userIds = (users as any[]).map((u: any) => u.id);
      for (const userId of userIds) {
        await createNotification({
          user_id: userId,
          title: '1 anno fa oggi...',
          body: `Ricordi "${memory.title}" di un anno fa?`,
          url: `/ricordo/${memory.id}`,
          type: NotificationType.MEMORY_ANNIVERSARY
        });
      }
    }
    
    // 2. Compleanni (controlla utenti con compleanno oggi) — esegui solo se la colonna esiste
    try {
      const [cols] = await pool
        .promise()
        .query(
          `SELECT COUNT(*) AS cnt
           FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'birthdate'`
        );
      const hasBirthdate = (cols as any[])[0]?.cnt > 0;
      if (hasBirthdate) {
        const [birthdayUsers] = await pool.promise().query(
          `SELECT id, name
             FROM users
            WHERE MONTH(birthdate) = MONTH(CURDATE()) AND DAY(birthdate) = DAY(CURDATE())`
        );
        for (const user of birthdayUsers as any[]) {
          await createNotification({
            user_id: user.id,
            title: 'Buon compleanno!',
            body: `Tanti auguri ${user.name}! Speriamo che tu abbia un meraviglioso compleanno.`,
            url: `/profilo`,
            type: NotificationType.BIRTHDAY
          });
        }
      }
    } catch (birthdateErr) {
      // Se qualcosa va storto (es. colonna mancante), salta silenziosamente i compleanni
    }
    
    // 3. Anniversario coppia (oggi = MONTH+DAY di couples.anniversary_date)
    const [couplesToday] = await pool.promise().query(
      `SELECT c.id, c.name
         FROM couples c
        WHERE MONTH(c.anniversary_date) = MONTH(CURDATE())
          AND DAY(c.anniversary_date) = DAY(CURDATE())`
    );

    for (const couple of couplesToday as any[]) {
      const [users] = await pool.promise().query(
        'SELECT id FROM users WHERE couple_id = ?',
        [couple.id]
      );
      const userIds = (users as any[]).map((u: any) => u.id);
      if (userIds.length > 0) {
        await createCoupleAnniversaryNotification(couple.name, userIds);
      }
    }

    // 4. Ricordi futuri che scadono tra 7 giorni
    const todayObj = new Date();
    const weekAhead = new Date(todayObj);
    weekAhead.setDate(todayObj.getDate() + 7);
    const weekAheadStr = weekAhead.toISOString().split('T')[0];

    const [futureMemories7d] = await pool.promise().query(
      `SELECT m.id, m.title, m.start_date, m.couple_id
         FROM memories m
        WHERE m.type = 'futuro' AND DATE(m.start_date) = ?`,
      [weekAheadStr]
    );

    for (const memory of (futureMemories7d as any[])) {
      const [users] = await pool.promise().query(
        'SELECT id FROM users WHERE couple_id = ?',
        [memory.couple_id]
      );
      const userIds = (users as any[]).map((u: any) => u.id);
      await createFutureMemoryReminderNotification(memory.title, memory.id, userIds, 7);
    }

    // 5. Ricordi futuri domani
    const tomorrow = new Date(todayObj);
    tomorrow.setDate(todayObj.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const [futureMemories1d] = await pool.promise().query(
      `SELECT m.id, m.title, m.start_date, m.couple_id
         FROM memories m
        WHERE m.type = 'futuro' AND DATE(m.start_date) = ?`,
      [tomorrowStr]
    );

    for (const memory of (futureMemories1d as any[])) {
      const [users] = await pool.promise().query(
        'SELECT id FROM users WHERE couple_id = ?',
        [memory.couple_id]
      );
      const userIds = (users as any[]).map((u: any) => u.id);
      await createFutureMemoryReminderNotification(memory.title, memory.id, userIds, 1);
    }

    // 6. Ricordi futuri oggi
    const todayStr = todayObj.toISOString().split('T')[0];

    const [futureMemories0d] = await pool.promise().query(
      `SELECT m.id, m.title, m.start_date, m.couple_id
         FROM memories m
        WHERE m.type = 'futuro' AND DATE(m.start_date) = ?`,
      [todayStr]
    );

    for (const memory of (futureMemories0d as any[])) {
      const [users] = await pool.promise().query(
        'SELECT id FROM users WHERE couple_id = ?',
        [memory.couple_id]
      );
      const userIds = (users as any[]).map((u: any) => u.id);
      await createFutureMemoryReminderNotification(memory.title, memory.id, userIds, 0);
    }

    return true;
  } catch (error) {
    console.error('Error generating time-based notifications:', error);
    return false;
  }
}

/**
 * Conta le notifiche non lette per un utente
 * @param userId ID dell'utente
 * @returns Numero di notifiche non lette
 */
export async function countUnreadNotifications(userId: number | string): Promise<number> {
  try {
    const [result] = await pool.promise().query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND status = 0',
      [userId]
    );
    
    return (result as any[])[0].count || 0;
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    return 0;
  }
} 