import { Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { Public, ResponseMessage } from './decorator/customize';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('/login')
  @ResponseMessage('User login')
  async handleLogin(@Request() req, @Res({ passthrough: true }) res: Response) {
    console.log('req.user', req.user);

    return this.authService.login(req.user, res);
  }

  // @UseGuards(JwtAuthGuard)
  @Post('/profile')
  async getProfile(@Request() req) {
    return req.user;
  }
}
