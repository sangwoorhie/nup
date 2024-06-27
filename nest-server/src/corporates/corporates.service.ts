import { Injectable } from '@nestjs/common';
import { CreateCorporateDto } from './dto/create-corporate.dto';
import { UpdateCorporateDto } from './dto/update-corporate.dto';

@Injectable()
export class CorporatesService {
  create(createCorporateDto: CreateCorporateDto) {
    return 'This action adds a new corporate';
  }

  findAll() {
    return `This action returns all corporates`;
  }

  findOne(id: number) {
    return `This action returns a #${id} corporate`;
  }

  update(id: number, updateCorporateDto: UpdateCorporateDto) {
    return `This action updates a #${id} corporate`;
  }

  remove(id: number) {
    return `This action removes a #${id} corporate`;
  }
}
