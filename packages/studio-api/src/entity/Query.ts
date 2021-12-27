import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Connection } from './Connection';

@Entity({ name: 'query' })
export class Query {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => Connection, (connection) => connection.queries)
  connection: Connection;

  @Column({ nullable: false })
  data: string;
}
