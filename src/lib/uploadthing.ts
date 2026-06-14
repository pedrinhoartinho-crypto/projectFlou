import { UTApi } from 'uploadthing/server';
import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

export const utapi = new UTApi({
  token: process.env.UPLOADTHING_SECRET,
});

export const uploadRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 4 } }).onUploadComplete(() => {}),
  attachmentUploader: f({ blob: { maxFileSize: '16MB', maxFileCount: 8 } }).onUploadComplete(() => {}),
} satisfies FileRouter;
