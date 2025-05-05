import { Type } from '@nestjs/common';
import { OmitType, PickType } from '@nestjs/swagger';

export function Exclude<T, K extends ReadonlyArray<keyof T>>(
	BaseClass: Type<T>,
	keysToExclude: K,
) {
	class newClass extends OmitType(BaseClass as any, keysToExclude as any) {
		constructor(sourceObject: Partial<T>) {
			super();
			for (const key of Object.keys(sourceObject) as Array<keyof T>) {
				if (!keysToExclude.includes(key)) {
					(this as any)[key] = sourceObject[key];
				}
			}
		}
	}

	return newClass;
}

export function Filter<T, K extends ReadonlyArray<keyof T>>(
	BaseClass: Type<T>,
	keys: K,
) {
	class newClass extends PickType(BaseClass as any, keys as any) {
		constructor(sourceObject: Partial<T>) {
			super();
			for (const key of keys) {
				(this as any)[key] = sourceObject[key];
			}
		}
	}

	return newClass;
}
