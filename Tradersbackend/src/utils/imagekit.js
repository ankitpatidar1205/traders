const ImageKit = require('imagekit');

// ═══════════════════════════════════════════════════════════════════════════
// CHECK IF IMAGEKIT CREDENTIALS ARE PRESENT
// ═══════════════════════════════════════════════════════════════════════════

const credentialsPresent =
    process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT;

let imagekit = null;

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZE IMAGEKIT IF CREDENTIALS EXIST
// ═══════════════════════════════════════════════════════════════════════════

if (credentialsPresent) {
    imagekit = new ImageKit({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
    console.log('✅ ImageKit initialized successfully');
} else {
    console.warn('⚠️ ImageKit credentials missing in .env. Image uploads will not work.');
    imagekit = {
        upload: async () => { throw new Error("ImageKit not configured"); },
        deleteFile: async () => { console.warn("ImageKit not configured, cannot delete file"); }
    };
}

/**
 * Upload a file buffer to ImageKit
 */
const uploadFile = async (fileBuffer, fileName, folder = '/traders/documents') => {
    if (!imagekit) {
        console.error('❌ ImageKit NOT initialized. Cannot upload file.');
        throw new Error('ImageKit credentials missing. Please check backend config.');
    }
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
    if (!imagekit || !fileId) return;
    try {
        await imagekit.deleteFile(fileId);
    } catch (err) {
        console.error('ImageKit delete error:', err.message);
    }
};

module.exports = { imagekit, uploadFile, deleteFile };
