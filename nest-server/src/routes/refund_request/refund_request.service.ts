import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefundRequest } from 'src/entities/refund_request.entity';
import { User } from 'src/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { RefundReqDto } from './dto/req.dto';
import { RefundResAdminDto, RefundResDto } from './dto/res.dto';
import { PageResDto } from 'src/common/dto/res.dto';

@Injectable()
export class RefundRequestService {
  constructor(
    @InjectRepository(RefundRequest)
    private readonly refundRequestRepository: Repository<RefundRequest>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  // 1. 환불요청 (사용자)
  async requestRefund(
    userId: string,
    refundReqDto: RefundReqDto,
  ): Promise<RefundResDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    if (user.point < refundReqDto.requested_point) {
      throw new BadRequestException(
        '환불 요청 포인트가 현재 포인트보다 큽니다.',
      );
    }

    const refundRequest = new RefundRequest();
    refundRequest.user = user;
    refundRequest.requested_point = refundReqDto.requested_point;
    refundRequest.rest_point = user.point - refundReqDto.requested_point;
    refundRequest.bank_account_copy = refundReqDto.bank_account_copy;
    refundRequest.refund_request_reason = refundReqDto.refund_request_reason;
    refundRequest.is_refunded = false;
    refundRequest.requested_at = new Date();

    await this.refundRequestRepository.save(refundRequest);

    return {
      requested_at: refundRequest.requested_at,
      requested_point: refundRequest.requested_point,
      rest_point: refundRequest.rest_point,
    };
  }

  // 2. 전체 회원 환불 요청 목록 조회 (관리자)
  async getAllRefundRequests(
    page: number,
    size: number,
  ): Promise<PageResDto<RefundResAdminDto>> {
    const [refundRequests, total] =
      await this.refundRequestRepository.findAndCount({
        relations: ['user'],
        skip: (page - 1) * size,
        take: size,
      });

    const items = refundRequests.map((refundRequest) => ({
      requested_at: refundRequest.requested_at,
      bank_account_copy: refundRequest.bank_account_copy,
      requested_point: refundRequest.requested_point,
      rest_point: refundRequest.rest_point,
      refund_request_reason: refundRequest.refund_request_reason,
      username: refundRequest.user.username,
      phone: refundRequest.user.phone,
    }));

    return {
      page,
      size,
      total,
      items,
    };
  }

  // 3. 환불요청 완료 처리 (관리자)
  async completeRefundRequest(refundRequestId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const refundRequest = await queryRunner.manager.findOne(RefundRequest, {
        where: { id: refundRequestId },
        relations: ['user'],
      });

      if (!refundRequest) {
        throw new NotFoundException('환불 요청을 찾을 수 없습니다.');
      }

      if (refundRequest.is_refunded) {
        throw new BadRequestException('이미 처리된 환불 요청입니다.');
      }

      const user = refundRequest.user;

      if (user.point < refundRequest.requested_point) {
        throw new BadRequestException('사용자의 포인트가 부족합니다.');
      }

      user.point -= refundRequest.requested_point;
      refundRequest.is_refunded = true;

      await queryRunner.manager.save(User, user);
      await queryRunner.manager.save(RefundRequest, refundRequest);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  // 4. 환불요청 삭제 (관리자)
  async deleteRefundRequest(refundRequestId: string): Promise<void> {
    const refundRequest = await this.refundRequestRepository.findOne({
      where: { id: refundRequestId },
    });

    if (!refundRequest) {
      throw new NotFoundException('환불 요청을 찾을 수 없습니다.');
    }

    await this.refundRequestRepository.remove(refundRequest);
  }

  // 5. 본인 환불 요청 목록 조회 (사용자)
  async getMyRefundRequests(
    userId: string,
    page: number,
    size: number,
  ): Promise<PageResDto<RefundResDto>> {
    const [refundRequests, total] =
      await this.refundRequestRepository.findAndCount({
        where: { user: { id: userId } },
        skip: (page - 1) * size,
        take: size,
      });

    const items = refundRequests.map((refundRequest) => ({
      requested_at: refundRequest.requested_at,
      requested_point: refundRequest.requested_point,
      rest_point: refundRequest.rest_point,
    }));

    return {
      page,
      size,
      total,
      items,
    };
  }

  // 6. 환불요청 취소 (사용자)
  async cancelRefundRequest(
    userId: string,
    refundRequestId: string,
  ): Promise<void> {
    const refundRequest = await this.refundRequestRepository.findOne({
      where: { id: refundRequestId },
      relations: ['user'],
    });

    if (!refundRequest) {
      throw new NotFoundException('환불 요청을 찾을 수 없습니다.');
    }

    if (refundRequest.user.id !== userId) {
      throw new BadRequestException('본인의 환불 요청만 취소할 수 있습니다.');
    }

    if (refundRequest.is_refunded) {
      throw new BadRequestException(
        '이미 처리된 환불 요청은 취소할 수 없습니다.',
      );
    }

    await this.refundRequestRepository.remove(refundRequest);
  }
}
