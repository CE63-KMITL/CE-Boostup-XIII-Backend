import { Type } from '@nestjs/common';
import { PickType } from '@nestjs/swagger';

export const Omit = <T, K extends keyof T>(
	Class: new () => T,
	keys: K[],
): new () => Omit<T, (typeof keys)[number]> => Class;

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

	return newClass
}
