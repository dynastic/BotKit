declare interface String {
    capitalize(): string;
}
declare interface Array<T> {
    insert(startIndex: number, items: T[]): this;
    remove(o: T): T[];
    random(): T;
}
