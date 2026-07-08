import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

import { Auth } from '../iam/authentication/decorators/auth.decorators';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';
import { Roles } from '../iam/authorization/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';

import { CategoriesService, CategoryWithItems } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryItemsDto } from './dto/update-category-items.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@ApiTags('Categories')
@UsePipes(ValidationPipe)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Auth(AuthType.None)
  @Get()
  findAll(@Query() paginationQuery: PaginationQueryDto): Promise<Category[]> {
    return this.categoriesService.findAll(paginationQuery);
  }

  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id') id: string): Promise<CategoryWithItems> {
    return this.categoriesService.findOne(id);
  }

  @Roles(Role.Emperor)
  @Post()
  create(
    @Body() createCategoryDto: CreateCategoryDto
  ): Promise<CategoryWithItems> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Roles(Role.Emperor)
  @Patch(':id')
  updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ): Promise<CategoryWithItems> {
    return this.categoriesService.updateCategory(id, updateCategoryDto);
  }

  @Roles(Role.Emperor)
  @Patch(':id/items')
  updateCategoryItems(
    @Param('id') id: string,
    @Body() updateCategoryItemsDto: UpdateCategoryItemsDto
  ): Promise<void> {
    return this.categoriesService.updateCategoryItems(
      id,
      updateCategoryItemsDto.items
    );
  }

  @Roles(Role.Emperor)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.removeCategory(id);
  }
}
