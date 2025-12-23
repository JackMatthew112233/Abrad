import { Module } from '@nestjs/common';
import { WaliKelasController } from './wali-kelas.controller.js';
import { WaliKelasService } from './wali-kelas.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [WaliKelasController],
  providers: [WaliKelasService],
  exports: [WaliKelasService],
})
export class WaliKelasModule {}
