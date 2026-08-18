import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInterviewTopics1786977023293 implements MigrationInterface {
  name = 'AddInterviewTopics1786977023293';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "interview_card" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "text" character varying NOT NULL, "topicId" integer NOT NULL, "order" integer NOT NULL DEFAULT \'0\', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_856c277f318786afc0b0ca55c7d" PRIMARY KEY ("id"))'
    );
    await queryRunner.query(
      'CREATE TABLE "interview_topic" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_d4654bc4eff067d74af29e8513c" UNIQUE ("title"), CONSTRAINT "PK_a23e1ec44c02c9e9496a563976e" PRIMARY KEY ("id"))'
    );
    await queryRunner.query(
      'ALTER TABLE "interview_card" ADD CONSTRAINT "FK_b64e4bd55df6809f80465807a54" FOREIGN KEY ("topicId") REFERENCES "interview_topic"("id") ON DELETE CASCADE ON UPDATE NO ACTION'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "interview_card" DROP CONSTRAINT "FK_b64e4bd55df6809f80465807a54"'
    );
    await queryRunner.query('DROP TABLE "interview_topic"');
    await queryRunner.query('DROP TABLE "interview_card"');
  }
}
