import { Module } from '@nestjs/common';
import { KesehatanController } from './kesehatan.controller.js';
import { KesehatanService } from './kesehatan.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [KesehatanController],
  providers: [KesehatanService],
  exports: [KesehatanService],
})
export class KesehatanModule {}
