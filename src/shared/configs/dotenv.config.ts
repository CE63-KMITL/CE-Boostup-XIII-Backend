import * as Joi from 'joi';

export const dotenvConfig = Joi.object({
	PORT: Joi.number().required(),
	DB_HOST: Joi.string().required(),
	DB_PORT: Joi.number().required(),
	DB_USERNAME: Joi.string().required(),
	DB_PASSWORD: Joi.string().required(),
	DB_NAME: Joi.string().required(),
	COMPILER_HOST: Joi.string().required(),
	IS_DEVELOPMENT: Joi.boolean().required(),
	MAIL_HOST: Joi.string().required(),
	MAIL_PORT: Joi.number().required(),
	MAIL_USER: Joi.string().required(),
	MAIL_PASS: Joi.string().required(),
	TOKEN_KEY: Joi.string().required(),
	JWT_ACCESS_EXPIRATION: Joi.string()
		.required()
		.pattern(/^\d+[smhd]$/),
	REWARDS: Joi.object({
		id: Joi.number().integer().positive().required(),
		name: Joi.string().min(1).required(),
		points: Joi.number().integer().min(0).required(),
	}),
	REDIS_HOST: Joi.string().required(),
	OTP_EXPIRY_MINUTE: Joi.number().required(),
	OTP_LENGTH: Joi.number().required(),
	ADMIN_EMAIL: Joi.string().required(),
	ADMIN_PASS: Joi.string().required(),
});
