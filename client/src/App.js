import logo from './logo.svg';
import './App.css';

import "bootstrap/dist/css/bootstrap.min.css";

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Authentication from './pages/authentication/Authentication';
import Home from './pages/home/Home';
import NotFound from './pages/not-found/NotFound';

function App() {
  return (
    <div className="App">
      <Router> 
        <Switch>
          <Route path='/' exact component={Authentication} />
          <Route path='/home/' component={Home} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
