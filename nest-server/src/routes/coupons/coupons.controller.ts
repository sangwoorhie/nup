import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { ApplyCouponReqDto } from './dto/req.dto';
import { ApplyCouponResDto } from './dto/res.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}
}
