declare module 'heic-convert' {
  interface HeicConvertOptions {
    buffer: Buffer;
    format: 'JPEG' | 'PNG';
    quality?: number;
  }

  function heicConvert(options: HeicConvertOptions): Promise<Buffer>;
  heicConvert.all = (options: HeicConvertOptions) => Promise<Array<{ convert: () => Promise<Buffer> }>>;
  
  export default heicConvert;
} 