import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CorporatesService } from './corporates.service';
import { CreateCorporateDto } from './dto/create-corporate.dto';
import { UpdateCorporateDto } from './dto/update-corporate.dto';

@Controller('corporates')
export class CorporatesController {
  constructor(private readonly corporatesService: CorporatesService) {}

  @Post()
  create(@Body() createCorporateDto: CreateCorporateDto) {
    return this.corporatesService.create(createCorporateDto);
  }

  @Get()
  findAll() {
    return this.corporatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.corporatesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCorporateDto: UpdateCorporateDto) {
    return this.corporatesService.update(+id, updateCorporateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.corporatesService.remove(+id);
  }
}
