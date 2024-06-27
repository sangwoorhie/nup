import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RefundRequestService } from './refund_request.service';
import { CreateRefundRequestDto } from './dto/create-refund_request.dto';
import { UpdateRefundRequestDto } from './dto/update-refund_request.dto';

@Controller('refund-request')
export class RefundRequestController {
  constructor(private readonly refundRequestService: RefundRequestService) {}

  @Post()
  create(@Body() createRefundRequestDto: CreateRefundRequestDto) {
    return this.refundRequestService.create(createRefundRequestDto);
  }

  @Get()
  findAll() {
    return this.refundRequestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.refundRequestService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRefundRequestDto: UpdateRefundRequestDto) {
    return this.refundRequestService.update(+id, updateRefundRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.refundRequestService.remove(+id);
  }
}
