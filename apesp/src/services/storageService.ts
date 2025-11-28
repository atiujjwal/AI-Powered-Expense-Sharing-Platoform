import fs from "fs/promises";
import path from "path";
import os from "os";

export class FileStorageService {
  static async upload(buffer: Buffer, originalName: string): Promise<string> {
    // Use OS temp dir to avoid permission issues on serverless platforms
    const tempDir = os.tmpdir();
    const uniqueName = `${Date.now()}-${originalName.replace(/\s/g, "_")}`;
    const uploadPath = path.join(tempDir, uniqueName);

    await fs.writeFile(uploadPath, buffer);

    return uploadPath; // Return the absolute path
  }

  static async delete(filePath: string) {
    try {
      await fs.unlink(filePath);
    } catch (e) {
      console.warn("Failed to delete temp file:", e);
    }
  }
}
