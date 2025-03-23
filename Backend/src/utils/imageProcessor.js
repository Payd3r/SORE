
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const heicConvert = require('heic-convert');

/**
 * Processes images including HEIC conversion
 */
class ImageProcessor {
  /**
   * Convert HEIC buffer to JPEG buffer
   * @param {Buffer} buffer - HEIC image buffer
   * @returns {Promise<Buffer>} - JPEG image buffer
   */
  static async convertHeicToJpeg(buffer) {
    try {
      console.log('Converting HEIC image to JPEG...');
      const jpegBuffer = await heicConvert({
        buffer: buffer,
        format: 'JPEG',
        quality: 0.9
      });
      return jpegBuffer;
    } catch (error) {
      console.error('Error converting HEIC to JPEG:', error);
      throw new Error('Failed to convert HEIC image');
    }
  }

  /**
   * Process image buffer (convert HEIC if needed)
   * @param {Buffer} buffer - Original image buffer
   * @param {string} originalFilename - Original filename
   * @returns {Promise<{buffer: Buffer, extension: string}>} - Processed buffer and new extension
   */
  static async processImageBuffer(buffer, originalFilename) {
    const isHeic = originalFilename.toLowerCase().endsWith('.heic');
    let processedBuffer = buffer;
    let extension = path.extname(originalFilename);

    if (isHeic) {
      try {
        processedBuffer = await this.convertHeicToJpeg(buffer);
        extension = '.jpg';
      } catch (error) {
        console.error('HEIC conversion error:', error);
        throw error;
      }
    }

    return { buffer: processedBuffer, extension };
  }

  /**
   * Generate thumbnail from image buffer
   * @param {Buffer} buffer - Image buffer
   * @param {string} outputPath - Output path for thumbnail
   * @param {number} width - Thumbnail width
   * @param {number} height - Thumbnail height
   * @returns {Promise<void>}
   */
  static async generateThumbnail(buffer, outputPath, width = 400, height = 400) {
    try {
      await sharp(buffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFile(outputPath);
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw new Error('Failed to generate thumbnail');
    }
  }

  /**
   * Save image buffer to file
   * @param {Buffer} buffer - Image buffer
   * @param {string} outputPath - Output path
   * @returns {Promise<void>}
   */
  static async saveImageToFile(buffer, outputPath) {
    return fs.promises.writeFile(outputPath, buffer);
  }
}

module.exports = ImageProcessor;
