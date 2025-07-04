import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, ManyToMany,  } from 'typeorm';
//import { Event } from '../../event/entities/event.entity';
import { Service } from '../../service/service.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER= 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  tag: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // Stockez toujours un hash, jamais en clair

  @Column({ length: 100, nullable: true })
  pseudo: string;

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

  //@OneToMany(() => Event, event => event.createdBy)
  //events: Event[];

  // Services created by this user
  @OneToMany(() => Service, service => service.creator)
  services: Service[];

  // Services fulfilled/provided by this user
  @OneToMany(() => Service, service => service.provider)
  providedServices: Service[];

  @Column({ nullable: true })
  language: string;

  @Column({ default: 0 })
  conversationCount: number;
  
  @Column({ default: 0 })
  friendCount: number;

  @Column({nullable:true})
  refreshToken: string;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}