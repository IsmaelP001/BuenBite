import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { UploadRepository } from "../../domain/repositories";
import { UploadedImage, UploadResult } from "../../domain/upload";
import { AuthTokenProvider } from "../../application/services/authTokenProvider";

@Injectable()
export class SupabaseUploadRepository implements UploadRepository {
  
  constructor(private readonly authTokenProvider: AuthTokenProvider) {}

  private async getAuthenticatedClient(): Promise<SupabaseClient> {
    const token = this.authTokenProvider.getToken();

    return createClient(
      "https://zhasoyfuddbwzpkghxyd.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoYXNveWZ1ZGRid3pwa2doeHlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3Njk3MDMsImV4cCI6MjA2NTM0NTcwM30.yp4pdYJKLJZ2EMDJXbjPCxRdLNK2YHn8Ru-1eHXdUfk",
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );
  }
  

  async uploadImage(image: UploadedImage): Promise<UploadResult> {
    const supabaseClient = await this.getAuthenticatedClient();

    const { data, error } = await supabaseClient.storage
      .from("recipe-assets")
      .upload(image.path, image.buffer, {
        contentType: image.mimetype,
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(
        `Upload failed: ${error.message}`
      );
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from("recipe-assets")
      .getPublicUrl(image.path);

    return {
      url: data.path,
      publicUrl: publicUrlData.publicUrl,
      path: image.path,
      size: image.size,
      uploadedAt: new Date(),
    };
  }

  async deleteImage(path: string[]): Promise<boolean> {
    const supabaseClient = await this.getAuthenticatedClient();

    const { error } = await supabaseClient.storage
      .from("recipe-assets")
      .remove(path);

    return !error;
  }

  async getImageUrl(path: string): Promise<string> {
    const supabaseClient = await this.getAuthenticatedClient();

    const { data } = supabaseClient.storage
      .from("recipe-assets")
      .getPublicUrl(path);

    return data.publicUrl;
  }
}
