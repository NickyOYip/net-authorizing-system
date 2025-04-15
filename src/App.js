import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import SignIn from './SignIn';
import PdfViewer from './PdfViewer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CertificateViewPage from './pages/CertificateViewPage';


const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/sign-in" component={SignIn} />
        <Route path="/pdf-viewer" component={PdfViewer} />
        <Route path="/view/:contractAddress" element={<CertificateViewPage />} />
        <Redirect to="/sign-in" />
      </Switch>
    </Router>
  );
};

export default App;
