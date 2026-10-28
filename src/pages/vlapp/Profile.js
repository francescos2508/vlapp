import { useEffect, useState } from "react";
import { getProfile, saveRec, togglePassword, updateUserProfile } from "../../api";
import InlineEdit from "../../components/InlineEdit";
import Sidebar from "../../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { auth } from "../../firebase";
import { updatePassword } from "firebase/auth";

export default function Profile() {
    const username = localStorage.getItem('loggedInUser');
    const [profile, setProfile] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPw, setChangingPw] = useState(false);
    const [show, setShow] = useState(false);
    const [showcp, setShowcp] = useState(false);

    useEffect(() => {
        async function getUser() {
            const ret = await getProfile();
            console.log(ret);
            if (ret) setProfile(ret);
        }
        getUser();
    }, []);

    const updateProfile = (field, val) => {
        setProfile((prev) => ({ ...prev, [field]: val }))
    }

    const confirmChangePassword = async () => {
        if (!newPassword || newPassword.length < 6 || newPassword !== confirmPassword) {
            alert('Passwords must match and contain at least 6 characters');
            return;
        }

        if (!auth.currentUser) {
            alert('You must be logged in to change your password.');
            return;
        }

        if (!window.confirm('Change your password? You will use the new password the next time you log in.')) return;

        try {
            await updatePassword(auth.currentUser, newPassword);
            setNewPassword('');
            setConfirmPassword('');
            setChangingPw(false);
            alert('Password changed successfully');
        } catch (error) {
            console.error('Password change error:', error);
            if (error.code === 'auth/requires-recent-login') {
                alert('Please log out, log in again, and retry changing your password.');
            } else {
                alert('Could not change password. Please try again.');
            }
        }
    };


    const saveProfile = async () => {
        try {
            const ret = await saveRec(profile);
            if (!ret) throw new Error('Profile save failed');

            await updateUserProfile(auth.currentUser.uid, profile.username, profile.fullname);
            alert('Your profile has been saved correctly');
        } catch (error) {
            console.error('Profile save error:', error);
            alert('An error occurred while saving your profile. Please try again.');
        }
    };

    return (
        <div className="profile-cont">
            <Sidebar />
            <div className="profile-title">
                <h2><p>Profile</p></h2>
            </div>
            <div className="profile-body">
                {/* <div className="pro-input-cont">
                    <span>Username (not editable)</span><br />
                    <span>{profile?.username || ''}</span>
                    <hr className="profile-hr" />
                </div> */}
                <div className="pro-input-cont">
                    <span>Email (not editable)</span><br />
                    <span>{profile?.email || ''}</span>
                    <hr className="profile-hr" />
                </div>
                <div className="pro-input-cont">
                    <span>Edit Full name</span><br />
                    <InlineEdit value={profile?.fullname || profile?.username || ''} onChange={updateProfile} parms={{ field: 'fullname', type: 'text' }} />
                    <hr className="profile-hr" />
                </div>
                <div className="pro-change-pw">
                    <span>Change password</span>
                    {changingPw ? <div className="change-pw-sec">
                        <div className="pw-cont">
                            <input
                                type={show ? 'text' : 'password'}
                                placeholder="Password"
                                id="Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <div className="icon-eye-pw" onClick={() => togglePassword(show, setShow)}><FontAwesomeIcon icon={show ? 'eye-slash' : 'eye'} /></div>
                        </div>
                        <div className="pw-cont">
                            <input
                                type={showcp ? 'text' : 'password'}
                                placeholder="Confirm Password"
                                id="ConfirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <div className="icon-eye-pw" onClick={() => togglePassword(showcp, setShowcp)}><FontAwesomeIcon icon={showcp ? 'eye-slash' : 'eye'} /></div>
                        </div>
                        <div className="inline-button" onClick={() => confirmChangePassword()}>
                            <div className="btn">CONFIRM NEW PASSWORD</div>
                        </div>
                    </div>
                        :
                        <div className="inline-button" onClick={() => setChangingPw(prev => !prev)}>
                            <div className="btn">CHANGE PASSWORD</div>
                        </div>}
                </div>
            </div>
            <div className="profile-bottom bottom-btn" onClick={() => saveProfile()}>
                <div className="btn">SAVE</div>
            </div>
        </div>
    )
}