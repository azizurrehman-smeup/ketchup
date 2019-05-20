export interface DataTableConfig {
    showFilter?: boolean;
    filter?: GenericMap;
    globalFilter?: boolean;
    enableSort?: boolean;
    sort?: Array<SortObject>;
    rowsPerPage?: number;
}

interface GenericMap {
    [index: string]: string;
}

export interface SortObject {
    column: string;
    sortMode: 'A' | 'D';
}
