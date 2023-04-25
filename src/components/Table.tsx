import {Component, createRef} from "react";
import {ColumnStructure, TableStructure} from "./table.structure";

interface TableProps {
    structure: TableStructure; // {columns: Array<{name: string, type: enum}>}
}

interface TableState {
    pageLength: number;
    page: number;
    dataCount: number;
    loading: boolean;
    rows: Array<{[column: string]: any}>; // {column: value}
}

class Table extends Component<TableProps, TableState> {
    private columns: Array<ColumnStructure>;
    private tableBodyRef = createRef<HTMLTableSectionElement>()
    private tableHeaderRef = createRef<HTMLTableCellElement>()
    private getData: (table: Table) => [
        Promise<Array<{[column: string]: any}>>,
        Promise<number>
    ] = t => [
        Promise.resolve([]),
        Promise.resolve(0)
    ];
    constructor(props: TableProps) {
        super(props);
        this.columns = props.structure.columns;
        this.state = {
            pageLength: 10,
            page: 1,
            dataCount: 0,
            loading: false,
            rows: []
        }
    }

    render() {
        return <table>
            <thead>
            <tr>
                <th colSpan={this.columns.length} ref={this.tableHeaderRef}>
                    <span className="page-length">{this.state.pageLength}</span>
                    <span className="data-count">{this.state.dataCount}</span>
                    {this.state.loading &&
                        <span className="loading">{navigator.language.startsWith("es")
                            ? "Cargando..."
                            : "Loading..."}
                        </span>}
                </th>
            </tr>
            <tr>
                {this.columns.map(({name}) => <th key={name}>{name}</th>)}
            </tr>
            </thead>
            <tbody ref={this.tableBodyRef}>
            {this.state.rows.map((row, i) => <tr key={i}>
                {this.columns.map(({name, type}) => <td key={name}>{row[name]}</td>)}
            </tr>)}
            </tbody>
            <tfoot>
                <tr>
                    <td colSpan={this.columns.length}>
                        {/*first page button*/}
                        {this.state.page > 4 &&
                            <button disabled={this.state.loading} onClick={() => this.setPage(1)}>1</button>}

                        {/*3 prev pages buttons, ommiting 0 and nevative numbers*/}
                        {this.state.page > 1 && Array
                            .from({length: 3}, (_, i) => i + this.state.page - 3)
                            .filter(page => page > 0)
                            .map(page =>
                                <button disabled={this.state.loading} key={page} onClick={() => this.setPage(page)}>{page}</button>)}

                        {/* actual page*/}
                        <span className="page">{this.state.page}</span>

                        {/*next pages buttons, ommiting pages above max data length*/}
                        {this.state.page
                            < Math.ceil(this.state.dataCount / this.state.pageLength)
                            && Array
                                .from({length: 3}, (_, i) => i + this.state.page + 1)
                                .filter(page => page <= Math.ceil(this.state.dataCount / this.state.pageLength))
                                .map(page =>
                                    <button disabled={this.state.loading} key={page} onClick={() => this.setPage(page)}>{page}</button>)}

                        {/*last page button*/}
                        {/*<span className="threedots">{this.state.page < Math.ceil(this.state.dataCount / this.state.pageLength) - 4 && "..."}</span>*/}
                        {this.state.page
                            < Math.ceil(this.state.dataCount / this.state.pageLength) - 3
                            && <button disabled={this.state.loading} onClick={() => this.setPage(Math.ceil(this.state.dataCount / this.state.pageLength))}>{Math.ceil(this.state.dataCount / this.state.pageLength)}</button>}
                    </td>
                </tr>
            </tfoot>
        </table>
    }

    public addRow(row: {[column: string]: any}) {
        for (const column of this.columns) {
            if (column.required && !(column.name in row)) {
                throw new Error(`Missing required column ${column.name}`);
            }
        }
        const tableRow = document.createElement("tr");
        for (const column of this.columns) {
            const tableCell = document.createElement("td");
            if (column.name in row) {
                tableCell.innerText = row[column.name];
            }
            tableRow.appendChild(tableCell);
        }
        this.tableBodyRef.current?.appendChild(tableRow);
    }

    public addRows(rows: Array<{[column: string]: any}>) {
        console.log(rows);
        for (const row of rows) {
            this.addRow(row);
        }
    }

    public removeRow(row: number) {
        this.tableBodyRef.current?.deleteRow(row);
    }

    private setRows(rows: Array<{[column: string]: any}>) {
        this.setState({rows});
    }

    public setLoading(loading: boolean) {
        this.setState({loading});
    }

    public setDataCount(count: number) {
        this.setState({dataCount: count});
    }

    private setPageLength(length: number) {
        this.setState({pageLength: length});
    }

    public setDataGetter(getData: (table: Table) => [Promise<Array<{[column: string]: any}>>, Promise<number>]) {
        this.setLoading(true);
        this.getData = getData;
        this.update().catch(console.error)
    }

    public async update() {
        this.setLoading(true);
        // console.log(this.state.page)
        const [data, count] = this.getData(this);
        count.then(this.setDataCount.bind(this));
        data.then(this.setRows.bind(this));
        await Promise.all([data, count]);
        this.setLoading(false);
    }

    private setPage(n: number) {
        this.setState({page: n}, this.update.bind(this));
    }
}

export default Table;