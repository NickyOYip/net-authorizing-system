import React,{useState}from "react";

export const SearchCard = () => {

    const [address,setAddress] = useState(" ");

    return (
        <div className="card h-100 mb-4">
            <div className="card-header pb-0 px-3">
                <div className="row">
                    <div className="col-md-4">
                        <h4 className="mb-0">Find Certificate</h4>
                    </div>
                    <div className="col-md-12 d-flex justify-content-start justify-content-md-end align-items-center">
                        <input
                            type="text"
                            placeholder="Input address"
                            
                            value={address}
                            onChange={e => setFormData(prev => ({
                                ...prev,
                                certificateName: e.target.value
                            }))}
                            style={{borderRadius:"5px",marginRight:"10px",width:"90%",
                                    height:"100%",background:"whitesmoke",border:"none",
                                    alignSelf:"left",color:"black"}}
                            required
                        />
                        <button onClick={()=>{
                            //Search result page(similar to Document management with back button to home page)
                        }} className="btn bg-gradient-dark mb-0" style={{width:"fit-content"}}>Search</button>
                    </div>
                </div>
            </div>
            <div className="card-body pt-4 p-3">
                <ul className="list-group">
                    {/* ------------SEARCH------------------------------------------------------------------------------------ */}
                    {/*
                    {search.map(cert => (
                      <li className="list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg">
                        <div className="d-flex align-items-center">
                          <div className="d-flex flex-column">
                            <h6 className="mb-1 text-dark text-sm">{cert.owner}</h6>
                            <span className="text-xs">{cert.userAddress}</span>
                          </div>
                        </div>
                        <div>
                          <h6 className="mb-1 text-dark text-sm">{cert.certificateName}</h6>
                        </div>
                        <div id="date">
                          <p>{cert.deployTime}</p>
                        </div>
                        <div className="d-flex align-items-center text-danger text-gradient text-sm font-weight-bold">
                          <p onClick={toView}>Details</p>
                        </div>
                      </li>
                    ))}
                    */}
                </ul>
            </div>
        </div>

    )
    
}
export default SearchCard;