import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const execPromise = promisify(exec);

@Injectable()
export class ImageTilingService {
  private readonly vipsPath: string;
  private readonly tilePath: string;

  constructor() {
    // You can customize these paths as per your deployment environment
    this.vipsPath = path.join(__dirname, '../../resources/vips/bin/vips.exe');
    this.tilePath = path.join(os.tmpdir(), 'image-tiles');
  }

  async processTilingImage(
    imagePath: string,
  ): Promise<{ data: string; error: string }> {
    const imageName = path.basename(imagePath);
    const outputPath = path.join(this.tilePath, imageName);
    const command = `${this.vipsPath} dzsave "${imagePath}"[autorotate] "${outputPath}"`;

    try {
      // Ensure tile path exists
      if (!fs.existsSync(this.tilePath)) {
        fs.mkdirSync(this.tilePath, { recursive: true });
      }

      // Execute the tiling command
      const { stdout, stderr } = await execPromise(command);

      return { data: stdout, error: stderr };
    } catch (error) {
      throw new InternalServerErrorException(
        `Error during image tiling: ${error.message}`,
      );
    }
  }
}
