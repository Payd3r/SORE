import { MemoryWithImages } from '../../api/memory';

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
    // Se la riga è vuota, prendi il primo elemento disponibile
    if (currentRow.length === 0) {
      return memories[0];
    }

    // Cerca un elemento che bilanci la riga
    for (const memory of memories) {
      const type = memory.type.toLowerCase();

      // Se non c'è spazio per questo elemento, salta
      if (!canAddToRow(memory)) continue;

      // Se la riga ha già un elemento di questo tipo, salta
      if (hasTypeInRow(type)) continue;

      // Se è un viaggio o un evento e la riga è già piena a metà, salta
      if ((type === 'viaggio' || type === 'evento') && currentRowWidth >= columnsPerRow / 2) continue;

      return memory;
    }

    // Se non troviamo un elemento che bilancia la riga, prendi il primo disponibile
    return memories.find(memory => canAddToRow(memory));
  };

  // Ordina tutti i ricordi per punteggio
  const sortedMemories = [...memories].sort((a, b) => {
    const scoreA = getMemoryScore(a);
    const scoreB = getMemoryScore(b);
    return scoreB - scoreA;
  });

  // Distribuisci i ricordi ordinati
  while (sortedMemories.length > 0) {
    const nextMemory = findNextMemory(sortedMemories);
    
    if (!nextMemory) {
      // Se non possiamo aggiungere più elementi alla riga corrente, completa la riga
      if (currentRow.length > 0) {
        optimizedLayout.push(...currentRow);
        currentRow = [];
        currentRowWidth = 0;
      }
      continue;
    }

    // Rimuovi l'elemento dalla lista dei disponibili
    const index = sortedMemories.indexOf(nextMemory);
    sortedMemories.splice(index, 1);

    // Aggiungi l'elemento alla riga corrente
    currentRow.push(nextMemory);
    currentRowWidth += getItemWidth(nextMemory);

    // Se la riga è piena, completa la riga
    if (currentRowWidth >= columnsPerRow) {
      optimizedLayout.push(...currentRow);
      currentRow = [];
      currentRowWidth = 0;
    }
  }

  // Aggiungi l'ultima riga se non è vuota
  if (currentRow.length > 0) {
    optimizedLayout.push(...currentRow);
  }

  return optimizedLayout;
}; 