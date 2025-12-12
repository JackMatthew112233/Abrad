import { Module } from '@nestjs/common';
import { SiswaController } from './siswa.controller.js';
import { SiswaService } from './siswa.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [SiswaController],
  providers: [SiswaService],
  exports: [SiswaService],
})
export class SiswaModule {}
