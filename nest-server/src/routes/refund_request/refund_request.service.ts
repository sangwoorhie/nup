import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RefundRequest } from 'src/entities/refund_request.entity';
import { User } from 'src/entities/user.entity';
import { Between, DataSource, In, Not, Repository } from 'typeorm';
import { DateReqDto, RefundReqDto } from './dto/req.dto';
import { AmountResDto, RefundResAdminDto, RefundResDto } from './dto/res.dto';
import { PageResDto } from 'src/common/dto/res.dto';
import { PaymentRecord } from 'src/entities/payment_record.entity';
import { ChargeStatus, ChargeType, PaymentType } from 'src/enums/enums';

@Injectable()
export class RefundRequestService {
  constructor(
    @InjectRepository(RefundRequest)
    private readonly refundRequestRepository: Repository<RefundRequest>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
    @InjectRepository(PaymentRecord)
    private readonly paymentRecordRepository: Repository<PaymentRecord>,
  ) {}

  // 1. 본인 현금충전 포인트 조회 (사용자)
  async userCurrentPoint(userId: string): Promise<AmountResDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException('사용자를 찾을 수 없습니다.');
      }

      const total_point = user.point;
      const paymentRecord = await this.paymentRecordRepository.find({
        where: {
          user: { id: user.id },
          payment_type: PaymentType.CHARGE,
          charge_status: ChargeStatus.CONFIRMED,
        },
      });
      const cash_point = paymentRecord
        .filter((record) => record.charge_type === ChargeType.CASH)
        .reduce((sum, record) => sum + record.point, 0);

      return {
        username: user.username,
        total_point: total_point,
        cash_point: cash_point,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 2. 환불요청 (사용자)
  async requestRefund(
    userId: string,
    refundReqDto: RefundReqDto,
    cash_point: number,
  ): Promise<RefundResDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    const requestedPoint = Number(refundReqDto.requested_point);
    if (requestedPoint <= 0 || isNaN(requestedPoint)) {
      throw new BadRequestException('환불요청은 0원 이상이어야 합니다.');
    }

    if (user.point == null || 0) {
      throw new BadRequestException(
        '현재 회원님의 포인트가 존재하지 않습니다.',
      );
    }

    if (cash_point < requestedPoint) {
      throw new BadRequestException(
        '환불 요청 포인트가 현금충전 포인트보다 큽니다.',
      );
    }

    const refundRequest = new RefundRequest();
    refundRequest.user = user;
    refundRequest.requested_point = requestedPoint;
    refundRequest.rest_point = user.point - requestedPoint;
    refundRequest.bank_account_copy = refundReqDto.bank_account_copy.toString();
    refundRequest.refund_request_reason =
      refundReqDto.refund_request_reason.toString();
    refundRequest.is_refunded = false;
    refundRequest.is_cancelled = false;
    refundRequest.cancelled_at = null;
    refundRequest.requested_at = new Date();

    await this.refundRequestRepository.save(refundRequest);

    return {
      id: refundRequest.id,
      requested_at: refundRequest.requested_at,
      is_refunded: refundRequest.is_refunded,
      is_cancelled: refundRequest.is_cancelled,
      requested_point: refundRequest.requested_point,
      rest_point: refundRequest.rest_point,
      refund_request_reason: refundRequest.refund_request_reason,
      cancelled_at: refundRequest.cancelled_at
    };
  }

  // 3. 본인 환불 요청 목록 조회 (사용자)
  async getMyRefundRequests(
    userId: string,
    page: number,
    size: number,
  ): Promise<PageResDto<RefundResDto>> {
    const queryBuilder = this.refundRequestRepository
      .createQueryBuilder('refundRequest')
      .where('refundRequest.userId = :userId', { userId })
      .andWhere('refundRequest.deleted_at IS NULL')
      .orderBy('refundRequest.requested_at', 'DESC')
      .skip((page - 1) * size)
      .take(size);
  
    const [refundRequests, total] = await queryBuilder.getManyAndCount();
  
    const items = refundRequests.map((refundRequest) => ({
      id: refundRequest.id,
      requested_at: refundRequest.requested_at,
      is_refunded: refundRequest.is_refunded,
      is_cancelled: refundRequest.is_cancelled,
      requested_point: refundRequest.requested_point,
      rest_point: refundRequest.rest_point,
      refund_request_reason: refundRequest.refund_request_reason,
      cancelled_at: refundRequest.cancelled_at,
    }));
  
    return {
      page,
      size,
      total,
      items,
    };
  }

  // 4. 본인 환불 요청 목록 날짜별 조회 (사용자)
  async findRefundRequestByDateRange(
    page: number,
    size: number,
    dateReqDto: DateReqDto,
    userId: string,
  ): Promise<PageResDto<RefundResDto>> {
    const startDate = new Date(dateReqDto.start_date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(dateReqDto.end_date);
    endDate.setHours(23, 59, 59, 999);

    const [refundRequests, total] =
      await this.refundRequestRepository.findAndCount({
        // withDeleted: true, 
        where: {
          user: { id: userId },
          requested_at: Between(startDate, endDate),
          deleted_at: null,
        },
        skip: (page - 1) * size,
        take: size,
        order: { requested_at: 'DESC' },
      });

    const items = refundRequests.map((refundRequest) => ({
      id: refundRequest.id,
      requested_at: refundRequest.requested_at,
      is_refunded: refundRequest.is_refunded,
      is_cancelled: refundRequest.is_cancelled,
      requested_point: refundRequest.requested_point,
      rest_point: refundRequest.rest_point,
      refund_request_reason: refundRequest.refund_request_reason,
      cancelled_at: refundRequest.cancelled_at
    }));

    return {
      page,
      size,
      total,
      items,
    };
  }

  // 5. 환불요청 취소 (사용자)
  async cancelRefundRequests(
    userId: string,
    refundRequestIds: string[],
  ): Promise<{ message: string }> {
    const refundRequests = await this.refundRequestRepository.find({
      where: { id: In(refundRequestIds), cancelled_at: null },
      relations: ['user'],
    });

    const notFoundIds = refundRequestIds.filter(
      (id) => !refundRequests.some((request) => request.id === id),
    );
    if (notFoundIds.length > 0) {
      throw new NotFoundException(
        `환불 요청을 찾을 수 없습니다: ${notFoundIds.join(', ')}`,
      );
    }

    refundRequests.forEach((refundRequest) => {
      if (refundRequest.user.id !== userId) {
        throw new BadRequestException('본인의 환불 요청만 취소할 수 있습니다.');
      }

      if (refundRequest.is_refunded) {
        throw new BadRequestException(
          '이미 환불 완료처리된 환불 요청은 취소할 수 없습니다.',
        );
      }

      if(refundRequest.is_cancelled) {
        throw new BadRequestException(
          '이미 취소된 환불 요청건입니다.',
        );
      }

      refundRequest.is_cancelled = true;
      refundRequest.cancelled_at = new Date();
    });

    await this.refundRequestRepository.save(refundRequests);
    return {
      message: `환불 요청들이 성공적으로 취소되었습니다: ${refundRequestIds.join(', ')}`,
    };
  }

  // 6. 본인 환불요청 기록 삭제 (사용자)
  async deleteRefundRequests(
    userId: string,
    refundRequestIds: string[],
  ): Promise<{ message: string }> {
    const refundRequests = await this.refundRequestRepository.find({
      where: {
        id: In(refundRequestIds),
        user: { id: userId },
        deleted_at: null,
      },
      relations: ['user'],
    });

    const notFoundIds = refundRequestIds.filter(
      (id) => !refundRequests.some((request) => request.id === id),
    );
    if (notFoundIds.length > 0) {
      throw new NotFoundException(
        `환불 요청을 찾을 수 없습니다: ${notFoundIds.join(', ')}`,
      );
    }

    refundRequests.forEach((refundRequest) => {
      if (refundRequest.user.id !== userId) {
        throw new BadRequestException('본인의 환불 요청만 삭제할 수 있습니다.');
      }

    if(refundRequest.is_cancelled === false) {
      throw new BadRequestException('환불요청을 먼저 취소한 후 삭제해 주시기 바랍니다.');
    }

      refundRequest.deleted_at = new Date();
    });

    await this.refundRequestRepository.save(refundRequests);
    return {
      message: `환불 요청들이 성공적으로 삭제되었습니다: ${refundRequestIds.join(', ')}`,
    };
  }

  // 7. 전체 회원 환불 요청 목록 조회 (관리자)
  async getAllRefundRequests(
    page: number,
    size: number,
  ): Promise<PageResDto<RefundResAdminDto>> {
    const queryBuilder = this.refundRequestRepository
    .createQueryBuilder('refundRequest')
    // .withDeleted()
    .leftJoinAndSelect('refundRequest.user', 'user')
    .orderBy('refundRequest.requested_at', 'DESC')
    .skip((page - 1) * size)
    .take(size);

    const [refundRequests, total] = await queryBuilder.getManyAndCount();

    const items = refundRequests.map((refundRequest) => ({
      id: refundRequest.id,
      requested_at: refundRequest.requested_at,
      is_refunded: refundRequest.is_refunded,
      is_cancelled: refundRequest.is_cancelled,
      bank_account_copy: refundRequest.bank_account_copy,
      requested_point: refundRequest.requested_point,
      rest_point: refundRequest.rest_point,
      cancelled_at : refundRequest.cancelled_at,
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

  // 8. 환불요청 완료 처리 (관리자)
  async completeRefundRequest(ids: string[]): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const refundRequestId of ids) {
        const refundRequest = await queryRunner.manager.findOne(RefundRequest, {
          where: { id: refundRequestId },
          relations: ['user'],
        });

        if (!refundRequest) {
          throw new NotFoundException(
            `환불 요청을 찾을 수 없습니다. ID: ${refundRequestId}`,
          );
        }

        if (refundRequest.is_refunded) {
          throw new BadRequestException(
            `이미 처리된 환불 요청입니다. ID: ${refundRequestId}`,
          );
        }

        if (refundRequest.is_cancelled) {
          throw new BadRequestException(
            `해당 환불요청건은 회원에 의해 취소되었습니다. ID: ${refundRequestId}`,
          );
        }

        const user = refundRequest.user;

        if (user.point < refundRequest.requested_point) {
          throw new BadRequestException(
            `사용자의 포인트가 부족합니다. ID: ${refundRequestId}`,
          );
        }

        user.point -= refundRequest.requested_point;
        refundRequest.is_refunded = true;

        await queryRunner.manager.save(User, user);
        await queryRunner.manager.save(RefundRequest, refundRequest);
      }

      await queryRunner.commitTransaction();
      return { message: '환불처리가 완료되었습니다.' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // 9. 환불요청 기록 삭제 (관리자)
  async deleteRefundRequestAdmin(ids: string[]): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  
    try {
      if (!ids || ids.length === 0) {
        return { message: '환불 요청을 찾을 수 없습니다.' };
      }
  
      for (const refundRequestId of ids) {
        const refundRequest = await this.refundRequestRepository.findOne({
          where: { id: refundRequestId },
        });
  
        if (!refundRequest) {
          throw new NotFoundException(
            `환불 요청을 찾을 수 없습니다. ID: ${refundRequestId}`,
          );
        }
  
        await this.refundRequestRepository.remove(refundRequest);
      }
  
      await queryRunner.commitTransaction();
      return { message: '환불요청이 성공적으로 삭제되었습니다.' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}