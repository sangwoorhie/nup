import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1720952581844 implements MigrationInterface {
    name = 'Migration1720952581844'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "Users" ADD "phone" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "emergency_phone"`);
        await queryRunner.query(`ALTER TABLE "Users" ADD "emergency_phone" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "emergency_phone"`);
        await queryRunner.query(`ALTER TABLE "Users" ADD "emergency_phone" integer`);
        await queryRunner.query(`ALTER TABLE "Users" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "Users" ADD "phone" integer NOT NULL`);
    }

}
