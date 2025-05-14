import { Type } from '@nestjs/common';
import { OmitType, PickType } from '@nestjs/swagger';

export function Exclude<T, K extends ReadonlyArray<keyof T>>(
	BaseClass: Type<T>,
	keysToExclude: K,
) {
	class newClass extends (BaseClass as any) {
		constructor(sourceObject) {
			super(sourceObject);
			for (const key of keysToExclude) {
				delete (this as any)[key];
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
