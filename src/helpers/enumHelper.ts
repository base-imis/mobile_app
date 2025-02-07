export function getStringEnumKeys<T extends {[key: string]: string | number}>(
  enumObj: T,
): (keyof T)[] {
  return Object.keys(enumObj).filter(key => isNaN(Number(key))) as (keyof T)[];
}
