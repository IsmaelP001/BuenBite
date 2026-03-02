export interface UploadedImage {
  buffer: Buffer;
  fieldname:string;
  originalName?: string;
  mimetype: string;
  size: number;
  path: string;
}

export interface UploadedImageDto {
  buffer: Buffer;
  fieldname:string;
  originalName?: string;
  mimetype: string;
  folder?:string;
  size: number;
}

export interface UploadResult {
  url: string;
  publicUrl: string;
  path: string;
  size: number;
  uploadedAt: Date;
}
