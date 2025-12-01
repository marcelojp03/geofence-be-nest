import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
  Optional,
} from '@nestjs/common';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserData } from '../common/decorators/current-user.decorator';

@Controller('children')
@UseGuards(AuthGuard('jwt'))
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Post()
  create(
    @Body() createChildDto: CreateChildDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.childrenService.create(createChildDto, user.schoolId);
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('parentId') parentId?: string,
  ) {
    // parentId es opcional, convertir a número si existe
    const parentIdNum = parentId ? parseInt(parentId, 10) : undefined;
    return this.childrenService.findAll(user.schoolId, parentIdNum);
  }

  @Get('my-children')
  findMyChildren(@CurrentUser() user: CurrentUserData) {
    return this.childrenService.findByParent(user.userId, user.schoolId);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.childrenService.findOne(id, user.schoolId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateChildDto: UpdateChildDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.childrenService.update(id, updateChildDto, user.schoolId);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.childrenService.remove(id, user.schoolId);
  }
}
