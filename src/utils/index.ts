export function parseQueryParam (param: string | string[] | undefined): string | undefined {
    return Array.isArray(param) ? param[0] : param;
}

export function isNumeric(value: number | string | undefined): boolean {
    return !isNaN(Number(value));
}

export function groupByKey<T>(data: Array<T>, key: keyof T): { [key: string]: Array<T> } {
    return data.reduce((storage, item) => {
        const group = item[key] as string;

        storage[group] = storage[group] || [];
        storage[group].push(item);

        return storage;
    }, {} as { [key: string]: Array<T> });
}
