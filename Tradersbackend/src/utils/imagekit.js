const ImageKit = require('imagekit');

let imagekit;

if (process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT) {
    imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
} else {
    console.warn("⚠️ ImageKit environment variables are missing. Image uploads will not work.");
    imagekit = {
        upload: async () => { throw new Error("ImageKit not configured"); },
        deleteFile: async () => { console.warn("ImageKit not configured, cannot delete file"); }
    };
}

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
