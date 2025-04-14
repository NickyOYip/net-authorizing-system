import React, { useState } from "react";
import '../styles/styles.css';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate} from 'react-router-dom';

export const SearchCard = () => {

  const [address, setAddress] = useState("");
  const [isOpen, setIsOpen] = useState()
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    setAddress(e.target.value);
  }

  const handleSubmit = () => {

    navigate('/searchResult', {
      state: {
        address: { address },
      }
    }
    )

  }

  return (
    <div className="card h-100 mb-4">
      <div className="card-header pb-0 px-3">
        <div className="row">
          <div className="col-md-4">
            <h4 className="mb-0">Find Contract</h4>
          </div>
          <div className="col-md-8 d-flex justify-content-start justify-content-md-end align-items-center">
            <Tooltip title="Input address before clicking this button!" arrow>
              <button onClick={handleSubmit}
                className="btn bg-gradient-dark mb-0" style={{ width: "fit-content" }}>Search</button>
            </Tooltip>
          </div>
        </div>
      </div>
      <div className=" card-body p-3 ">
        <div className="row" >
          <div className="col-md-12 mb-md-0 mb-4" >
            <div>
              <Tooltip title="Input address here !" arrow>
                <input
                  id="input"
                  type="text"
                  value={address}
                  onChange={handleChange}
                  required />
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </div>

  )
};

const styles = {
  input: {
    borderRadius: "5px",
    marginRight: "10px",
    width: "100%",
    height: "60px",
    background: "whitesmoke",
    border: "none",
    alignSelf: "left",
    color: "black",
    fontSize: "20px"
  }
}
export default SearchCard;
