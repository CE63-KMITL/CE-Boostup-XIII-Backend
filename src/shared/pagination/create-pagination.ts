import { Repository } from 'typeorm';
import { PaginationMetaDto } from './dto/pagination-meta.dto';
import { GLOBAL_CONFIG } from '../constants/global-config.constant';

interface PaginationOptions<T> {
	repository: Repository<T>;
	dto: PaginationMetaDto;
}

export async function createPaginationQuery<T>(option: PaginationOptions<T>) {
	const { dto, repository } = option;
	const qb = repository.createQueryBuilder('entity');
	const page = dto.page || 1;
	const limit = dto.limit || GLOBAL_CONFIG.DEFAULT_PROBLEM_PAGE_SIZE;
	qb.skip((page - 1) * limit).take(limit);
	return qb;
}
