import React, { useEffect, useContext, useState } from 'react';
import { DataContext } from '../store/dataStore';
import { useUserProfile } from '../hooks/useUserProfile';

const toDM = () => {
    window.location.href = "/DocumentManagement";
};

export const CertCard = (certs) => {


    return (

        <div>
            <div className="card-header pb-0 p-3">
                <div className="row">
                    <div className="col-6 d-flex align-items-center">
                        <h6 className="mb-0">Recent Certificates</h6>
                    </div>
                    <div className="col-6 text-end">
                        <button className="btn btn-outline-primary btn-sm mb-0" onClick={toDM}>View/Update</button>
                    </div>
                </div>
            </div>
            <div className="card-body p-3 pb-0">
                <ul className="list-group">
                    {certs.certs.map(cert => (
                        <li className="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                            <div className="d-flex flex-column" style={{ maxWidth: '50%' }}>
                                <h6 className="mb-1 text-dark font-weight-bold text-sm">{cert.owner}</h6>
                                <span className="text-xs">{cert.userAddress}</span>
                            </div>
                            <div className="d-flex align-items-center text-sm" >
                                {cert.state}
                                <h6 className="text-dark text-sm mb-0 px-0 ms-4">{cert.deployTime}</h6>
                            </div>
                        </li>
                    ))}
                    {/* Repeat similar list items for other entries */}
                </ul>
            </div>
        </div>

    );
}

export default CertCard;