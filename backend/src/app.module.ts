import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { KeuanganModule } from './keuangan/keuangan.module.js';
import { AbsensiModule } from './absensi/absensi.module.js';
import { SiswaModule } from './siswa/siswa.module.js';
import { PelanggaranModule } from './pelanggaran/pelanggaran.module.js';
import { PengeluaranModule } from './pengeluaran/pengeluaran.module.js';
import { KesehatanModule } from './kesehatan/kesehatan.module.js';
import { NilaiModule } from './nilai/nilai.module.js';
import { MataPelajaranModule } from './mata-pelajaran/mata-pelajaran.module.js';

@Module({
  imports: [AuthModule, KeuanganModule, AbsensiModule, SiswaModule, PelanggaranModule, PengeluaranModule, KesehatanModule, NilaiModule, MataPelajaranModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
