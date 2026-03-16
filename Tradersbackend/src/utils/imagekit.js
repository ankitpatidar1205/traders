const ImageKit = require('imagekit');

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

/**
 * Upload a file buffer to ImageKit
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - Original file name
 * @param {string} folder - Folder path in ImageKit (e.g., '/traders/kyc')
 * @returns {Promise<{url: string, fileId: string, name: string}>}
 */
const uploadFile = async (fileBuffer, fileName, folder = '/traders/documents') => {
    const response = await imagekit.upload({
        file: fileBuffer.toString('base64'),
        fileName: fileName,
        folder: folder,
        useUniqueFileName: true
    });
    return {
        url: response.url,
        fileId: response.fileId,
        name: response.name,
        thumbnailUrl: response.thumbnailUrl
    };
};

/**
 * Delete a file from ImageKit by fileId
 */
const deleteFile = async (fileId) => {
    if (!fileId) return;
    try {
        await imagekit.deleteFile(fileId);
    } catch (err) {
        console.error('ImageKit delete error:', err.message);
    }
};

module.exports = { imagekit, uploadFile, deleteFile };
