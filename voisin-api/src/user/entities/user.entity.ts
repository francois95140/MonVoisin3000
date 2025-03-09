import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn,  } from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  USER= 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Stockez toujours un hash, jamais en clair

  @Column({ length: 100, nullable: true })
  fullName: string;

  @Column({ nullable: true })
  avatar: string; // URL vers l'avatar

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'simple-enum', enum: UserRole, default: UserRole.USER })
  role: UserRole; // 'user', 'admin', etc.

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ nullable: true })
  passwordResetCode?: string;

  @Column({ type: 'jsonb', nullable: true })
  preferences: object; // Préférences utilisateur (thème, notifications, etc.)

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  timezone: string;

  @Column({ nullable: true })
  language: string;

  @Column({ default: 0 })
  conversationCount: number;
  
  @Column({ default: 0 })
  friendCount: number;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}