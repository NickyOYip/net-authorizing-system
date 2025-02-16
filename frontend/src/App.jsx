import { useContext } from 'react';
import { MetaMaskContext } from './MetaMaskProvider.jsx';

function App() {
  const { connect, account, network } = useContext(MetaMaskContext);

  return (
    <>
      <h1>My React App</h1>
      <button onClick={connect}>Connect to MetaMask</button>
      {account && <p>Connected Account: {account}</p>}
      {network && <p>Network: {network}</p>}
    </>
  );
}

export default App;