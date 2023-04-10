export type getClassOf<T extends { constructor: new(...args: any) => T }> =
	T extends { constructor: infer C } ? C : never;

export const isClassOf = <T extends { constructor: new(...args: any) => T }>
	(Class: getClassOf<T>, a: T): Class is getClassOf<T> => a instanceof Class;


export type getInstanceOf<T extends new(...args: any) => object> =
	T extends new(...args: any[]) => infer R ? R : never;

export const isInstanceOf = <T extends new(...args: any) => object>
	(a: object, Class: T): a is getInstanceOf<T> => a instanceof Class;
