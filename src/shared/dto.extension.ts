export const Omit = <T, K extends keyof T>(
	Class: new () => T,
	keys: K[],
): new () => Omit<T, (typeof keys)[number]> => Class;

export function Filter<T extends object, K extends keyof T, V extends object>(
	instance: T,
	includeKeys: K[],
	values: V = {} as V,
): Pick<T, K> & V {
	const pickedData = {} as Pick<T, K>;
	for (const key of includeKeys) {
		if (key in instance) {
			pickedData[key] = instance[key];
		}
	}
	const result = Object.assign({}, pickedData, values);
	return result;
}
