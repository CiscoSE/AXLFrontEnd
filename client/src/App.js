import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import logo from './logo.svg';
import API from "./utils/API";
import ResultView from "./pages/ResultView"
import './App.css';

class App extends Component {
  
	render() {
		return (
			<div className="App">
        <Router>
          <div>
            <Switch>
              <Route exact path="/" component={ResultView} />
            </Switch>
          </div>
        </Router>
			</div>
		)
	}
}

export default App;
