import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { User } from '../user/entities/user.entity';

export enum ServiceType {
  HELP = 'help',         // Aide (ex: promener un chien)
  EXCHANGE = 'exchange', // Échange (ex: vélo contre machine à laver)
  DONATION = 'donation'  // Don (ex: donner un sac)
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ServiceType,
    default: ServiceType.HELP
  })
  type: ServiceType;

  @Column({ nullable: true })
  itemOffered: string;

  @Column({ nullable: true })
  itemWanted: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => User, user => user.services)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column()
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'fulfilledBy' })
  provider: User;

  @Column({ nullable: true })
  fulfilledBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}