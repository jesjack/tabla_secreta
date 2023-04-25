export enum ColumnType {
    string = 'string',
    number = 'number',
    date = 'date',
    boolean = 'boolean',
    object = 'object',
    array = 'array',
    function = 'function',
    symbol = 'symbol',
    undefined = 'undefined',
    null = 'null',
    bigint = 'bigint'
}

export interface ColumnStructure {
    name: string;
    type: ColumnType;
    required?: boolean;
}

export interface TableStructure {
    columns: ColumnStructure[];
}