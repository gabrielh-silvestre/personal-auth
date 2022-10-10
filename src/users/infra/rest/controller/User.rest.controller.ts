import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import type {
  InputCreateUserDto,
  OutputCreateUserDto,
} from '@users/dto/CreateUser.dto';
import type { OutputRecoverUserDto } from '@users/dto/RecoverUser.dto';
import type { OutputLoginUserDto } from '@users/dto/LoginUser.dto';
import type { OutputGetUserDto } from '@users/dto/GetUser.dto';

import { TokenService } from '@tokens/token.service';
import { UserService } from '@users/user.service';

import { RecoverUserPipe } from '../pipe/RecoverUser.pipe';
import { ParseHalJsonInterceptor } from '../interceptor/Parse.hal-json.interceptor';

import { ValidateUserGuard } from '@auth/infra/rest/guard/ValidateUser.guard';
import { ValidateTokenGuard } from '@auth/infra/rest/guard/ValidateToken.guard';

@Controller('/users')
export class UserRestController {
  constructor(
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  @Post()
  @UseInterceptors(new ParseHalJsonInterceptor<OutputCreateUserDto>())
  async create(@Body() data: InputCreateUserDto): Promise<OutputCreateUserDto> {
    const { id, username } = await this.userService.create(data);
    return { id, username };
  }

  @UseGuards(ValidateUserGuard)
  @Post('/login')
  @UseInterceptors(new ParseHalJsonInterceptor<OutputLoginUserDto>())
  async login(
    @Body(RecoverUserPipe) { id }: OutputRecoverUserDto,
  ): Promise<OutputLoginUserDto> {
    return this.tokenService.createToken({ userId: id });
  }

  @UseGuards(ValidateTokenGuard)
  @Get(':token/recover')
  @UseInterceptors(new ParseHalJsonInterceptor<OutputGetUserDto>())
  async recover(@Param('token') token: string): Promise<OutputGetUserDto> {
    const { userId } = await this.tokenService.recoverTokenPayload(token);

    return this.userService.getUser(userId);
  }
}
