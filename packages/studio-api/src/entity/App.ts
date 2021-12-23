import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Connection } from './Connection';
// eslint-disable-next-line import/no-cycle
import { Page } from './Page';

@Entity()
export class App {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  name: string;

  @OneToMany(() => Page, (page) => page.app)
  pages: Page[];

  @OneToMany(() => Connection, (connection) => connection.app)
  connections: Connection[];
}
