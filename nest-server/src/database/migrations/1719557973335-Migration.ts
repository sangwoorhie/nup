import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1719557973335 implements MigrationInterface {
  name = 'Migration1719557973335';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Coupon_Template" ("id" SERIAL NOT NULL, "coupon_name" bigint NOT NULL, "quantity" integer NOT NULL, "point" bigint NOT NULL, "expiration_date" date NOT NULL, "created_at" date NOT NULL DEFAULT now(), "updated_at" date NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_9f1519a181628acf427771de3df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Images_status_enum" AS ENUM('not_detected', 'detecting', 'detect_succeed', 'detect_failed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "Images" ("id" SERIAL NOT NULL, "image_path" character varying(255) NOT NULL, "status" "public"."Images_status_enum" NOT NULL DEFAULT 'not_detected', "is_detected" boolean NOT NULL DEFAULT false, "created_at" date NOT NULL DEFAULT now(), "detected_at" date NOT NULL, "userId" integer, "aiModelsId" integer, CONSTRAINT "PK_2d64b690d92c5ffcfd162cec31c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Ai_models_model_type_enum" AS ENUM('nightly', 'stable')`,
    );
    await queryRunner.query(
      `CREATE TABLE "Ai_models" ("id" SERIAL NOT NULL, "model_type" "public"."Ai_models_model_type_enum" NOT NULL DEFAULT 'nightly', "version" character varying(255) NOT NULL, "file_path" character varying(255) NOT NULL, "created_at" date NOT NULL, "updated_at" date NOT NULL, CONSTRAINT "PK_f22e5d209ad864c8acf0f82d63e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Payment_records_payment_type_enum" AS ENUM('charge', 'use')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Payment_records_charge_type_enum" AS ENUM('card', 'cash', 'paypal', 'coupon')`,
    );
    await queryRunner.query(
      `CREATE TABLE "Payment_records" ("id" SERIAL NOT NULL, "payment_type" "public"."Payment_records_payment_type_enum" NOT NULL DEFAULT 'charge', "charge_type" "public"."Payment_records_charge_type_enum" NOT NULL DEFAULT 'card', "account_holder_name" character varying(255) NOT NULL, "point" integer NOT NULL, "created_at" date NOT NULL DEFAULT now(), "userId" integer, "aiModelsId" integer, "couponsId" integer, CONSTRAINT "PK_937fd98280534d2a1a7c20c4871" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "Coupons" ("id" SERIAL NOT NULL, "code" character varying(255) NOT NULL, "is_used" boolean NOT NULL DEFAULT false, "used_at" date NOT NULL, "created_at" date NOT NULL DEFAULT now(), "updated_at" date NOT NULL DEFAULT now(), "couponTemplateId" integer, "userId" integer, CONSTRAINT "PK_2418d6bce705c88195d11a98547" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "Refresh_token" ("id" SERIAL NOT NULL, "token" integer NOT NULL, "created_at" date NOT NULL DEFAULT now(), "updated_at" date NOT NULL DEFAULT now(), CONSTRAINT "PK_35a1af02c819c57647287ea8694" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "Corporates" ("id" SERIAL NOT NULL, "corporate_name" character varying(255) NOT NULL, "industry_code" integer NOT NULL, "business_type" character varying(255) NOT NULL, "business_conditions" character varying(255) NOT NULL, "business_registration_number" integer NOT NULL, "business_license" character varying(255) NOT NULL, "address" bigint NOT NULL, "created_at" date NOT NULL DEFAULT now(), "updated_at" date NOT NULL DEFAULT now(), CONSTRAINT "PK_e1df2f910f55b07c3adba6ca55e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "Api_logs" ("id" SERIAL NOT NULL, "requested_ip" character varying(255) NOT NULL, "endpoint" character varying(255) NOT NULL, "method" bigint NOT NULL, "status_code" bigint NOT NULL, "tokens_used" bigint NOT NULL, "created_at" date NOT NULL DEFAULT now(), "apiKeysId" integer, CONSTRAINT "PK_36da7cca592af12bf7f52dfcc4a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "Api_key_ips" ("id" SERIAL NOT NULL, "ip" character varying(255) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" date NOT NULL DEFAULT now(), "updated_at" date NOT NULL DEFAULT now(), "apiKeysId" integer, CONSTRAINT "PK_0dc3247a21b08e207fc79926863" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "Api_keys" ("id" SERIAL NOT NULL, "api_key" character varying(255) NOT NULL, "ips" character varying(255) NOT NULL, "created_at" date NOT NULL DEFAULT now(), "updated_at" date NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_80d5f27ab47ab41fb978527a248" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Users_user_type_1_enum" AS ENUM('normal', 'admin')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Users_user_type_2_enum" AS ENUM('individual', 'corporate')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."Users_user_type_3_enum" AS ENUM('web', 'api')`,
    );
    await queryRunner.query(
      `CREATE TABLE "Users" ("id" SERIAL NOT NULL, "user_type_1" "public"."Users_user_type_1_enum" NOT NULL DEFAULT 'normal', "user_type_2" "public"."Users_user_type_2_enum" NOT NULL DEFAULT 'individual', "user_type_3" "public"."Users_user_type_3_enum" NOT NULL DEFAULT 'web', "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "username" character varying(255) NOT NULL, "phone" integer NOT NULL, "emergency_phone" integer NOT NULL, "point" integer NOT NULL, "profile_image" character varying(255) NOT NULL, "department" character varying(255) NOT NULL, "position" character varying(255) NOT NULL, "banned" boolean NOT NULL DEFAULT false, "created_at" date NOT NULL DEFAULT now(), "updated_at" date NOT NULL DEFAULT now(), "deleted_at" date, CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "Refund_request" ("id" SERIAL NOT NULL, "requested_point" integer NOT NULL, "rest_point" integer NOT NULL, "account_holder_name" character varying(255) NOT NULL, "bank_account_copy" character varying(255) NOT NULL, "requested_at" date NOT NULL DEFAULT now(), "cancelled_at" date, "userId" integer, CONSTRAINT "PK_e69d70afb2d0c93e7aad03aa8e2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "Coupon_Template" ADD CONSTRAINT "FK_5fad66fbcb022b47f5fe06b808d" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Images" ADD CONSTRAINT "FK_35f6b4e97a232d600ef77585265" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Images" ADD CONSTRAINT "FK_30c21c444ddb62f4fbad61d6ea2" FOREIGN KEY ("aiModelsId") REFERENCES "Ai_models"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Payment_records" ADD CONSTRAINT "FK_c7ab832a1ee466f0e90bd883dd7" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Payment_records" ADD CONSTRAINT "FK_af025737329ad51c9683956bb6d" FOREIGN KEY ("aiModelsId") REFERENCES "Ai_models"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Payment_records" ADD CONSTRAINT "FK_697fda06c24ec0fa20216e636d0" FOREIGN KEY ("couponsId") REFERENCES "Coupons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Coupons" ADD CONSTRAINT "FK_03f1db6f9042c4bdc11d4ab060e" FOREIGN KEY ("couponTemplateId") REFERENCES "Coupon_Template"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Coupons" ADD CONSTRAINT "FK_963ca9f303cf41616dd1925793b" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Api_logs" ADD CONSTRAINT "FK_62a3ff59fa986d93642549dbf92" FOREIGN KEY ("apiKeysId") REFERENCES "Api_keys"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Api_key_ips" ADD CONSTRAINT "FK_643252c882d50d0f2e1eafaad6f" FOREIGN KEY ("apiKeysId") REFERENCES "Api_keys"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Api_keys" ADD CONSTRAINT "FK_8393df7d8e545627144988dad78" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Refund_request" ADD CONSTRAINT "FK_36410a1f2a4ae8737825d3e7b1a" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Refund_request" DROP CONSTRAINT "FK_36410a1f2a4ae8737825d3e7b1a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Api_keys" DROP CONSTRAINT "FK_8393df7d8e545627144988dad78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Api_key_ips" DROP CONSTRAINT "FK_643252c882d50d0f2e1eafaad6f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Api_logs" DROP CONSTRAINT "FK_62a3ff59fa986d93642549dbf92"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Coupons" DROP CONSTRAINT "FK_963ca9f303cf41616dd1925793b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Coupons" DROP CONSTRAINT "FK_03f1db6f9042c4bdc11d4ab060e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Payment_records" DROP CONSTRAINT "FK_697fda06c24ec0fa20216e636d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Payment_records" DROP CONSTRAINT "FK_af025737329ad51c9683956bb6d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Payment_records" DROP CONSTRAINT "FK_c7ab832a1ee466f0e90bd883dd7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Images" DROP CONSTRAINT "FK_30c21c444ddb62f4fbad61d6ea2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Images" DROP CONSTRAINT "FK_35f6b4e97a232d600ef77585265"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Coupon_Template" DROP CONSTRAINT "FK_5fad66fbcb022b47f5fe06b808d"`,
    );
    await queryRunner.query(`DROP TABLE "Refund_request"`);
    await queryRunner.query(`DROP TABLE "Users"`);
    await queryRunner.query(`DROP TYPE "public"."Users_user_type_3_enum"`);
    await queryRunner.query(`DROP TYPE "public"."Users_user_type_2_enum"`);
    await queryRunner.query(`DROP TYPE "public"."Users_user_type_1_enum"`);
    await queryRunner.query(`DROP TABLE "Api_keys"`);
    await queryRunner.query(`DROP TABLE "Api_key_ips"`);
    await queryRunner.query(`DROP TABLE "Api_logs"`);
    await queryRunner.query(`DROP TABLE "Corporates"`);
    await queryRunner.query(`DROP TABLE "Refresh_token"`);
    await queryRunner.query(`DROP TABLE "Coupons"`);
    await queryRunner.query(`DROP TABLE "Payment_records"`);
    await queryRunner.query(
      `DROP TYPE "public"."Payment_records_charge_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."Payment_records_payment_type_enum"`,
    );
    await queryRunner.query(`DROP TABLE "Ai_models"`);
    await queryRunner.query(`DROP TYPE "public"."Ai_models_model_type_enum"`);
    await queryRunner.query(`DROP TABLE "Images"`);
    await queryRunner.query(`DROP TYPE "public"."Images_status_enum"`);
    await queryRunner.query(`DROP TABLE "Coupon_Template"`);
  }
}
