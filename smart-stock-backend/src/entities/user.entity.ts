import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';

export enum UserRole {
  ADMIN = 'Admin',
  STOCKKEEPER = 'Stockkeeper',
}

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  username!: string;

  @Property()
  password!: string;

  @Enum(() => UserRole)
  role!: UserRole;
}