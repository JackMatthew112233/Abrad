import { Module } from '@nestjs/common';
import { TahfidzController } from './tahfidz.controller.js';
import { TahfidzService } from './tahfidz.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [TahfidzController],
  providers: [TahfidzService],
  exports: [TahfidzService],
})
export class TahfidzModule {}
