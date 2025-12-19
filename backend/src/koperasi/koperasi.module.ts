import { Module } from '@nestjs/common';
import { KoperasiController } from './koperasi.controller.js';
import { KoperasiService } from './koperasi.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [KoperasiController],
  providers: [KoperasiService],
  exports: [KoperasiService],
})
export class KoperasiModule {}
