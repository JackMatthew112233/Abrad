import { Module } from '@nestjs/common';
import { GuruController } from './guru.controller.js';
import { GuruService } from './guru.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [GuruController],
  providers: [GuruService],
  exports: [GuruService],
})
export class GuruModule {}
