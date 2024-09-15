"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFormattedTime = void 0;
exports.uploadFile = uploadFile;
const node_color_log_1 = __importDefault(require("node-color-log"));
const storage_1 = require("firebase/storage");
require('dotenv').config();
const getFormattedTime = () => {
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
exports.getFormattedTime = getFormattedTime;
// Initialize Cloud Storage and get a reference to the service
function uploadFile(fileName, data, folderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const storage = (0, storage_1.getStorage)();
        try {
            const storageRef = (0, storage_1.ref)(storage, `${folderPath}/${fileName}`);
            // Create file metadata including the content type
            const metadata = {
                contentType: 'image/jpeg',
            };
            // Upload the file in the bucket storage
            const snapshot = yield (0, storage_1.uploadBytesResumable)(storageRef, data, metadata);
            //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel
            // Grab the public url
            const downloadURL = yield (0, storage_1.getDownloadURL)(snapshot.ref);
            node_color_log_1.default.info('File successfully uploaded.');
            return {
                message: 'file uploaded to firebase storage',
                name: fileName,
                type: 'image/jpeg',
                downloadURL: downloadURL
            };
        }
        catch (error) {
            node_color_log_1.default.error('Error uploading file:', error);
            return {
                message: 'file upload failed',
                error
            };
        }
    });
}
//# sourceMappingURL=common.js.map