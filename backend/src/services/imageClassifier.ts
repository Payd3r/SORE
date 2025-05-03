import { ImageType } from '../types/db';
import { ImageAnnotatorClient, protos } from '@google-cloud/vision';

// Inizializza il client di Google Cloud Vision
const vision = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

export async function classifyImage(buffer: Buffer): Promise<ImageType> {
  try {
    //console.log('Inizio classificazione immagine...');
    
    // Richiediamo più tipi di analisi contemporaneamente
    const [result] = await vision.annotateImage({
      image: { content: buffer },
      features: [
        { type: 'OBJECT_LOCALIZATION' },
        { type: 'LABEL_DETECTION' },
        { type: 'FACE_DETECTION' },
        { type: 'WEB_DETECTION' }
      ]
    });

 

    // Funzione helper per calcolare il punteggio
    const calculateScore = (keywords: string[], sources: Array<{ description?: string, score?: number } | null | undefined>): number => {
      return sources.reduce((score, item) => {
        if (!item?.description || !item?.score) return score;
        if (keywords.some(keyword => item.description?.toLowerCase().includes(keyword))) {
          //console.log(`Keyword trovata: "${item.description}" con confidenza ${item.score}`);
          return score + item.score;
        }
        return score;
      }, 0);
    };

    // Combiniamo oggetti, label e entità web per l'analisi
    const allSources = [
      ...(result.localizedObjectAnnotations || []).map(obj => ({ 
        description: obj.name, 
        score: obj.score 
      })),
      ...(result.labelAnnotations || []),
      ...(result.webDetection?.webEntities || []).map(entity => ({ 
        description: entity.description, 
        score: entity.score ? entity.score / 1.0 : 0 
      }))
    ];

    // Verifichiamo la presenza di volti
    const faces = result.faceAnnotations || [];
    const numberOfFaces = faces.length;
    //console.log('Numero di volti rilevati:', numberOfFaces);

    // Keywords per ogni categoria
    const personKeywords = [
      'person', 'people', 'human', 'man', 'woman', 'boy', 'girl',
      'face', 'portrait', 'selfie', 'body', 'clothing'
    ];

    const foodKeywords = [
      'food', 'meal', 'dish', 'restaurant', 'cuisine', 'cooking',
      'dinner', 'lunch', 'breakfast', 'pizza', 'pasta', 'dessert',
      'plate', 'kitchen', 'dining'
    ];

    const landscapeKeywords = [
      'landscape', 'nature', 'mountain', 'beach', 'sea', 'ocean',
      'forest', 'park', 'garden', 'sunset', 'sunrise', 'sky',
      'outdoor', 'scenic', 'vista', 'panorama'
    ];

    // Calcoliamo i punteggi
    const personScore = calculateScore(personKeywords, allSources as Array<{ description?: string; score?: number }>);
    const foodScore = calculateScore(foodKeywords, allSources as Array<{ description?: string; score?: number }>);
    const landscapeScore = calculateScore(landscapeKeywords, allSources as Array<{ description?: string; score?: number }>);



    // Soglie di confidenza
    const CONFIDENCE_THRESHOLD = 0.6;

    // Logica di classificazione migliorata
    if (numberOfFaces > 0) {
      if (numberOfFaces >= 2) {
        //console.log('Rilevati più volti, classificazione come COPPIA');
        return ImageType.COUPLE;
      } else {
        //console.log('Rilevato un volto, classificazione come SINGOLO');
        return ImageType.SINGLE;
      }
    }

    if (foodScore > CONFIDENCE_THRESHOLD && foodScore > personScore && foodScore > landscapeScore) {
      //console.log('Punteggio cibo più alto, classificazione come CIBO');
      return ImageType.FOOD;
    }

    if (personScore > CONFIDENCE_THRESHOLD) {
      if (result.webDetection?.webEntities?.some(entity => 
        entity.description?.toLowerCase().includes('couple') ||
        entity.description?.toLowerCase().includes('together') ||
        entity.description?.toLowerCase().includes('wedding')
      )) {
        //console.log('Rilevata coppia dalle entità web, classificazione come COPPIA');
        return ImageType.COUPLE;
      }
      //console.log('Punteggio persona alto, classificazione come SINGOLO');
      return ImageType.SINGLE;
    }

    //console.log('Classificazione default come PAESAGGIO');
    return ImageType.LANDSCAPE;

  } catch (error) {
    console.error('Errore nella classificazione dell\'immagine:', error);
    const imageTypes = Object.values(ImageType);
    const randomType = imageTypes[Math.floor(Math.random() * imageTypes.length)];
    //console.log('Errore nella classificazione, tipo casuale:', randomType);
    return randomType;
  }
} 