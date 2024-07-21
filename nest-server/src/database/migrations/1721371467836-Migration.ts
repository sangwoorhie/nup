import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1721371467836 implements MigrationInterface {
    name = 'Migration1721371467836'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Coupon_Template" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "coupon_name" character varying NOT NULL, "quantity" integer NOT NULL, "point" integer NOT NULL, "expiration_date" date NOT NULL, "created_at" date NOT NULL DEFAULT now(), "updated_at" date NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_9f1519a181628acf427771de3df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "image_path" character varying NOT NULL, "status" "public"."Images_status_enum" NOT NULL DEFAULT 'not_detected', "is_detected" boolean NOT NULL DEFAULT false, "created_at" date NOT NULL DEFAULT now(), "detected_at" date, "userId" uuid, "aiModelsId" uuid, CONSTRAINT "PK_2d64b690d92c5ffcfd162cec31c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Ai_models" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "model_type" "public"."Ai_models_model_type_enum" NOT NULL DEFAULT 'nightly', "version" character varying NOT NULL, "file_path" character varying NOT NULL, "created_at" date NOT NULL, "updated_at" date NOT NULL, CONSTRAINT "PK_f22e5d209ad864c8acf0f82d63e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Payment_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "payment_type" "public"."Payment_records_payment_type_enum" NOT NULL DEFAULT 'charge', "charge_type" "public"."Payment_records_charge_type_enum" NOT NULL DEFAULT 'card', "account_holder_name" character varying, "point" integer NOT NULL, "user_point" integer, "charge_status" "public"."Payment_records_charge_status_enum" NOT NULL DEFAULT 'pending', "created_at" date NOT NULL DEFAULT now(), "userId" uuid, "aiModelsId" uuid, "couponsId" uuid, CONSTRAINT "PK_937fd98280534d2a1a7c20c4871" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Coupons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "is_used" boolean NOT NULL DEFAULT false, "used_at" date, "created_at" date NOT NULL DEFAULT now(), "updated_at" date NOT NULL DEFAULT now(), "couponTemplateId" uuid, "userId" uuid, CONSTRAINT "PK_2418d6bce705c88195d11a98547" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Refresh_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "created_at" date NOT NULL DEFAULT now(), "updated_at" date NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "REL_fb2ef284330e5774ce9ae78964" UNIQUE ("user_id"), CONSTRAINT "PK_35a1af02c819c57647287ea8694" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Refund_request" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "requested_point" integer NOT NULL, "rest_point" integer NOT NULL, "account_holder_name" character varying, "bank_account_copy" character varying NOT NULL, "refund_request_reason" character varying NOT NULL, "is_refunded" boolean NOT NULL DEFAULT false, "requested_at" date NOT NULL DEFAULT now(), "cancelled_at" date, "userId" uuid, CONSTRAINT "PK_e69d70afb2d0c93e7aad03aa8e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Corporates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "corporate_name" character varying NOT NULL, "industry_code" integer NOT NULL, "business_type" character varying NOT NULL, "business_conditions" character varying NOT NULL, "business_registration_number" integer NOT NULL, "business_license" character varying NOT NULL, "business_license_verified" boolean NOT NULL DEFAULT false, "address" character varying NOT NULL, "created_at" date NOT NULL DEFAULT now(), "updated_at" date NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "REL_564d666bfb762c6f1089e93e09" UNIQUE ("user_id"), CONSTRAINT "PK_e1df2f910f55b07c3adba6ca55e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Api_keys" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "api_key" character varying NOT NULL, "ips" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_80d5f27ab47ab41fb978527a248" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "TokenUsage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "count" integer NOT NULL DEFAULT '0', "date" date NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_37b5ba7c0bfd306bd62936497a6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "loginTimestamp" TIMESTAMP NOT NULL DEFAULT now(), "ip" character varying NOT NULL, "userAgent" character varying NOT NULL, "userId" uuid, CONSTRAINT "PK_47b43670a34b4d7b35ba994e0df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_type" "public"."Users_user_type_enum" NOT NULL DEFAULT 'individual', "email" character varying NOT NULL, "password" character varying NOT NULL, "username" character varying NOT NULL, "phone" character varying NOT NULL, "emergency_phone" character varying, "point" integer NOT NULL DEFAULT '0', "profile_image" character varying, "department" character varying, "position" character varying, "banned" boolean NOT NULL DEFAULT false, "banned_reason" character varying, "created_at" date NOT NULL DEFAULT now(), "updated_at" date NOT NULL DEFAULT now(), "deleted_at" date, CONSTRAINT "UQ_3c3ab3f49a87e6ddb607f3c4945" UNIQUE ("email"), CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Coupon_Template" ADD CONSTRAINT "FK_5fad66fbcb022b47f5fe06b808d" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Images" ADD CONSTRAINT "FK_35f6b4e97a232d600ef77585265" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Images" ADD CONSTRAINT "FK_30c21c444ddb62f4fbad61d6ea2" FOREIGN KEY ("aiModelsId") REFERENCES "Ai_models"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Payment_records" ADD CONSTRAINT "FK_c7ab832a1ee466f0e90bd883dd7" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Payment_records" ADD CONSTRAINT "FK_af025737329ad51c9683956bb6d" FOREIGN KEY ("aiModelsId") REFERENCES "Ai_models"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Payment_records" ADD CONSTRAINT "FK_697fda06c24ec0fa20216e636d0" FOREIGN KEY ("couponsId") REFERENCES "Coupons"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Coupons" ADD CONSTRAINT "FK_03f1db6f9042c4bdc11d4ab060e" FOREIGN KEY ("couponTemplateId") REFERENCES "Coupon_Template"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Coupons" ADD CONSTRAINT "FK_963ca9f303cf41616dd1925793b" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Refresh_token" ADD CONSTRAINT "FK_fb2ef284330e5774ce9ae789648" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Refund_request" ADD CONSTRAINT "FK_36410a1f2a4ae8737825d3e7b1a" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Corporates" ADD CONSTRAINT "FK_564d666bfb762c6f1089e93e093" FOREIGN KEY ("user_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Api_keys" ADD CONSTRAINT "FK_8393df7d8e545627144988dad78" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "TokenUsage" ADD CONSTRAINT "FK_a313114d350cf8809c20fa110cf" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Log" ADD CONSTRAINT "FK_74f8d45ecbd4d7550fa9e26dcdb" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Log" DROP CONSTRAINT "FK_74f8d45ecbd4d7550fa9e26dcdb"`);
        await queryRunner.query(`ALTER TABLE "TokenUsage" DROP CONSTRAINT "FK_a313114d350cf8809c20fa110cf"`);
        await queryRunner.query(`ALTER TABLE "Api_keys" DROP CONSTRAINT "FK_8393df7d8e545627144988dad78"`);
        await queryRunner.query(`ALTER TABLE "Corporates" DROP CONSTRAINT "FK_564d666bfb762c6f1089e93e093"`);
        await queryRunner.query(`ALTER TABLE "Refund_request" DROP CONSTRAINT "FK_36410a1f2a4ae8737825d3e7b1a"`);
        await queryRunner.query(`ALTER TABLE "Refresh_token" DROP CONSTRAINT "FK_fb2ef284330e5774ce9ae789648"`);
        await queryRunner.query(`ALTER TABLE "Coupons" DROP CONSTRAINT "FK_963ca9f303cf41616dd1925793b"`);
        await queryRunner.query(`ALTER TABLE "Coupons" DROP CONSTRAINT "FK_03f1db6f9042c4bdc11d4ab060e"`);
        await queryRunner.query(`ALTER TABLE "Payment_records" DROP CONSTRAINT "FK_697fda06c24ec0fa20216e636d0"`);
        await queryRunner.query(`ALTER TABLE "Payment_records" DROP CONSTRAINT "FK_af025737329ad51c9683956bb6d"`);
        await queryRunner.query(`ALTER TABLE "Payment_records" DROP CONSTRAINT "FK_c7ab832a1ee466f0e90bd883dd7"`);
        await queryRunner.query(`ALTER TABLE "Images" DROP CONSTRAINT "FK_30c21c444ddb62f4fbad61d6ea2"`);
        await queryRunner.query(`ALTER TABLE "Images" DROP CONSTRAINT "FK_35f6b4e97a232d600ef77585265"`);
        await queryRunner.query(`ALTER TABLE "Coupon_Template" DROP CONSTRAINT "FK_5fad66fbcb022b47f5fe06b808d"`);
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`DROP TABLE "Log"`);
        await queryRunner.query(`DROP TABLE "TokenUsage"`);
        await queryRunner.query(`DROP TABLE "Api_keys"`);
        await queryRunner.query(`DROP TABLE "Corporates"`);
        await queryRunner.query(`DROP TABLE "Refund_request"`);
        await queryRunner.query(`DROP TABLE "Refresh_token"`);
        await queryRunner.query(`DROP TABLE "Coupons"`);
        await queryRunner.query(`DROP TABLE "Payment_records"`);
        await queryRunner.query(`DROP TABLE "Ai_models"`);
        await queryRunner.query(`DROP TABLE "Images"`);
        await queryRunner.query(`DROP TABLE "Coupon_Template"`);
    }

}
