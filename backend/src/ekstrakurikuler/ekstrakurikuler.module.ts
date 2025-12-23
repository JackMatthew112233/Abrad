import { Module } from '@nestjs/common';
import { EkstrakurikulerService } from './ekstrakurikuler.service.js';
import { EkstrakurikulerController } from './ekstrakurikuler.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Module({
    controllers: [EkstrakurikulerController],
    providers: [EkstrakurikulerService, PrismaService],
})
export class EkstrakurikulerModule { }
