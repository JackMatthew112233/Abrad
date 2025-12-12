import { Module } from '@nestjs/common';
import { AbsensiController } from './absensi.controller.js';
import { AbsensiService } from './absensi.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [AbsensiController],
  providers: [AbsensiService],
  exports: [AbsensiService],
})
export class AbsensiModule {}
