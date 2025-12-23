import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SekolahService {
    constructor(private prisma: PrismaService) { }

    async getSettings() {
        let settings = await this.prisma.sekolah.findFirst();
        if (!settings) {
            settings = await this.prisma.sekolah.create({
                data: {
                    namaSekolah: 'PONDOK PESANTREN DDI ABRAD',
                },
            });
        }
        return settings;
    }

    async updateSettings(data: any) {
        const settings = await this.getSettings();
        return this.prisma.sekolah.update({
            where: { id: settings.id },
            data,
        });
    }
}
