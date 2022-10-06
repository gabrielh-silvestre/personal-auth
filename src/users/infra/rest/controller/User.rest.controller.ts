import { Body, Controller, Post, UseFilters, UseInterceptors } from '@nestjs/common';

import type {
  InputCreateUserDto,
  OutputCreateUserDto,
} from '@users/dto/CreateUser.dto';

import { UserService } from '@users/user.service';
import { ExceptionRestFilter } from '../filter/ExceptionRest.filter';
import { ParseHalJsonInterceptor } from '../interceptor/Parse.hal-json.interceptor';

@Controller('/users')
@UseFilters(new ExceptionRestFilter())
export class UserRestController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseInterceptors(new ParseHalJsonInterceptor<OutputCreateUserDto>())
  async create(@Body() data: InputCreateUserDto): Promise<OutputCreateUserDto> {
    const { id, username } = await this.userService.create(data);
    return { id, username };
  }
}
