import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { KeuanganModule } from './keuangan/keuangan.module.js';
import { AbsensiModule } from './absensi/absensi.module.js';
import { SiswaModule } from './siswa/siswa.module.js';

@Module({
  imports: [AuthModule, KeuanganModule, AbsensiModule, SiswaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
