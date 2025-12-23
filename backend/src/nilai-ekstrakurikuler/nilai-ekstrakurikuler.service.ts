import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class NilaiEkstrakurikulerService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        siswaId: string;
        ekstrakurikulerId: string;
        nilai: string;
        semester: string;
        tahunAjaran: string;
    }) {
        // Check if grade already exists for this student, ekstracurricular, semester, and year
        const existing = await this.prisma.nilaiEkstrakurikuler.findFirst({
            where: {
                siswaId: data.siswaId,
                ekstrakurikulerId: data.ekstrakurikulerId,
                semester: data.semester,
                tahunAjaran: data.tahunAjaran,
            },
        });

        if (existing) {
            // Update existing
            return this.prisma.nilaiEkstrakurikuler.update({
                where: { id: existing.id },
                data: {
                    nilai: data.nilai,
                },
            });
        }

        return this.prisma.nilaiEkstrakurikuler.create({
            data,
        });
    }

    async findBySiswa(siswaId: string, semester?: string, tahunAjaran?: string) {
        const where: any = {
            siswaId,
        };

        if (semester) where.semester = semester;
        if (tahunAjaran) where.tahunAjaran = tahunAjaran;

        return this.prisma.nilaiEkstrakurikuler.findMany({
            where,
            include: {
                ekstrakurikuler: true,
            },
            orderBy: {
                ekstrakurikuler: {
                    nama: 'asc',
                },
            },
        });
    }

    async upsertBulk(data: {
        siswaId: string;
        semester: string;
        tahunAjaran: string;
        nilaiList: Array<{
            ekstrakurikulerId: string;
            nilai: string;
        }>
    }) {
        const results: any[] = [];
        for (const item of data.nilaiList) {
            const result = await this.create({
                siswaId: data.siswaId,
                ekstrakurikulerId: item.ekstrakurikulerId,
                nilai: item.nilai,
                semester: data.semester,
                tahunAjaran: data.tahunAjaran
            });
            results.push(result);
        }
        return results;
    }

    async remove(id: string) {
        return this.prisma.nilaiEkstrakurikuler.delete({
            where: { id }
        });
    }
}
