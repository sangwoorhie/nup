CREATE TABLE "Detect_models"(
    "id" INTEGER NOT NULL,
    "model_type" VARCHAR(255) CHECK
        (
            "model_type" IN('nightly', 'stable')
        ) NOT NULL,
        "version" VARCHAR(255) NOT NULL,
        "file_path" VARCHAR(255) NOT NULL,
        "created_at" DATE NOT NULL,
        "updated_at" DATE NOT NULL
);
ALTER TABLE
    "Detect_models" ADD PRIMARY KEY("id");
COMMENT
ON COLUMN
    "Detect_models"."model_type" IS '1. nightly
2. stable';
COMMENT
ON COLUMN
    "Detect_models"."version" IS '모델 버전';
COMMENT
ON COLUMN
    "Detect_models"."file_path" IS '모델 파일 경로';
COMMENT
ON COLUMN
    "Detect_models"."created_at" IS '모델 생성시각';
COMMENT
ON COLUMN
    "Detect_models"."updated_at" IS '모델 정보수정 시각';
CREATE TABLE "Coupon_Template"(
    "id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "point" BIGINT NOT NULL,
    "expiration_date" DATE NOT NULL,
    "created_at" DATE NOT NULL,
    "updated_at" DATE NOT NULL
);
ALTER TABLE
    "Coupon_Template" ADD PRIMARY KEY("id");
COMMENT
ON COLUMN
    "Coupon_Template"."user_id" IS '쿠폰 발급자 id';
COMMENT
ON COLUMN
    "Coupon_Template"."name" IS '쿠폰명';
COMMENT
ON COLUMN
    "Coupon_Template"."quantity" IS '쿠폰 발행수량';
COMMENT
ON COLUMN
    "Coupon_Template"."point" IS '쿠폰 포인트';
COMMENT
ON COLUMN
    "Coupon_Template"."expiration_date" IS '만료일';
CREATE TABLE "Users"(
    "id" INTEGER NOT NULL,
    "user_type_1" VARCHAR(255) CHECK
        ("user_type_1" IN('normal', 'admin')) NOT NULL DEFAULT 'normal,admin',
        "user_type_2" VARCHAR(255)
    CHECK
        (
            "user_type_2" IN(
                'individual_web',
                'individual_api',
                'corporate_web',
                'corporate_api'
            )
        ) NOT NULL DEFAULT 'individual, corporate',
        "user_type_3" VARCHAR(255)
    CHECK
        ("user_type_3" IN('web', 'api')) NOT NULL DEFAULT 'web, api',
        "email" VARCHAR(255) NOT NULL,
        "password" VARCHAR(255) NOT NULL,
        "username" VARCHAR(255) NOT NULL,
        "phone" INTEGER NOT NULL,
        "emergency_phone" INTEGER NOT NULL,
        "point" INTEGER NOT NULL,
        "profile_image" VARCHAR(255) NOT NULL,
        "department" VARCHAR(255) NOT NULL,
        "position" VARCHAR(255) NOT NULL,
        "banned" BOOLEAN NOT NULL DEFAULT '0',
        "created_at" DATE NOT NULL,
        "updated_at" DATE NOT NULL,
        "deleted_at" DATE NOT NULL
);
ALTER TABLE
    "Users" ADD PRIMARY KEY("id");
COMMENT
ON COLUMN
    "Users"."user_type_1" IS '1. normal (일반회원)
2. admin (관리자회원)';
COMMENT
ON COLUMN
    "Users"."user_type_2" IS '1. individual (개인회원)
2. corporate (사업자회원)';
COMMENT
ON COLUMN
    "Users"."user_type_3" IS '1. web(웹 유저)
2. api (API유저)';
COMMENT
ON COLUMN
    "Users"."username" IS '사용자 이름';
COMMENT
ON COLUMN
    "Users"."point" IS '사용자의 포인트';
COMMENT
ON COLUMN
    "Users"."department" IS '부서 (사업자회원만 해당, 옵션사항)';
COMMENT
ON COLUMN
    "Users"."position" IS '직위(사업자회원만 해당, 옵션사항)';
COMMENT
ON COLUMN
    "Users"."banned" IS '계정정지여부';
COMMENT
ON COLUMN
    "Users"."created_at" IS '사용자 생성시각(회원가입 시각)';
COMMENT
ON COLUMN
    "Users"."updated_at" IS '사용자 정보수정 시각';
COMMENT
ON COLUMN
    "Users"."deleted_at" IS '회원탈퇴 시각';
CREATE TABLE "Coupons"(
    "id" INTEGER NOT NULL,
    "coupon_template_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "is_used" BOOLEAN NOT NULL,
    "used_at" DATE NOT NULL,
    "created_at" DATE NOT NULL,
    "updated_at" DATE NOT NULL
);
ALTER TABLE
    "Coupons" ADD PRIMARY KEY("id");
COMMENT
ON COLUMN
    "Coupons"."coupon_template_id" IS '쿠폰 템플릿 id';
COMMENT
ON COLUMN
    "Coupons"."user_id" IS '쿠폰을 사용한 사용자 id';
COMMENT
ON COLUMN
    "Coupons"."code" IS '쿠폰 코드';
COMMENT
ON COLUMN
    "Coupons"."is_used" IS '쿠폰이 사용되었는지의 여부';
COMMENT
ON COLUMN
    "Coupons"."used_at" IS '쿠폰 사용시각 (사용된 경우)';
CREATE TABLE "Api_keys"(
    "id" INTEGER NOT NULL,
    "user_id" BIGINT NOT NULL,
    "api_key" VARCHAR(255) NOT NULL,
    "ips" BIGINT NOT NULL,
    "created_at" DATE NOT NULL,
    "updated_at" DATE NOT NULL
);
ALTER TABLE
    "Api_keys" ADD PRIMARY KEY("id");
COMMENT
ON COLUMN
    "Api_keys"."user_id" IS 'User와 Api_key : 일대다 (1개 사용자가 여러개의 API KEY 사용 가능)';
COMMENT
ON COLUMN
    "Api_keys"."api_key" IS '발급된 api key';
COMMENT
ON COLUMN
    "Api_keys"."ips" IS '발급된 api key의 ip. 0개여도 되고, 단수도 되고, 콤마로 구분하여 복수여도 됨.';
COMMENT
ON COLUMN
    "Api_keys"."created_at" IS '키 생성 시각';
COMMENT
ON COLUMN
    "Api_keys"."updated_at" IS '수정일';
CREATE TABLE "Refresh_token"(
    "id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" INTEGER NOT NULL,
    "created_at" DATE NOT NULL,
    "updated_at" DATE NOT NULL
);
ALTER TABLE
    "Refresh_token" ADD PRIMARY KEY("id");
COMMENT
ON COLUMN
    "Refresh_token"."user_id" IS 'Refresh_token과 user는 일대일관계';
CREATE TABLE "Api_key_ip"(
    "id" INTEGER NOT NULL,
    "api_key_id" INTEGER NOT NULL,
    "ip" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT '1',
    "created_at" DATE NOT NULL,
    "updated_at" DATE NOT NULL
);
ALTER TABLE
    "Api_key_ip" ADD PRIMARY KEY("id");
COMMENT
ON COLUMN
    "Api_key_ip"."is_active" IS 'IP 주소의 활성화 상태 (활성/정지)';
CREATE TABLE "Images"(
    "id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "detect_model_id" INTEGER NOT NULL,
    "ip" VARCHAR(255) NOT NULL,
    "image_path" VARCHAR(255) NOT NULL,
    "status" VARCHAR(255) CHECK
        (
            "status" IN('detecting', 'detected', 'failed')
        ) NOT NULL,
        "is_detected" BOOLEAN NOT NULL,
        "created_at" DATE NOT NULL,
        "detected_at" BIGINT NOT NULL
);
ALTER TABLE
    "Images" ADD PRIMARY KEY("id");
COMMENT
ON COLUMN
    "Images"."user_id" IS 'Users와 Images: 일대다 (한 명의 사용자는 여러 이미지를 업로드할 수 있음)';
COMMENT
ON COLUMN
    "Images"."detect_model_id" IS 'Detect_models와 Images : 일대다 (한 모델은 여러 이미지에서 사용될 수 있음)';
COMMENT
ON COLUMN
    "Images"."ip" IS '이미지 업로드 시 사용된 IP 주소';
COMMENT
ON COLUMN
    "Images"."image_path" IS '이미지 경로';
COMMENT
ON COLUMN
    "Images"."status" IS '분석 상태
1. detecting (분석중)
2. detected (분석완료)
3. failed (분석실패)';
COMMENT
ON COLUMN
    "Images"."is_detected" IS 'API모델로 해당 이미지를 돌렸는지 유무(boolean) : 하자가 검출되었는지의 유무가 아님';
COMMENT
ON COLUMN
    "Images"."created_at" IS '이미지 업로드 시각';
COMMENT
ON COLUMN
    "Images"."detected_at" IS '검출이 완료된 시각';
CREATE TABLE "Payment_records"(
    "id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "detect_model_id" INTEGER NOT NULL,
    "coupon_id" INTEGER NOT NULL,
    "transaction_type" VARCHAR(255) CHECK
        (
            "transaction_type" IN('charge', 'use')
        ) NOT NULL DEFAULT 'charge, use',
        "payment_type" VARCHAR(255)
    CHECK
        (
            "payment_type" IN(
                'card',
                'cash',
                'paypal',
                'coupon',
                'use'
            )
        ) NOT NULL DEFAULT 'card,cash,paypal,coupon,model_usage',
        "account_holder_name" VARCHAR(255) NOT NULL,
        "ip" VARCHAR(255) NOT NULL,
        "point" INTEGER NOT NULL,
        "created_at" DATE NOT NULL
);
ALTER TABLE
    "Payment_records" ADD PRIMARY KEY("id");
COMMENT
ON COLUMN
    "Payment_records"."user_id" IS 'Users와 Payment_records: 일대다 (한 명의 사용자는 여러 포인트 거래 내역을 가질 수 있음)';
COMMENT
ON COLUMN
    "Payment_records"."detect_model_id" IS 'Detect_models와 Payment_records : 일대다 (포인트 사용 시, 한 모델은 여러 포인트 내역에서 사용될 수 있음)';
COMMENT
ON COLUMN
    "Payment_records"."coupon_id" IS 'Coupons와 Payment_records : 일대다 (쿠폰 사용시 : 한 쿠폰은 충전되고나서 여러 포인트 거래 내역에서 사용될 수 있음)';
COMMENT
ON COLUMN
    "Payment_records"."transaction_type" IS '거래 유형
1. charge (포인트 충전)
2. use (포인트 사용)';
COMMENT
ON COLUMN
    "Payment_records"."payment_type" IS '1. card(카드충전)
2. cash (현금충전)
3. paypal (페이팔충전)
4. coupon (쿠폰충전)
5. use (포인트사용)';
COMMENT
ON COLUMN
    "Payment_records"."account_holder_name" IS '현금 충전 시 계좌주 이름';
COMMENT
ON COLUMN
    "Payment_records"."ip" IS '거래 시 사용된 IP 주소';
COMMENT
ON COLUMN
    "Payment_records"."point" IS '거래 금액 (충전은 양수, 사용은 음수)';
CREATE TABLE "Api_logs"(
    "id" INTEGER NOT NULL,
    "api_key_id" INTEGER NOT NULL,
    "requested_ip" VARCHAR(255) NOT NULL,
    "endpoint" VARCHAR(255) NOT NULL,
    "method" BIGINT NOT NULL,
    "status_code" BIGINT NOT NULL,
    "tokens_used" BIGINT NOT NULL,
    "created_at" DATE NOT NULL
);
ALTER TABLE
    "Api_logs" ADD PRIMARY KEY("id");
COMMENT
ON COLUMN
    "Api_logs"."api_key_id" IS 'APIKey와 Log: 일대다 (하나의 API 키로 여러 로그를 기록할 수 있음)';
COMMENT
ON COLUMN
    "Api_logs"."requested_ip" IS '요청한 IP 주소';
COMMENT
ON COLUMN
    "Api_logs"."endpoint" IS '호출된 엔드포인트 주소';
COMMENT
ON COLUMN
    "Api_logs"."method" IS 'HTTP 매서드 (GET, POST 등)';
COMMENT
ON COLUMN
    "Api_logs"."status_code" IS '응답 상태 코드';
COMMENT
ON COLUMN
    "Api_logs"."tokens_used" IS '사용된 토큰 수';
COMMENT
ON COLUMN
    "Api_logs"."created_at" IS '요청 시간';
CREATE TABLE "Corporates"(
    "id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "corporate_name" VARCHAR(255) NOT NULL,
    "industry_code" INTEGER NOT NULL,
    "business_type" VARCHAR(255) NOT NULL,
    "business_conditions" VARCHAR(255) NOT NULL,
    "business_registration_number" INTEGER NOT NULL,
    "business_license" VARCHAR(255) NOT NULL,
    "address" BIGINT NOT NULL
);
ALTER TABLE
    "Corporates" ADD PRIMARY KEY("id");
COMMENT
ON COLUMN
    "Corporates"."corporate_name" IS '기업 명';
COMMENT
ON COLUMN
    "Corporates"."industry_code" IS '업종 코드';
COMMENT
ON COLUMN
    "Corporates"."business_type" IS '업종 명';
COMMENT
ON COLUMN
    "Corporates"."business_conditions" IS '업태 명';
COMMENT
ON COLUMN
    "Corporates"."business_registration_number" IS '사업자 등록번호';
COMMENT
ON COLUMN
    "Corporates"."business_license" IS '사업자 등록증 스캔본';
COMMENT
ON COLUMN
    "Corporates"."address" IS '주소';
CREATE TABLE "Refund_request"(
    "id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "requested_point" INTEGER NOT NULL,
    "rest_point" INTEGER NOT NULL,
    "account_holder_name" VARCHAR(255) NOT NULL,
    "bank_account_copy" VARCHAR(255) NOT NULL,
    "requested_at" DATE NOT NULL,
    "cancelled_at" DATE NOT NULL
);
ALTER TABLE
    "Refund_request" ADD PRIMARY KEY("id");
COMMENT
ON COLUMN
    "Refund_request"."user_id" IS '환불 요청 사용자 ID';
COMMENT
ON COLUMN
    "Refund_request"."requested_point" IS '환불 요청 포인트';
COMMENT
ON COLUMN
    "Refund_request"."rest_point" IS '환불신청 후 잔여포인트';
COMMENT
ON COLUMN
    "Refund_request"."account_holder_name" IS '계좌주 이름';
COMMENT
ON COLUMN
    "Refund_request"."bank_account_copy" IS '통장 사본';
COMMENT
ON COLUMN
    "Refund_request"."requested_at" IS '환불 요청 날짜';
COMMENT
ON COLUMN
    "Refund_request"."cancelled_at" IS '환불신청 취소일시';
ALTER TABLE
    "Images" ADD CONSTRAINT "images_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "Users"("id");
ALTER TABLE
    "Coupon_Template" ADD CONSTRAINT "coupon_template_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "Users"("id");
ALTER TABLE
    "Corporates" ADD CONSTRAINT "corporates_id_foreign" FOREIGN KEY("id") REFERENCES "Users"("id");
ALTER TABLE
    "Payment_records" ADD CONSTRAINT "payment_records_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "Users"("id");
ALTER TABLE
    "Api_logs" ADD CONSTRAINT "api_logs_api_key_id_foreign" FOREIGN KEY("api_key_id") REFERENCES "Api_keys"("id");
ALTER TABLE
    "Refresh_token" ADD CONSTRAINT "refresh_token_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "Users"("id");
ALTER TABLE
    "Refund_request" ADD CONSTRAINT "refund_request_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "Users"("id");
ALTER TABLE
    "Coupons" ADD CONSTRAINT "coupons_id_foreign" FOREIGN KEY("id") REFERENCES "Users"("id");
ALTER TABLE
    "Coupons" ADD CONSTRAINT "coupons_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "Users"("id");
ALTER TABLE
    "Coupons" ADD CONSTRAINT "coupons_coupon_template_id_foreign" FOREIGN KEY("coupon_template_id") REFERENCES "Coupon_Template"("id");
ALTER TABLE
    "Api_key_ip" ADD CONSTRAINT "api_key_ip_api_key_id_foreign" FOREIGN KEY("api_key_id") REFERENCES "Api_keys"("id");
ALTER TABLE
    "Payment_records" ADD CONSTRAINT "payment_records_detect_model_id_foreign" FOREIGN KEY("detect_model_id") REFERENCES "Detect_models"("id");
ALTER TABLE
    "Api_keys" ADD CONSTRAINT "api_keys_user_id_foreign" FOREIGN KEY("user_id") REFERENCES "Users"("id");
ALTER TABLE
    "Images" ADD CONSTRAINT "images_detect_model_id_foreign" FOREIGN KEY("detect_model_id") REFERENCES "Detect_models"("id");
ALTER TABLE
    "Payment_records" ADD CONSTRAINT "payment_records_coupon_id_foreign" FOREIGN KEY("coupon_id") REFERENCES "Coupons"("id");