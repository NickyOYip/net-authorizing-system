import React from "react";

const Dashboard = ({ walletAddress }) => {
    return (
        <div>
            <h2>Dashboard</h2>
            {walletAddress ? (
                <p>Connected Wallet: {walletAddress}</p>
            ) : (
                <p>No wallet connected</p>
            )}
        </div>
    );
};

export default Dashboard;
