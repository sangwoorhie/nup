import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiKeyIpService } from './api_key_ip.service';

@Controller('api-key-ip')
export class ApiKeyIpController {
  constructor(private readonly apiKeyIpService: ApiKeyIpService) {}
}
