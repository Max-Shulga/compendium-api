import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBaseEntities1783496536471 implements MigrationInterface {
    name = 'AddBaseEntities1783496536471';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE TYPE "public"."users_role_enum" AS ENUM(\'regular\', \'emperor\')');
        await queryRunner.query('CREATE TABLE "users" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT \'regular\', "createAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))');
        await queryRunner.query('CREATE TABLE "card" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "text" character varying NOT NULL, "examples" character varying, CONSTRAINT "UQ_528004a2c3fefdaeaf7a0d8a8f8" UNIQUE ("title"), CONSTRAINT "PK_9451069b6f1199730791a7f4ae4" PRIMARY KEY ("id"))');
        await queryRunner.query('CREATE TABLE "topic_card" ("id" SERIAL NOT NULL, "topicId" integer NOT NULL, "cardId" integer NOT NULL, "order" integer NOT NULL DEFAULT \'0\', CONSTRAINT "PK_ea3e299d2aec11fab84f8f58cb9" PRIMARY KEY ("id"))');
        await queryRunner.query('CREATE TABLE "topic" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_15f634a2dbf62a79bb726fc6158" UNIQUE ("name"), CONSTRAINT "PK_33aa4ecb4e4f20aa0157ea7ef61" PRIMARY KEY ("id"))');
        await queryRunner.query('ALTER TABLE "topic_card" ADD CONSTRAINT "FK_ffef8bded10ec1da284b6187292" FOREIGN KEY ("topicId") REFERENCES "topic"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
        await queryRunner.query('ALTER TABLE "topic_card" ADD CONSTRAINT "FK_69d40a78a001517b4f8a616e481" FOREIGN KEY ("cardId") REFERENCES "card"("id") ON DELETE NO ACTION ON UPDATE NO ACTION');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "topic_card" DROP CONSTRAINT "FK_69d40a78a001517b4f8a616e481"');
        await queryRunner.query('ALTER TABLE "topic_card" DROP CONSTRAINT "FK_ffef8bded10ec1da284b6187292"');
        await queryRunner.query('DROP TABLE "topic"');
        await queryRunner.query('DROP TABLE "topic_card"');
        await queryRunner.query('DROP TABLE "card"');
        await queryRunner.query('DROP TABLE "users"');
        await queryRunner.query('DROP TYPE "public"."users_role_enum"');
    }

}
