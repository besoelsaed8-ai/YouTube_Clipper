/**
 * Cloud Storage Service
 * Supports: AWS S3, Cloudflare R2, MinIO
 * Zero egress fees with Cloudflare R2
 */

const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

// ═══════════════════════════════════════════════════════════════
// S3 CLIENT CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const s3Config = {
    region: process.env.AWS_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT || process.env.CLOUDFLARE_R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true, // Required for S3-compatible services
};

const BUCKET_NAME = process.env.S3_BUCKET || process.env.R2_BUCKET || 'youtube-clipper';
const PUBLIC_URL = process.env.S3_PUBLIC_URL || process.env.R2_PUBLIC_URL || '';

const s3Client = new S3Client(s3Config);

// ═══════════════════════════════════════════════════════════════
// UPLOAD
// ═══════════════════════════════════════════════════════════════

/**
 * Upload a file to cloud storage
 * @param {string} filePath - Local file path
 * @param {string} folder - Folder in bucket (e.g., 'clips', 'temp')
 * @returns {string} Public URL of uploaded file
 */
async function uploadToCloud(filePath, folder = 'clips') {
    const fileBuffer = await fs.readFile(filePath);
    const fileName = `${folder}/${uuidv4()}${path.extname(filePath)}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: getContentType(filePath),
        Metadata: {
            'uploaded-at': new Date().toISOString(),
        },
    });

    await s3Client.send(command);

    const url = PUBLIC_URL
        ? `${PUBLIC_URL}/${fileName}`
        : `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

    console.log(`[Cloud] Uploaded: ${fileName}`);
    return url;
}

/**
 * Upload a buffer to cloud storage
 */
async function uploadBufferToCloud(buffer, fileName, folder = 'clips', contentType = 'video/mp4') {
    const key = `${folder}/${uuidv4()}_${fileName}`;

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    });

    await s3Client.send(command);

    const url = PUBLIC_URL
        ? `${PUBLIC_URL}/${key}`
        : `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;

    console.log(`[Cloud] Uploaded buffer: ${key}`);
    return url;
}

// ═══════════════════════════════════════════════════════════════
// DOWNLOAD
// ═══════════════════════════════════════════════════════════════

/**
 * Download a file from cloud storage
 * @param {string} key - Object key in bucket
 * @param {string} outputPath - Local path to save to
 */
async function downloadFromCloud(key, outputPath) {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    const response = await s3Client.send(command);
    const body = await response.Body.transformToByteArray();
    await fs.writeFile(outputPath, body);

    console.log(`[Cloud] Downloaded: ${key}`);
    return outputPath;
}

/**
 * Get a presigned URL for temporary access
 */
async function getPresignedUrl(key, expiresIn = 3600) {
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
}

// ═══════════════════════════════════════════════════════════════
// DELETE
// ═══════════════════════════════════════════════════════════════

/**
 * Delete a file from cloud storage
 */
async function deleteFromCloud(key) {
    const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    });

    await s3Client.send(command);
    console.log(`[Cloud] Deleted: ${key}`);
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const types = {
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.ogg': 'video/ogg',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
    };
    return types[ext] || 'application/octet-stream';
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
    uploadToCloud,
    uploadBufferToCloud,
    downloadFromCloud,
    getPresignedUrl,
    deleteFromCloud,
};
