import { Module } from '@nestjs/common';
import { PendaftaranController } from './pendaftaran.controller.js';
import { PendaftaranService } from './pendaftaran.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [PendaftaranController],
  providers: [PendaftaranService],
  exports: [PendaftaranService],
})
export class PendaftaranModule {}
