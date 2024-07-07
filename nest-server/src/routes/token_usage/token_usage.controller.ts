import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TokenUsageService } from './token_usage.service';

@Controller('token-usage')
export class TokenUsageController {
  constructor(private readonly tokenUsageService: TokenUsageService) {}
}
