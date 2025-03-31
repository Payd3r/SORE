declare module 'node-vision' {
  interface ClassificationResult {
    className: string;
    probability: number;
  }

  function classify(buffer: Buffer): Promise<ClassificationResult[]>;
  
  export default {
    classify
  };
} 