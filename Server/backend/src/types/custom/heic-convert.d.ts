declare module 'heic-convert' {
  function heicConvert(buffer: Buffer): Promise<Buffer>;
  export default heicConvert;
} 