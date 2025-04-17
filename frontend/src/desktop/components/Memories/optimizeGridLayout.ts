import { MemoryWithImages } from '../../../api/memory';

export const optimizeGridLayout = (memories: MemoryWithImages[], windowWidth: number) => {
  // Calcola quanti elementi per riga in base alla viewport
  const getColumnsPerRow = () => {
    if (windowWidth >= 1536) return 6; // 2xl
    if (windowWidth >= 1280) return 5; // xl
    if (windowWidth >= 1024) return 4; // lg
    if (windowWidth >= 640) return 2; // sm
    return 1; // mobile
  };

  const columnsPerRow = getColumnsPerRow();
  let currentRow: MemoryWithImages[] = [];
  let optimizedLayout: MemoryWithImages[] = [];
  let currentRowWidth = 0;

  // --- NUOVA LOGICA: separa i futuri dagli altri ---
  const futuri = memories.filter(m => m.type.toLowerCase() === 'futuro')
    .sort((a, b) => {
      // Ordina per data crescente, se non c'è data metti in fondo
      const dateA = a.start_date || a.created_at;
      const dateB = b.start_date || b.created_at;
      if (!a.start_date && b.start_date) return 1;
      if (a.start_date && !b.start_date) return -1;
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  const altri = memories.filter(m => m.type.toLowerCase() !== 'futuro');

  // Funzione per ottenere la larghezza di un elemento
  const getItemWidth = (memory: MemoryWithImages) => {
    return memory.type.toLowerCase() === 'viaggio' || memory.type.toLowerCase() === 'evento' ? 2 : 1;
  };

  // Funzione per calcolare il punteggio di priorità di un ricordo
  const getMemoryScore = (memory: MemoryWithImages) => {
    const now = new Date().getTime();
    const memoryDate = new Date(memory.start_date || memory.created_at).getTime();
    const daysDifference = Math.abs(now - memoryDate) / (1000 * 60 * 60 * 24);

    // Punteggio base per tipo
    let score = memory.type.toLowerCase() === 'viaggio' ? 100 :
      memory.type.toLowerCase() === 'evento' ? 50 : 25;

    // Bonus per ricordi recenti (ultimi 7 giorni)
    if (daysDifference <= 7) {
      score += 50;
    }
    // Bonus per ricordi dell'ultimo mese
    else if (daysDifference <= 30) {
      score += 25;
    }
    // Bonus per ricordi degli ultimi 3 mesi
    else if (daysDifference <= 90) {
      score += 10;
    }

    // Bonus per ricordi con più foto
    if (memory.tot_img > 1) {
      score += Math.min(memory.tot_img * 2, 20); // Max 20 punti di bonus per le foto
    }

    // Bonus per ricordi con location
    if (memory.location) {
      score += 5;
    }

    // Bonus per viaggi con canzone
    if (memory.type.toLowerCase() === 'viaggio' && memory.song) {
      score += 10;
    }

    return score;
  };

  // Funzione per verificare se un elemento può essere aggiunto alla riga corrente
  const canAddToRow = (memory: MemoryWithImages) => {
    const width = getItemWidth(memory);
    return currentRowWidth + width <= columnsPerRow;
  };

  // Funzione per verificare se la riga ha già un elemento di un certo tipo
  const hasTypeInRow = (type: string) => {
    return currentRow.some(memory => memory.type.toLowerCase() === type.toLowerCase());
  };

  // Funzione per trovare il prossimo elemento da aggiungere
  const findNextMemory = (memories: MemoryWithImages[]) => {
    if (currentRow.length === 0) {
      return memories[0];
    }
    for (const memory of memories) {
      const type = memory.type.toLowerCase();
      if (!canAddToRow(memory)) continue;
      if (hasTypeInRow(type)) continue;
      if ((type === 'viaggio' || type === 'evento') && currentRowWidth >= columnsPerRow / 2) continue;
      return memory;
    }
    return memories.find(memory => canAddToRow(memory));
  };

  // --- Applica la logica di grid PRIMA ai futuri, poi agli altri ---
  function distribuisci(memoriesToDistribute: MemoryWithImages[]) {
    // Funzione identica a quella già presente, ma applicata a un array specifico
    // Ordina tutti i ricordi per punteggio (solo per "altri")
    const sortedMemories = memoriesToDistribute === altri
      ? [...memoriesToDistribute].sort((a, b) => {
          const scoreA = getMemoryScore(a);
          const scoreB = getMemoryScore(b);
          return scoreB - scoreA;
        })
      : [...memoriesToDistribute]; // I futuri sono già ordinati
    while (sortedMemories.length > 0) {
      const nextMemory = findNextMemory(sortedMemories);
      if (!nextMemory) {
        if (currentRow.length > 0) {
          optimizedLayout.push(...currentRow);
          currentRow = [];
          currentRowWidth = 0;
        }
        continue;
      }
      const index = sortedMemories.indexOf(nextMemory);
      sortedMemories.splice(index, 1);
      currentRow.push(nextMemory);
      currentRowWidth += getItemWidth(nextMemory);
      if (currentRowWidth >= columnsPerRow) {
        optimizedLayout.push(...currentRow);
        currentRow = [];
        currentRowWidth = 0;
      }
    }
    if (currentRow.length > 0) {
      optimizedLayout.push(...currentRow);
      currentRow = [];
      currentRowWidth = 0;
    }
  }

  // Prima i futuri, poi gli altri
  distribuisci(futuri);
  distribuisci(altri);

  return optimizedLayout;
}; 