import { Module } from '@nestjs/common';
import { KeuanganController } from './keuangan.controller.js';
import { KeuanganService } from './keuangan.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [KeuanganController],
  providers: [KeuanganService],
  exports: [KeuanganService],
})
export class KeuanganModule {}
