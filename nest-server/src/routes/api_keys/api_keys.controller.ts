import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiKeysService } from './api_keys.service';
import {
  CreateApiKeyReqDto,
  SearchApikeyReqDto,
  UpdateApiKeyReqDto,
} from './dto/req.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PageReqDto } from 'src/common/dto/req.dto';
import { UserType } from 'src/enums/enums';
import { Usertype } from 'src/decorators/usertype.decorators';
import { User, UserAfterAuth } from 'src/decorators/user.decorators';

@ApiTags('API Key')
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  // 1. API Key 생성 (사용자)
  // POST : localhost:3000/api-keys/create
  @Post('create')
  @ApiOperation({ summary: 'API Key 생성' })
  @ApiResponse({ status: 201, description: 'API Key가 생성되었습니다.' })
  async createApiKey(
    @Body() createApiKeyReqDto: CreateApiKeyReqDto, 
    @User() user: UserAfterAuth,
  ) {
    return this.apiKeysService.createApiKey(user.id, createApiKeyReqDto);
  }

  // 2. API Key 목록조회 (사용자)
  // GET : localhost:3000/api-keys/list?page=1&size=20
  @Get('list')
  @ApiOperation({ summary: 'API Key 목록 조회' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiResponse({ status: 200, description: 'API Key 목록을 반환합니다.' })
  async listApiKeys(
    @Query() { page, size }: PageReqDto,
    @User() user: UserAfterAuth,
  ) {
    return this.apiKeysService.listApiKeys(user.id, page, size);
  }

  // 3. API Key 활성/정지 (사용자)
  // PATCH : localhost:3000/api-keys/active/:apikey_id
  @Patch('active/:id')
  @ApiOperation({ summary: 'API Key 활성/정지' })
  @ApiResponse({
    status: 200,
    description: 'API Key의 활성/정지 상태가 변경되었습니다.',
  })
  async apiKeyStatus(
    @Param('id') id: string, 
    @User() user: UserAfterAuth
  ) {
    return this.apiKeysService.apiKeyStatus(user.id, id);
  }

  // 4. IP 주소 수정 (사용자)
  // PATCH : localhost:3000/api-keys/update-ips/:apikey_id
  @Patch('update-ips/:id')
  @ApiOperation({ summary: 'IP 주소 변경' })
  @ApiResponse({ status: 200, description: 'IP 주소가 변경되었습니다.' })
  async updateApiKeyIps(
    @Param('id') id: string,
    @Body() updateApiKeyReqDto: UpdateApiKeyReqDto,
    @User() user: UserAfterAuth,
  ) {
    return this.apiKeysService.updateApiKeyIps(user.id, id, updateApiKeyReqDto);
  }

  // 5. API Key 전체목록 조회 (관리자)
  // GET : localhost:3000/api-keys/admin/list?page=1&size=20
  @Get('admin/list')
  @ApiOperation({ summary: 'API Key 전체 목록 조회' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiResponse({ status: 200, description: 'API Key 전체 목록을 반환합니다.' })
  @Usertype(UserType.ADMIN)
  async listApiKeysAdmin(@Query() pageReqDto: PageReqDto) {
    return this.apiKeysService.listApiKeysAdmin(
      pageReqDto.page,
      pageReqDto.size,
    );
  }

  // 6. API Key 입력조회 (Email or 이름 or ApiKey) (관리자)
  // GET : localhost:3000/api-keys/admin/search?page=1&size=20&criteria=email&email=powercom92@naver.com
  // GET : localhost:3000/api-keys/admin/search?page=1&size=20&criteria=username&username=Jake
  // GET : localhost:3000/api-keys/admin/search?page=1&size=20&criteria=apikey&apikey=ABC123
  @Get('admin/search')
  @ApiOperation({ summary: 'API Key 입력 조회 (Email or 이름 or ApiKey)' })
  @ApiQuery({
    name: 'criteria',
    enum: ['email', 'username', 'apikey'],
    required: true,
    description: 'Email로 조회할것인지 회원이름으로 조회할것인지 api-key로 조회할것인지 선택)',
  })
  @ApiQuery({ name: 'value', required: true, description: '검색 값' })
  @ApiQuery({ name: 'page', required: false, description: '페이지 번호' })
  @ApiQuery({ name: 'size', required: false, description: '페이지 크기' })
  @ApiResponse({ status: 200, description: 'API Key 검색 결과를 반환합니다.' })
  @Usertype(UserType.ADMIN)
  async searchApiKeysAdmin(
    @Query() { page, size }: PageReqDto,
    @Query('criteria') criteria: 'email' | 'username' | 'apikey',
    @Query('email') email?: string,
    @Query('username') username?: string,
    @Query('apikey') apikey?: string,
  ) {
    const searchApikeyReqDto = new SearchApikeyReqDto();
    searchApikeyReqDto.criteria = criteria;
    searchApikeyReqDto.email = email;
    searchApikeyReqDto.username = username;
    searchApikeyReqDto.apikey = apikey;
  
    return this.apiKeysService.searchApiKeysAdmin(searchApikeyReqDto, page, size);
  }
  
  // 7. API Key 활성/비활성 기능 (관리자)
  // PATCH : localhost:3000/api-keys/admin/active/:apikey_id
  @Patch('admin/active/:id')
  @ApiOperation({ summary: 'API Key 활성/비활성' })
  @ApiResponse({
    status: 200,
    description: 'API Key의 활성/비활성 상태가 변경되었습니다.',
  })
  @Usertype(UserType.ADMIN)
  async apiKeyStatusAdmin(@Param('id') id: string) {
    return this.apiKeysService.apiKeyStatusAdmin(id);
  }

  // 8. API Key 재발급 기능 (관리자)
  // PATCH : localhost:3000/api-keys/admin/regenerate/:id
  @Patch('admin/regenerate/:id')
  @ApiOperation({ summary: 'API Key 재발급' })
  @ApiResponse({ status: 200, description: 'API Key가 재발급되었습니다.' })
  @Usertype(UserType.ADMIN)
  async regenerateApiKeyAdmin(@Param('id') id: string) {
    return this.apiKeysService.regenerateApiKeyAdmin(id);
  }
}
