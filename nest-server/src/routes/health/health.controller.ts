import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { Public } from 'src/decorators/public.decorators';

@ApiTags('Health-check')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'database 상태확인' })
  @HealthCheck()
  @Public()
  check() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}
