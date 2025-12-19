import { Controller, Post, Body, Res, HttpCode, HttpStatus, ValidationPipe, UseGuards, Get, Req } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto, LoginDto } from './dto/index.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body(ValidationPipe) dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(ValidationPipe) dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login(dto);

    response.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: result.message,
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    return { message: 'Logout berhasil' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    return req.user;
  }

  @Post('update-email')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateEmail(
    @Req() req: Request,
    @Body(ValidationPipe) body: { email: string; password: string },
  ) {
    const user = req.user as { id: string };
    return this.authService.updateEmail(user.id, body.email, body.password);
  }

  @Post('update-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async updatePassword(
    @Req() req: Request,
    @Body(ValidationPipe) body: { oldPassword: string; newPassword: string },
  ) {
    const user = req.user as { id: string };
    return this.authService.updatePassword(user.id, body.oldPassword, body.newPassword);
  }
}
