import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Query } from './Query';

@Entity({ name: 'connection' })
export class Connection {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column()
  params: string;

  @OneToMany(() => Query, (query) => query.connection)
  queries;
}
