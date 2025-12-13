import { Module } from '@nestjs/common';
import { PengeluaranController } from './pengeluaran.controller.js';
import { PengeluaranService } from './pengeluaran.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [PengeluaranController],
  providers: [PengeluaranService],
})
export class PengeluaranModule {}
