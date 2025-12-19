import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PendaftaranService {
  constructor(private prisma: PrismaService) {}

  async getAllPendaftaran(status?: string, page: number = 1, limit: number = 20) {
    const where: any = {
      role: 'User', // Only show User registrations, not Admin
    };

    if (status && status !== 'SEMUA') {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStatistik() {
    const [total, menunggu, diterima, ditolak] = await Promise.all([
      this.prisma.user.count({ where: { role: 'User' } }),
      this.prisma.user.count({ where: { role: 'User', status: 'MENUNGGU' } }),
      this.prisma.user.count({ where: { role: 'User', status: 'DITERIMA' } }),
      this.prisma.user.count({ where: { role: 'User', status: 'DITOLAK' } }),
    ]);

    return { total, menunggu, diterima, ditolak };
  }

  async approveUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: 'DITERIMA' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    return {
      message: 'Pendaftaran berhasil disetujui',
      user: updated,
    };
  }

  async rejectUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: 'DITOLAK' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    return {
      message: 'Pendaftaran berhasil ditolak',
      user: updated,
    };
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: 'User berhasil dihapus',
    };
  }
}
