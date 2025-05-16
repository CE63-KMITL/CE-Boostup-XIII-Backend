import { Type } from '@nestjs/common';

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
	class newClass extends (BaseClass as any) {
		constructor(sourceObject: Partial<T>) {
			super(sourceObject);

			console.log(Object.keys(this));

			for (const key of Object.keys(this)) {
				if (keys.filter((k) => k == key).length == 0) {
					delete (this as any)[key];
				}
			}
		}
	}

	return newClass;
}
