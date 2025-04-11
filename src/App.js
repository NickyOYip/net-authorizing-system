import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import SignIn from './SignIn';
import PdfViewer from './PdfViewer';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/sign-in" component={SignIn} />
        <Route path="/pdf-viewer" component={PdfViewer} />
        <Redirect to="/sign-in" />
      </Switch>
    </Router>
  );
};

export default App;
