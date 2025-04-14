import React, { useState} from "react";
import { useNavigate} from 'react-router-dom';
import '../styles/styles.css';
import Tooltip from '@mui/material/Tooltip';


export const VerifyCard = () => {
    const [contractAddress, setAddress] = useState(" ");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setAddress(e.target.value);
    }

    const handleSubmit = () => {
        navigate('/verify', { 
            state: { 
              address:{contractAddress},
            } }
        )
        
    }

    return (
        <div >
            <div className="card-header pb-0 p-3">
                <div className="row">
                    <div className="col-6 d-flex align-items-center">
                        <h4 className="mb-0">Verify Contract</h4>
                    </div>
                    <div className="col-6 text-end">
                        <Tooltip title="Input address before clicking this button!" arrow>
                            <button onClick={handleSubmit} className="btn bg-gradient-dark mb-0">Verify Now</button>
                        </Tooltip>
                    </div>

                </div>
            </div>
            <div className=" card-body p-3 ">
                <div className="row" >
                    <div className="col-md-12 mb-md-0 mb-4" >
                        <div>
                            <Tooltip title="Input address here!" arrow>
                                <input
                                    id="input"
                                    type="text"
                                    value={contractAddress}
                                    onChange={handleChange}
                                     />
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default VerifyCard;
