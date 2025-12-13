import { Module } from '@nestjs/common';
import { MataPelajaranController } from './mata-pelajaran.controller.js';
import { MataPelajaranService } from './mata-pelajaran.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
  controllers: [MataPelajaranController],
  providers: [MataPelajaranService, PrismaService],
  exports: [MataPelajaranService],
})
export class MataPelajaranModule {}
