declare interface String {
    capitalize(): string;
    /**
     * Returns an alternate value if this string is empty
     * @param alt the alternate value
     */
    alt<T>(alt: T): this | T;
    equalsIgnoreCase(str: string): boolean;
}
declare interface Array<T> {
    insert(startIndex: number, items: T[]): void;
    remove(o: T): T;
    random(): T;
    dedupe(): T[];
    duplicates(): T[];
}
