import React from 'react';
import logo from './logo.svg';
import './App.css';
import StateHook from "./StateHook";
import EffectHook from "./EffectHook";

class App extends React.Component {
    constructor() {
        super();
        this.state = {step : 1}
    }
    render() {
        const {step} = this.state;
        return (
            <div>
                <h1>Today {step} steps</h1>
                <hr/>
                <EffectHook/>
            </div>
        )
    }
}

export default App;
