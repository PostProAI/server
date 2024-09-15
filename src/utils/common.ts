import logger from "node-color-log";
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
require('dotenv').config();

export const getFormattedTime = () => {
    const now = new Date();

    // Format the date and time
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    // Combine into desired format
    return `${year}-${month}-${day} | ${hours}:${minutes}:${seconds}.${milliseconds}`;
};

// Initialize Cloud Storage and get a reference to the service
export async function uploadFile(fileName: string, data: any, folderPath: string) {
    const storage = getStorage();
    try {

        const storageRef = ref(storage, `${folderPath}/${fileName}`);

        // Create file metadata including the content type
        const metadata = {
            contentType: 'image/jpeg',
        };

        // Upload the file in the bucket storage
        const snapshot = await uploadBytesResumable(storageRef, data, metadata);
        //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

        // Grab the public url
        const downloadURL = await getDownloadURL(snapshot.ref);

        logger.info('File successfully uploaded.');
        return {
            message: 'file uploaded to firebase storage',
            name: fileName,
            type: 'image/jpeg',
            downloadURL: downloadURL
        }
    } catch (error) {
        logger.error('Error uploading file:', error);
        return {
            message: 'file upload failed',
            error
        }
    }
}