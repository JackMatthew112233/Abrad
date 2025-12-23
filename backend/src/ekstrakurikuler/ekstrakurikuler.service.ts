import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class EkstrakurikulerService {
    constructor(private prisma: PrismaService) { }

    async create(data: { nama: string; keterangan?: string }) {
        // Check for duplicate name
        const existing = await this.prisma.ekstrakurikuler.findFirst({
            where: {
                nama: data.nama,
            },
        });

        if (existing) {
            throw new BadRequestException('Ekstrakurikuler dengan nama tersebut sudah ada');
        }

        return this.prisma.ekstrakurikuler.create({
            data,
        });
    }

    async findAll() {
        return this.prisma.ekstrakurikuler.findMany({
            orderBy: {
                nama: 'asc',
            },
        });
    }

    async findOne(id: string) {
        const ekstrakurikuler = await this.prisma.ekstrakurikuler.findUnique({
            where: { id },
        });

        if (!ekstrakurikuler) {
            throw new NotFoundException('Ekstrakurikuler tidak ditemukan');
        }

        return ekstrakurikuler;
    }

    async update(id: string, data: { nama?: string; keterangan?: string }) {
        const existing = await this.prisma.ekstrakurikuler.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundException('Ekstrakurikuler tidak ditemukan');
        }

        if (data.nama && data.nama !== existing.nama) {
            const duplicate = await this.prisma.ekstrakurikuler.findFirst({
                where: {
                    nama: data.nama,
                },
            });

            if (duplicate) {
                throw new BadRequestException('Ekstrakurikuler dengan nama tersebut sudah ada');
            }
        }

        return this.prisma.ekstrakurikuler.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        const existing = await this.prisma.ekstrakurikuler.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundException('Ekstrakurikuler tidak ditemukan');
        }

        return this.prisma.ekstrakurikuler.delete({
            where: { id },
        });
    }
}
