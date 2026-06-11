import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

import { Roles } from '../iam/authorization/decorators/roles.decorator';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';
import { UserService } from './user.service';

@Roles(Role.Emperor)
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
    @Query('query') query: string | undefined
  ): Promise<User[]> {
    return this.userService.findAll(paginationQuery, query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.remove(id);
  }
}
