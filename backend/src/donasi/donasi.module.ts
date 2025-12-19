import { Module } from '@nestjs/common';
import { DonasiController } from './donasi.controller.js';
import { DonasiService } from './donasi.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [DonasiController],
  providers: [DonasiService, PrismaService],
  exports: [DonasiService],
})
export class DonasiModule {}
