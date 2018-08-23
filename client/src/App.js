import React, { Component } from 'react';
import './App.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { data: [] };
    }

    componentDidMount() {
        this.callApi()
            .then(res => this.setState({ data: res }))
            .catch(err => console.log(err));

        console.log(this.data);
    }

    callApi = async () => {
        const response = await fetch('/members');
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    };

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1 className="App-title">שלומפר כלב טוב</h1>
                </header>
                <h1>Users</h1>
                <table className="table-bordered table-hover">
                    <thead>
                        <tr>
                            <td>name</td>
                            <td>email</td>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.data.map(member =>
                            <tr key={member.ID}>
                                <td>{member.FIRST_NAME} {member.LAST_NAME}</td>
                                <td>{member.EMAIL}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default App;
