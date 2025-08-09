import pool from '../config/db';
import { ResultSetHeader } from 'mysql2';

/**
 * Tipi di notifiche supportate dall'applicazione
 */
export enum NotificationType {
  NEW_MEMORY = 'new_memory',
  NEW_IDEA = 'new_idea',
  IDEA_COMPLETED = 'idea_completed',
  NEW_PHOTOS = 'new_photos',
  MEMORY_ANNIVERSARY = 'memory_anniversary',
  PERSONAL_ANNIVERSARY = 'personal_anniversary',
  BIRTHDAY = 'birthday',
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
}

/**
 * Crea una nuova notifica nel database
 * @param data Dati della notifica
 * @returns ID della notifica creata
 */
export async function createNotification(data: NotificationData): Promise<number> {
  try {
    const [result] = await pool.promise().query<ResultSetHeader>(
      `INSERT INTO notifications (user_id, title, body, url, icon, status, created_at) 
       VALUES (?, ?, ?, ?, ?, 0, NOW())`,
      [data.user_id, data.title, data.body, data.url || null, data.icon || null]
    );
    
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
        url: `/ricordo/${memoryId}`
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
        url: `/idee/${ideaId}`
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
        url: `/idee/${ideaId}`
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
 * @returns Array degli ID delle notifiche create
 */
export async function createNewPhotosNotification(
  uploaderName: string,
  count: number,
  recipientIds: number[]
): Promise<number[]> {
  try {
    const notificationPromises = recipientIds.map(userId => 
      createNotification({
        user_id: userId,
        title: 'Nuove foto',
        body: `${uploaderName} ha aggiunto ${count} ${count === 1 ? 'nuova foto' : 'nuove foto'}!`,
        url: `/galleria`
      })
    );
    
    return Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error creating new photos notifications:', error);
    throw error;
  }
}

/**
 * Crea notifiche per ricordi futuri in scadenza tra una settimana
 * @param memoryTitle Titolo del ricordo
 * @param memoryId ID del ricordo
 * @param recipientIds Array di ID degli utenti destinatari
 * @returns Array degli ID delle notifiche create
 */
export async function createFutureMemoryReminderNotification(
  memoryTitle: string,
  memoryId: number,
  recipientIds: number[]
): Promise<number[]> {
  try {
    const notificationPromises = recipientIds.map(userId =>
      createNotification({
        user_id: userId,
        title: 'Manca una settimana!',
        body: `Manca una settimana a "${memoryTitle}"!`,
        url: `/ricordo/${memoryId}`
      })
    );
    return Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error creating future memory reminder notifications:', error);
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
          url: `/ricordo/${memory.id}`
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
            url: `/profilo`
          });
        }
      }
    } catch (birthdateErr) {
      // Se qualcosa va storto (es. colonna mancante), salta silenziosamente i compleanni
    }
    
    // 3. Ricordi futuri che scadono tra 7 giorni
    const todayObj = new Date();
    const weekAhead = new Date(todayObj);
    weekAhead.setDate(todayObj.getDate() + 7);
    const weekAheadStr = weekAhead.toISOString().split('T')[0];

    const [futureMemories] = await pool.promise().query(
      `SELECT m.id, m.title, m.start_date, m.couple_id
         FROM memories m
        WHERE m.type = 'futuro' AND DATE(m.start_date) = ?`,
      [weekAheadStr]
    );

    for (const memory of (futureMemories as any[])) {
      // Prendi tutti gli utenti della coppia
      const [users] = await pool.promise().query(
        'SELECT id FROM users WHERE couple_id = ?',
        [memory.couple_id]
      );
      const userIds = (users as any[]).map((u: any) => u.id);
      await createFutureMemoryReminderNotification(memory.title, memory.id, userIds);
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