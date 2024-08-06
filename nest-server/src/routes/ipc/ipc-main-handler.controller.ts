import { Controller, Post, Body } from '@nestjs/common';
import { FileHandlerService } from './services/file-handler.service';
import { AppHandlerService } from './services/app-handler.service';
import { AiDetectionHandlerService } from './services/ai-detection-handler.service';
import { CertHandlerService } from './services/cert-handler.service';
import { ConfigHandlerService } from './services/config-handler.service';
import { ImageTileHandlerService } from './services/image-tile-handler.service';
// Import other services

@Controller('ipc')
export class IpcMainHandlerController {
  constructor(
    private readonly fileHandlerService: FileHandlerService,
    private readonly appHandlerService: AppHandlerService,
    private readonly aiDetectionHandlerService: AiDetectionHandlerService,
    private readonly certHandlerService: CertHandlerService,
    private readonly configHandlerService: ConfigHandlerService,
    private readonly imageTileHandlerService: ImageTileHandlerService,
  ) {}

  // @Post('file')
  // handleFile(@Body() data: any) {
  //   return this.fileHandlerService.handle(data);
  // }

  @Post('app')
  handleApp(@Body() data: any) {
    return this.appHandlerService.handle(data);
  }

  // @Post('ai-detection')
  // handleAiDetection(@Body() data: any) {
  //   return this.aiDetectionHandlerService.handle(data);
  // }

  // Add other handler methods similarly
}
