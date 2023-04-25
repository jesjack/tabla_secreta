import React from 'react';
import './App.css';
import Table from "./components/Table";
import {ColumnType, TableStructure} from "./components/table.structure";
import DataService from "./components/Data.service";

class App extends React.Component {
    tableStructure: TableStructure = {
        columns: [
            {
                name: "ID",
                type: ColumnType.string
            },
            {
                name: "Comercio",
                type: ColumnType.string
            },
            {
                name: "CUIT",
                type: ColumnType.string
            },
            ...Array.from({length: 6}, (_, i) => ({
                name: `Concepto ${i + 1}`,
                type: ColumnType.number
            })),
            {
                name: "Balance Actual",
                type: ColumnType.number
            },
            {
                name: "Activo",
                type: ColumnType.boolean
            },
            {
                name: "Ultima venta",
                type: ColumnType.date
            }
        ]
    }

    tableRef = React.createRef<Table>();

  render() {
    return (
      <div className="App">
        <h1>Hello, React!</h1>
        <Table structure={this.tableStructure} ref={this.tableRef} />
      </div>
    );
  }

    componentDidMount() {
      const table = this.tableRef.current;
      if (!table) return;

      function getData(table: Table): [
          Promise<Array<{[column: string]: any}>>,
          Promise<number>
      ] {
          return [
              DataService.getData(table.state.pageLength, table.state.page),
              DataService.getCountData()
          ];
      }

      table.setDataGetter(getData);
    }
}

export default App;

/**
 * https://koibanxchallenge-4030.restdb.io/rest/datos-comercios
 */