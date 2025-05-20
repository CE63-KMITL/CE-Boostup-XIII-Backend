import { DataSource } from 'typeorm';
import { databaseConfig } from 'src/shared/configs/databaseconfig';

export const databaseProviders = [
	{
		provide: 'DataSource',
		useFactory: async () => {
			return await new DataSource(databaseConfig).initialize();
		},
	},
];
