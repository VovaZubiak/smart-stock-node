import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: AuthCredentialsDto): Promise<{ message: string }> {
    const { username, password, role } = dto;

    const existingUser = await this.em.findOne(User, { username });
    if (existingUser) {
      throw new ConflictException('Користувач з таким логіном вже існує');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User();
    user.username = username;
    user.password = hashedPassword;
    user.role = role || UserRole.STOCKKEEPER;

    await this.em.persist(user).flush();

    return { message: 'Користувача успішно створено' };
  }

  async login(dto: AuthCredentialsDto): Promise<{ accessToken: string; role: UserRole }> {
    const { username, password } = dto;

    const user = await this.em.findOne(User, { username });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { sub: user.id, username: user.username, role: user.role };
      const accessToken = this.jwtService.sign(payload);
      return { accessToken, role: user.role };
    }

    throw new UnauthorizedException('Невірний логін або пароль');
  }
}