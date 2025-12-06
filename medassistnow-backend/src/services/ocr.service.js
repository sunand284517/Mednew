/**
 * OCR Service
 * Extract text from images using Tesseract.js
 */

const Tesseract = require('tesseract.js');

/**
 * Extract text from base64 encoded image
 * @param {String} imageData - Base64 encoded image
 * @returns {String} - Extracted text
 */
const extractTextFromImage = async (imageData) => {
  try {
    // Remove data URL prefix if present
    let base64Data = imageData;
    if (imageData.includes('base64,')) {
      base64Data = imageData.split('base64,')[1];
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Perform OCR
    const { data: { text } } = await Tesseract.recognize(
      imageBuffer,
      'eng', // English language
      {
        logger: info => console.log('OCR Progress:', info.status, info.progress)
      }
    );

    return text.trim();

  } catch (error) {
    console.error('OCR extraction error:', error);
    throw new Error('Failed to extract text from image');
  }
};

/**
 * Extract text from image URL
 * @param {String} imageUrl - URL of the image
 * @returns {String} - Extracted text
 */
const extractTextFromImageUrl = async (imageUrl) => {
  try {
    const { data: { text } } = await Tesseract.recognize(
      imageUrl,
      'eng',
      {
        logger: info => console.log('OCR Progress:', info.status, info.progress)
      }
    );

    return text.trim();

  } catch (error) {
    console.error('OCR extraction error:', error);
    throw new Error('Failed to extract text from image URL');
  }
};

module.exports = {
  extractTextFromImage,
  extractTextFromImageUrl
};
