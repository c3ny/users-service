import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { User } from 'src/application/core/domain/user.entity';
import { UserService } from 'src/application/core/service/user.service';

@Controller('/users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  getUserById(@Param('id') id: string): Promise<User | null> {
    return this.userService.getUserById(id);
  }

  @Post()
  createUser(@Body() user: User): Promise<User> {
    return this.userService.save(user);
  }
}
