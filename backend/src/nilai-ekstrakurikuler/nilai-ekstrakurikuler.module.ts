import { Module } from '@nestjs/common';
import { NilaiEkstrakurikulerService } from './nilai-ekstrakurikuler.service.js';
import { NilaiEkstrakurikulerController } from './nilai-ekstrakurikuler.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
    controllers: [NilaiEkstrakurikulerController],
    providers: [NilaiEkstrakurikulerService, PrismaService],
    exports: [NilaiEkstrakurikulerService],
})
export class NilaiEkstrakurikulerModule { }
