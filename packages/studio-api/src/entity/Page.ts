import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'page' })
export class Page {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  pathname: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  content: string;
}
