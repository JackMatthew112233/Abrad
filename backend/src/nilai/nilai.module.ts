import { Module } from '@nestjs/common';
import { NilaiController } from './nilai.controller.js';
import { NilaiService } from './nilai.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [NilaiController],
  providers: [NilaiService, PrismaService],
  exports: [NilaiService],
})
export class NilaiModule {}
