import { Entity, Column, ManyToOne, PrimaryColumn } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { App } from './App';

@Entity()
export class Connection {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column()
  params: string;

  @ManyToOne(() => App, (app) => app.connections)
  app: App;
}
