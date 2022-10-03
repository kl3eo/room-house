import React from 'react';
import ReactTable from 'react-table'
import 'react-table/react-table.css'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentData: []
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
            { Header: 'Session', accessor: 'session' },
      { Header: 'City', accessor: 'city' },
      { Header: 'Country', accessor: 'country' },
	{ Header: 'Node Name', accessor: 'name',Cell: props => <a href={"https://"+props.value+".room-house.com"}>{props.value}</a>},      
	{ Header: 'CPU Load, %', accessor: 'cpuload' },
      { Header: 'Stable Connection, %', accessor: 'stable' },
      { Header: 'Last Seen', accessor: 'ago' },
    ]
    //console.log(this.state.currentData);
    return (
      <div className="App">
        <ReactTable
          data={this.state.currentData}
          columns={columns}
        />
      </div>
    );
  }
}

export default App;
