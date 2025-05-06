import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { GLOBAL_CONFIG } from '../constants/global-config.constant';
import { User } from '../../user/user.entity';
import { Problem } from '../../problem/problem.entity';
import { TestCase } from 'src/problem/test_case/test-case.entity';

import 'dotenv/config';

const configService = new ConfigService();

export const databaseConfig: DataSourceOptions = {
	type: 'postgres',
	host: configService.get(GLOBAL_CONFIG.DB_HOST),
	port: configService.get(GLOBAL_CONFIG.DB_PORT),
	username: configService.get(GLOBAL_CONFIG.DB_USERNAME),
	password: configService.get(GLOBAL_CONFIG.DB_PASSWORD),
	database: configService.get(GLOBAL_CONFIG.DB_NAME),
	logging: configService.get(GLOBAL_CONFIG.IS_DEVELOPMENT),
	entities: [User, Problem, TestCase],
};
export default new DataSource(databaseConfig);
