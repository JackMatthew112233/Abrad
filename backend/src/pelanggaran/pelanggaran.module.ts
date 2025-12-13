import { Module } from '@nestjs/common';
import { PelanggaranController } from './pelanggaran.controller.js';
import { PelanggaranService } from './pelanggaran.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [PelanggaranController],
  providers: [PelanggaranService],
})
export class PelanggaranModule {}
