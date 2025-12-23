import { Module } from '@nestjs/common';
import { SekolahService } from './sekolah.service.js';
import { SekolahController } from './sekolah.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
    imports: [PrismaModule],
    controllers: [SekolahController],
    providers: [SekolahService],
    exports: [SekolahService],
})
export class SekolahModule { }
