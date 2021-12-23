import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { App } from './App';

@Entity()
export class Page {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  content: string;

  @ManyToOne(() => App, (app) => app.pages)
  app: App;
}
