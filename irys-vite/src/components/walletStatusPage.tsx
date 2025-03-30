import { useContext } from 'react';
import { DataContext } from "../provider/dataProvider";
import { WalletContext } from "../provider/walletProvider";

function walletStatusPage() {
  const { data } = useContext(DataContext);
  const { walletStatus, irysStatus, connectWallet } = useContext(WalletContext);

  return (
    <div>
      <button onClick={connectWallet}>Connect Wallet</button>
      <p>ETHwalletStatus:{walletStatus}</p>
      <p>Adress:{}</p>
      <p>irysStatus:{irysStatus}</p>
      <p>Adress:{}</p>
    </div>
  );
}

export { walletStatusPage };