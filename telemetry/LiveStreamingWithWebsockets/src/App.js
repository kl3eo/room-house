import React from 'react';
import ReactTable from 'react-table'
import 'react-table/react-table.css'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentData: [],
	sortOptions: [{ id: 'nump', desc: true }],
    };
    this.ws = new WebSocket("wss://cube.room-house.com:8403/");
  }

  render() {
    this.ws.onopen = () => {
      //console.log('Opened Connection!')
    };

    this.ws.onmessage = (event) => {
      this.setState({ currentData: JSON.parse(event.data) });
    };

    this.ws.onclose = () => {
      //console.log('Closed Connection!')
    };
    const columns = [
            //{ Header: 'Session', accessor: 'session' },
//      { Header: 'City', accessor: 'city', width: 120 },
//      { Header: 'Country', accessor: 'country', width: 120 },
	{ Header: '1/0', accessor: 'nump', width: 60 },
	{ Header: 'КОМНАТА', accessor: 'name',Cell: props => <a href={"https://"+props.value+".room-house.com"}>{props.value}</a>, width: 120},      
        { Header: 'ОТКУДА', accessor: 'curip', width: 150 },
        { Header: 'КОММЕНТ', accessor: 'anno', getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        fontStyle: rowInfo && rowInfo.row.nump > 0 ? 'italic' : 'normal',
			textAlign: 'center',
                    },
                };
            }, },
//	{ Header: 'CPU Load, %', accessor: 'cpuload' },
//      { Header: 'Stable Connection, %', accessor: 'stable' },
//      { Header: '#Ppl', accessor: 'nump' },
//      { Header: 'Anno', accessor: 'anno' },
//      { Header: 'From', accessor: 'curip' },
//      { Header: 'Last', accessor: 'ago', width: 90 },
    ]
    //console.log(this.state.currentData);
    return (
        <div className="App">
<div className="centered"></div>
        <ReactTable
	  sorted={this.state.sortOptions}
    	  onSortedChange={val => {
    	  this.setState({ sortOptions: val }) }}
          data={this.state.currentData}
          columns={columns}
	  style={{fontSize:"20px"}}
        />
      </div>
	);
  }
}

export default App;
