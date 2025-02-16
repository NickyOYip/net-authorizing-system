import { useContext } from 'react';
import { MetaMaskContext } from './MetaMaskProvider.jsx';
import ContractInfo from './components/ContractInfo';
import './styles/ContractInfo.css';

function App() {
  const { connect, account, network } = useContext(MetaMaskContext);

  return (
    <div className="App">
      <h1>My React App</h1>
      {/* Button to connect to MetaMask */}
      <button onClick={connect}>Connect to MetaMask</button>
      {/* Display connected account and network */}
      {account && <p>Connected Account: {account}</p>}
      {network && <p>Network: {network}</p>}
      <ContractInfo />
    </div>
  );
}

export default App;