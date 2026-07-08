import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCategories1783422536910 implements MigrationInterface {
  name = 'AddCategories1783422536910';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TYPE "public"."category_item_itemtype_enum" AS ENUM(\'topic\', \'card\', \'category\')'
    );
    await queryRunner.query(
      'CREATE TABLE "category_item" ("id" SERIAL NOT NULL, "categoryId" integer NOT NULL, "itemType" "public"."category_item_itemtype_enum" NOT NULL, "itemId" integer NOT NULL, "order" integer NOT NULL DEFAULT \'0\', CONSTRAINT "PK_e416f4119db82983ef9ebdc6395" PRIMARY KEY ("id"))'
    );
    await queryRunner.query(
      'CREATE TABLE "category" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_23c05c292c439d77b0de816b500" UNIQUE ("name"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))'
    );
    await queryRunner.query(
      'ALTER TABLE "category_item" ADD CONSTRAINT "FK_76a09df1b8d73f9fbe132900b52" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE NO ACTION'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "category_item" DROP CONSTRAINT "FK_76a09df1b8d73f9fbe132900b52"'
    );
    await queryRunner.query('DROP TABLE "category"');
    await queryRunner.query('DROP TABLE "category_item"');
    await queryRunner.query('DROP TYPE "public"."category_item_itemtype_enum"');
  }
}
