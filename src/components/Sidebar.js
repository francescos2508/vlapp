import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Sidebar () {
    const [opensb, setOpensb] = useState(false);
    var sbStyle = {width: opensb ? '60%' : 0};
    const navigate = useNavigate();
    const location = useLocation();
    const sbRef = useRef(null);

    function toggleSidebar() {
        setOpensb(prev => !prev);
    }
    async function logOut() {
        try {
            await signOut(auth);
            localStorage.removeItem('loggedInUser');
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            alert('Could not log out. Please try again.');
        }
    }
    function sbNavigate(path) {
        navigate(path);
        toggleSidebar();
    }

    // Hide the button on Login and Welcome pages
    const hideOnPaths = ["/login", '/'];
    if (hideOnPaths.includes(location.pathname)) return null;

    return (
        <>
            {opensb && <div
                onClick={() => setOpensb(false)}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.3)",
                    backdropFilter: 'blur(5px)',
                    zIndex: 1
                }}
            /> }
            <div className="sidebar-main" ref={sbRef}>
                <button onClick={() => toggleSidebar()} className="three-dots">
                    <FontAwesomeIcon icon="fa-bars" />
                </button>
                <div className="sb-menu" style={sbStyle}>
                    <div className="sb-opt-cont">
                        <div className="close-sb" onClick={ () => toggleSidebar() }><FontAwesomeIcon icon='fa-xmark' /></div>
                        <div className="sb-opt" onClick={ () => sbNavigate('/vlapp') }>
                            <FontAwesomeIcon icon='fa-house' />
                            <span>Home</span>
                        </div>
                        <div className="sb-opt" onClick={() => sbNavigate('/profile')}>
                            <FontAwesomeIcon icon='fa-user' />
                            <span>Profile</span>
                        </div>
                        <div className="sb-opt disabled">
                            <FontAwesomeIcon icon='fa-gear' />
                            <span>Settings</span>
                        </div>
                        <div className="sb-opt" onClick={ () => sbNavigate('/exchange') }>
                            <FontAwesomeIcon icon='fa-arrow-right-arrow-left' />
                            <span>Exchange</span>
                        </div>
                        <div className="sb-opt" onClick={ () => { logOut(); toggleSidebar(); } }>
                            <FontAwesomeIcon icon='fa-right-from-bracket' />
                            <span>Logout</span>
                        </div>
                        {/* <div className="sb-opt">
                            <FontAwesomeIcon icon='fa-user' />
                            <span>Demo option</span>
                        </div> */}
                    </div>
                </div>
            </div>
        </>
    )
}