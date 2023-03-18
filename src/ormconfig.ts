import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const OrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3307,
  username: 'root',
  password: 'root',
  database: 'mintime',
  autoLoadEntities: true,
  synchronize: true,
  timezone: 'Z',
};
