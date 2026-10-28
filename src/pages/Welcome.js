import React from "react";
import {useApp} from '../AppContext';
import { useNavigate } from "react-router-dom";

function Welcome () {
    const navigate = useNavigate();
    const user = localStorage.getItem('loggedInUser');
    const { setActiveApp } = useApp(); 

    const openXSplit = () => {
        setActiveApp("xsplit"); 
        navigate("/xsplit");     
    };

    const openVlapp = () => {
        setActiveApp("vlapp");   
        navigate("/vlapp");      
    };
    return (
        <div className="welcome-container">
            <div>Welcome {user}, select the app</div>
            <div>
                <button onClick={openXSplit}>xSplit</button>
                <button onClick={openVlapp}>Vlapp</button>
            </div>
        </div>
    );
}

export default Welcome;