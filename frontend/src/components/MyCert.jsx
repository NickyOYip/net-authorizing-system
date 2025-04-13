import React, { useEffect, useContext, useState } from 'react';
import { DataContext } from '../store/dataStore';
import { useUserProfile } from '../hooks/useUserProfile';
import View from './View';


export function MyCert(props) {

    const { data } = useContext(DataContext);
    const { refetchUserProfile } = useUserProfile();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUserProfile = async () => {
            if (!data.account || !data.userContractAddress) return;

            setLoading(true);
            setError(null);

            try {
                await refetchUserProfile();
            } catch (err) {
                console.error('Error loading user profile:', err);
                setError('Failed to load certificates. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        loadUserProfile();
    }, [data.account, data.userContractAddress]);

    //from timestamp to date or hours countdown
    function unixToUtcTime(timestamp, returnComponents = false) {
        const date = new Date(timestamp * 1000); // Convert to milliseconds

        if (date.toUTCString == new Date().toDateString()) {
            // Return {hours, minutes, seconds} as numbers
            return {
                hours: date.getUTCHours(),
                minutes: date.getUTCMinutes(),
                seconds: date.getUTCSeconds()
            };

        } else {
            // Return a formatted UTC string (e.g., "Sat, 27 Jul 2024 10:20:00 GMT")
            return date.toUTCString();
        }
    }

    let info = [];

    if (props == 'Inactive') {

        data.exampleUserProfile1.certificatesList.forEach((certs, index) => {
            if (certs.state == "Inactive") {
                info.push(certs);
            }
        });


    }
    else if (props === 'Active') {
        info = data.exampleUserProfile1.certifiedCertificates;

    }
    else {
        info = data.exampleUserProfile1.certificatesList;
    }

    function viewContract(contractAddress){
         
        return(
            <View
            address = {contractAddress}
            ></View>
        )
    }

    return (
        <div className="card-body px-0 pb-2">
            <div className="table-responsive p-0">
                <table className="table " style={{ textAlign: "center" }}>
                    <thead >
                        <tr>
                            <th className="text-uppercase text-secondary text-xs font-weight-bolder opacity-7">
                                Contract Title
                            </th>
                            <th className="text-uppercase text-secondary text-xs font-weight-bolder opacity-7">
                                Contract Address
                            </th>
                            <th className="text-uppercase text-secondary text-xs font-weight-bolder opacity-7">
                                Contract Type
                            </th>
                            <th className="text-uppercase text-secondary text-xs font-weight-bolder opacity-7">
                                Status
                            </th>
                            <th className="text-uppercase text-secondary text-xs font-weight-bolder opacity-7">
                                Valid from
                            </th>
                            <th className="text-uppercase text-secondary text-xs font-weight-bolder opacity-7">
                                Valid until
                            </th>
                            <th className="text-uppercase text-secondary text-xs font-weight-bolder opacity-7">
                                View Certificate
                            </th>
                            <th className="text-uppercase text-secondary text-xs font-weight-bolder opacity-7">
                                Add New Version
                            </th>


                        </tr>
                    </thead>
                    <tbody >
                        {info.map(cert => (

                            <tr style={{ textAlign: "center", alignContent: "center" }}>
                                <td style={{ textAlign: "center", alignContent: "center" }}>
                                    <h6 className="mb-0 text-sm">{cert.certificateName}</h6>
                                </td>
                                <td style={{ textAlign: "center", alignContent: "center" }}>
                                    <h6 className="mb-0 text-sm">{cert.owner}</h6>
                                </td>
                                <td style={{ textAlign: "center", alignContent: "center" }}>
                                    {/* Type*/}
                                    <span className="badge badge-sm bg-gradient-success" >
                                        Contract Type
                                    </span>
                                </td>
                                <td style={{ textAlign: "center", alignContent: "center" }}>
                                    {/**Status */}
                                    {cert.state === 'Active' ? (
                                        <span className="badge badge-sm bg-gradient-success">
                                            {cert.state}
                                        </span>
                                    ) : (
                                        <span className="badge badge-sm" style={{ background: "grey", color: "white" }}>
                                            {cert.state}
                                        </span>
                                    )
                                    }
                                </td>

                                <td style={{ textAlign: "center", alignContent: "center" }}>
                                    {/* start date */}
                                    <span className="text-secondary text-xs font-weight-bold">
                                        12-4-2023{/*{cert.startDate}*/}
                                    </span>
                                </td>

                                <td style={{ textAlign: "center", alignContent: "center" }}>
                                    {/* end date */}
                                    <span className="text-secondary text-xs font-weight-bold">
                                        12-4-2024{/*{cert.endDate}*/}
                                    </span>
                                </td>

                                <td style={{ textAlign: "center", alignContent: "center" }}
                                //or pass contract address
                                    onClick={()=>{window.location.href = "/view";}}> 
                                    <span className="badge badge-sm bg-gradient-dark" >
                                        View
                                    </span>
                                </td>

                                <td style={{ justifyContent: "center" }}>
                                    <span className="badge badge-sm bg-gradient-dark" >
                                        Edit
                                    </span>
                                </td>

                            </tr>))
                        }
                    </tbody></table></div></div>)

}
export default MyCert;