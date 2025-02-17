import { useContext } from 'react';
import { MetaMaskContext } from './MetaMaskProvider.jsx';
import ContractInfo from './components/ContractInfo';
import AddCertificate from './components/AddCertificate';
import ActivateCertificate from './components/ActivateCertificate';
import CertificateValidator from './components/CertificateValidator';
import './styles/ContractInfo.css';
import './styles/AddCertificate.css';
import './styles/CertificateValidator.css';

function App() {
    const { connect, account, network } = useContext(MetaMaskContext);

    return (
        <div className="App">
            <h1>Certificate Management System</h1>
            <button onClick={connect}>Connect to MetaMask</button>
            {account && <p>Connected Account: {account}</p>}
            {network && <p>Network: {network}</p>}
            <ContractInfo />
            {account && <AddCertificate />}
            {account && <ActivateCertificate />}
            <CertificateValidator />
        </div>
    );
}

export default App;