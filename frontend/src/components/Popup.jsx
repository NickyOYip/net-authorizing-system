import React, { useState } from "react";

export const Activate = ({ isOpen, onClose, contractAddress }) => {

    if (!isOpen) return null;
    else {
        const contractOwner = contractAddress;//fetch contract owner using contractAddress
        const currentUser = " "; //fetch current user address
        const [isFailed, setIsFailed] = useState(null);
        const [noError, setNoError] = useState(true);
        const [success, setSuccess] = useState(false);

        //fetch needed data
        const [data, setData] = useState({
            activationCode: "123434564568768",
            contractTitle: "Blockchain Developer",
            contractType: "private",
            jsonHash: "fhjdkghksdj",
            documentHash: "mkfldnglfj",
        });

        const [formData, setFormData] = useState({
            activationCode: "",
            jsonFile: null,
            documentFile: null,
        });

        const handleJsonChange = async (e) => {
            try {
                //1.get hash of json
                //2.compare hash 
                if (true) {
                    //3.upload file to chain
                } else {
                    setNoError(false);
                    setIsFailed("JSON");
                }
            } catch (error) {
                console.error('Detailed error in handleSubmit:', {
                    error,
                    errorMessage: error.message,
                    errorStack: error.stack,
                    formData: formData
                });
            }
        };

        const handleDocumentChange = async (e) => {
            try {
                //1.get hash of document
                //2.compare hash 
                if (true) {
                    //3.upload file to chain
                } else {
                    setNoError(false);
                    setIsFailed("Document");
                }
            } catch (error) {
                console.error('Detailed error in handleSubmit:', {
                    error,
                    errorMessage: error.message,
                    errorStack: error.stack,
                    formData: formData
                });
            }
        };

        const handleSubmit = () => {
            try {

                if (
                    formData.activationCode == data.activationCode
                    //change form status 
                ) {
                    setSuccess(true);
                    return null;
                }
                else {
                    setNoError(false);
                    setIsFailed("Activation Code");
                }

            } catch (error) {
                console.error('Detailed error in handleSubmit:', {
                    error,
                    errorMessage: error.message,
                    errorStack: error.stack,
                    formData: formData
                });
            }
        }

        //contract.owner == current user address
        if (contractOwner == currentUser)
            return (
                <div className="popup-overlay bg-gradient-dark card " style={{

                    position: 'fixed',
                    top: '30%',
                    left: '30%',
                    height: 'auto',
                    width: 'auto',
                    padding: '20px',
                    border: '5px solid #ccc',
                    zIndex: '1000',

                }}>
                    <div style={{ justifyItems: "center", height: "100%", alignContent: "center" }}>
                        <h1 style={{ color: "white" }}> Activation Code: </h1>
                        <br />
                        <div className="card" style={{ textAlign: "center", borderRadius: "10px" }}>
                            <h2 style={{ color: "black", paddingLeft: "30px", paddingRight: "30px" }}
                            >{data.activationCode}</h2>
                        </div>
                        <br />
                        <br />
                        <h4 style={{ color: "white" }}>Send this activation code to contract user! </h4>
                        <button className="btn "
                            onClick={onClose}
                            style={{ background: "white", color: "black", fontStyle: "bold", fontSize: "20px", justifySelf: "end", paddingLeft: "30px", paddingRight: "30px" }}
                        > Close</button>
                    </div>
                </div>
            )
        //for users input activation code 
        else if (success == false) {
            return (

                <div className="popup-overlay" style={{

                    position: 'fixed',
                    top: '15%',
                    left: '40%',
                    height: 'auto',
                    width: 'auto',
                    padding: '20px',
                    border: '1px solid #ccc',
                    zIndex: '1000',
                    background: "white ",
                    borderRadius: "10px"

                }}>

                    <div style={{ justifyItems: "center", height: "100%", alignContent: "center" }}>
                        <div className="form " style={{}}>
                            <div className="form-group">
                                <h4>Activation Code</h4>
                                {/********** Input Activation code ********************************/}
                                <input
                                    type="text"
                                    value={formData.activationCode}
                                    onChange={e => setFormData(prev => ({
                                        ...prev,
                                        activationCode: e.target.value
                                    }))}
                                    required
                                />
                            </div>
                            {/** Input JSON and document file for private contracts */}
                            {data.contractType == 'private' && (
                                <div>
                                    <h4>This is a private contract! </h4>
                                    <div className="form-group">
                                        <h4>Please upload your JSON file here</h4>
                                        {/** *************Input JSON file  *****************************************************************/}
                                        <input
                                            type="file"
                                            onChange={handleJsonChange}
                                            required
                                        />
                                    </div>

                                    <div style={{ alignItems: 'center', paddingTop: '30px' }}>
                                        <div className="form-group">
                                            <h4>Upload Document File</h4>
                                            {/** *************Input Document file  *****************************************************************/}
                                            <input
                                                type="file"
                                                onChange={handleDocumentChange}
                                                required
                                            />
                                        </div>
                                        <br />
                                    </div>
                                </div>
                            )}
                            <div className="row" style={{ display: "flex", justifyContent: "center" }}>
                                {/** **********  Submit button *****************************************************************/}
                                <button className='btn btn-lg bg-gradient-dark'
                                    style={{ width: "fit-content", fontSize: "20px", marginRight: "10px" }}
                                    
                                    onClick={handleSubmit}
                                >Verify Now !</button>
                                <button className='btn btn-lg bg-gradient-dark'
                                    style={{ width: "fit-content", fontSize: "20px" }}
                                    onClick={onClose}
                                > Close</button>
                            </div>

                        </div>
                    </div>
                </div>
            )
        }
        else if (success == true){
            {/** ************ When activation/ upload successful ***********************************************************/}
            return (
                <div className="popup-overlay bg-gradient-dark card " style={{
                    position: 'fixed',
                    top: '20%',
                    left: '5%',
                    height: 'auto',
                    width: 'auto',
                    padding: '20px',
                    border: '1px solid #ccc',
                    zIndex: '1000',

                }}>
                    <div style={{ justifyItems: "center", height: "100%", alignContent: "center" }}>
                        <h3 style={{ color: "white" }}>Contract
                            <h4 style={{ color: "white" }}>{data.contractTitle}({contractAddress})</h4>
                            is now Active !
                        </h3>
                        <button className="btn "
                            onClick={onClose}
                            style={{ background: "white", color: "black", fontStyle: "bold", fontSize: "20px", justifySelf: "end", paddingLeft: "30px", paddingRight: "30px" }}
                        > Close</button>
                    </div>
                </div>
            )
        }
    }
}

export default Activate; 