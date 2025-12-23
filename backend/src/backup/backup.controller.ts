import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { BackupService } from './backup.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('backup')
@UseGuards(JwtAuthGuard)
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  private getTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  }

  @Get('siswa')
  async backupSiswa(@Res() res: Response) {
    const buffer = await this.backupService.backupSiswa();
    const filename = `Backup_Santri_${this.getTimestamp()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  }

  @Get('nilai')
  async backupNilai(@Res() res: Response) {
    const buffer = await this.backupService.backupNilai();
    const filename = `Backup_Nilai_${this.getTimestamp()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  }

  @Get('absensi')
  async backupAbsensi(@Res() res: Response) {
    const buffer = await this.backupService.backupAbsensi();
    const filename = `Backup_Absensi_${this.getTimestamp()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  }

  @Get('pelanggaran')
  async backupPelanggaran(@Res() res: Response) {
    const buffer = await this.backupService.backupPelanggaran();
    const filename = `Backup_Pelanggaran_${this.getTimestamp()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  }

  @Get('kesehatan')
  async backupKesehatan(@Res() res: Response) {
    const buffer = await this.backupService.backupKesehatan();
    const filename = `Backup_Kesehatan_${this.getTimestamp()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  }

  @Get('keuangan')
  async backupKeuangan(@Res() res: Response) {
    const buffer = await this.backupService.backupKeuangan();
    const filename = `Backup_Keuangan_${this.getTimestamp()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  }

  @Get('koperasi')
  async backupKoperasi(@Res() res: Response) {
    const buffer = await this.backupService.backupKoperasi();
    const filename = `Backup_Koperasi_${this.getTimestamp()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  }

  @Get('wali-kelas')
  async backupWaliKelas(@Res() res: Response) {
    const buffer = await this.backupService.backupWaliKelas();
    const filename = `Backup_Wali_Kelas_${this.getTimestamp()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  }

  @Get('tahfidz')
  async backupTahfidz(@Res() res: Response) {
    const buffer = await this.backupService.backupTahfidz();
    const filename = `Backup_Tahfidz_${this.getTimestamp()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  }

  @Get('users')
  async backupUsers(@Res() res: Response) {
    const buffer = await this.backupService.backupUsers();
    const filename = `Backup_Users_${this.getTimestamp()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  }

  @Get('all')
  async backupAll(@Res() res: Response) {
    const buffer = await this.backupService.backupAll();
    const filename = `Backup_Semua_Data_${this.getTimestamp()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(buffer);
  }
}
