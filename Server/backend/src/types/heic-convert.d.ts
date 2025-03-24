declare module 'heic-convert' {
  interface HeicConvertOptions {
    format?: 'JPEG' | 'PNG';
    quality?: number;
  }

  function heicConvert(input: Buffer, options?: HeicConvertOptions): Promise<Buffer>;
  export default heicConvert;
} 