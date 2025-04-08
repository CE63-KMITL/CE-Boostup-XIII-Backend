// roles.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { UserService } from 'src/user/user.service';
  import { Role } from '../../shared/enum/role.enum'; 
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(
      private reflector: Reflector,
      private userService: UserService
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
        context.getHandler(),
        context.getClass(),
      ]);
  
      if (!requiredRoles || requiredRoles.length === 0) {
        return true; // 
      }
  
      const request = context.switchToHttp().getRequest();
      const user = request.user; 
  
      const dbUser = await this.userService.findOne(user.user_id); 
  
      if (!requiredRoles.includes(dbUser.role)) {
        throw new ForbiddenException('You do not have permission.');
      }
  
      return true;
    }
  }
  