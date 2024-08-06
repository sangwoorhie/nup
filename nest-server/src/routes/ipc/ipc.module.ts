import { Module } from '@nestjs/common';
import { IpcMainHandlerController } from './ipc-main-handler.controller';
import { AiDetectionHandlerService } from './services/ai-detection-handler.service';
import { AppHandlerService } from './services/app-handler.service';
import { FileHandlerService } from './services/file-handler.service';
import { CertHandlerService } from './services/cert-handler.service';
import { ConfigHandlerService } from './services/config-handler.service';
import { ImageTileHandlerService } from './services/image-tile-handler.service';

@Module({
  controllers: [IpcMainHandlerController],
  providers: [
    AiDetectionHandlerService,
    AppHandlerService,
    FileHandlerService,
    CertHandlerService,
    ConfigHandlerService,
    ImageTileHandlerService,
  ],
})
export class IpcModule {}
