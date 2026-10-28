import React, { useState } from "react";
import styles from "./Login.module.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { auth } from "../firebase";
import { aquery, saveRec, togglePassword } from "../api";

function MigrateAccount() {
    const [username, setUsername] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            alert("New password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            alert("New password is not confirmed correctly");
            return;
        }

        try {
            const users = await aquery("users", [
                { field: "username", op: "==", value: username }
            ]);

            if (!users || users.length === 0) {
                alert("Username not found");
                return;
            }

            const user = users[0];

            if (user.firebaseUid) {
                alert("This account has already been migrated");
                return;
            }

            if (user.password !== oldPassword) {
                alert("Current password is incorrect");
                return;
            }

            let firebaseUser = null;

            try {
                const credential = await createUserWithEmailAndPassword(
                    auth,
                    email,
                    newPassword
                );

                firebaseUser = credential.user;

                await saveRec({
                    ...user,
                    email: email,
                    firebaseUid: firebaseUser.uid
                });

                alert("Account updated correctly. You can now login with your email and new password.");

                navigate("/login");

            } catch (error) {
                console.error("Migration error:", error);

                // Roll back Firebase account if Firestore update failed
                if (firebaseUser) {
                    try {
                        await deleteUser(firebaseUser);
                    } catch (rollbackError) {
                        console.error("Rollback error:", rollbackError);
                    }
                }

                if (error.code === "auth/email-already-in-use") {
                    alert("This email is already in use");
                } else if (error.code === "auth/invalid-email") {
                    alert("Please enter a valid email address");
                } else if (error.code === "auth/weak-password") {
                    alert("New password must be at least 6 characters");
                } else {
                    alert("An error occured while updating your account");
                }
            }

        } catch (error) {
            console.error("Migration verification error:", error);
            alert("An error occured while verifying your account");
        }
    };

    return (
        <div className={styles.mainCont}>
            <div className={styles.container}>

                <div className={styles.loginTitle}>
                    <h1>Update your account</h1>
                    <span>
                        Please update your account to continue using VLApp
                    </span>
                </div>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        placeholder="Username"
                        id="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className={styles.input}
                    />

                    <div className="pw-cont">
                        <input
                            type={showOld ? "text" : "password"}
                            placeholder="Current password"
                            id="OldPassword"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                            className={styles.input}
                        />

                        <div
                            className="icon-eye-pw"
                            onClick={() => togglePassword(showOld, setShowOld)}
                        >
                            <FontAwesomeIcon
                                icon={showOld ? "eye-slash" : "eye"}
                            />
                        </div>
                    </div>

                    <input
                        type="email"
                        placeholder="Email"
                        id="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={styles.input}
                    />

                    <div className="pw-cont">
                        <input
                            type={showNew ? "text" : "password"}
                            placeholder="New password"
                            id="NewPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            className={styles.input}
                        />

                        <div
                            className="icon-eye-pw"
                            onClick={() => togglePassword(showNew, setShowNew)}
                        >
                            <FontAwesomeIcon
                                icon={showNew ? "eye-slash" : "eye"}
                            />
                        </div>
                    </div>

                    <div className="pw-cont">
                        <input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm new password"
                            id="ConfirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={styles.input}
                        />

                        <div
                            className="icon-eye-pw"
                            onClick={() => togglePassword(showConfirm, setShowConfirm)}
                        >
                            <FontAwesomeIcon
                                icon={showConfirm ? "eye-slash" : "eye"}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.button}
                    >
                        Update account
                    </button>

                </form>

                <div
                    style={{
                        textAlign: "center",
                        marginTop: "2rem",
                        fontSize: "0.8rem"
                    }}
                >
                    <a
                        style={{ color: "var(--gold)" }}
                        onClick={() => navigate("/login")}
                    >
                        Back to login
                    </a>
                </div>

                <div className="copyright">
                    <span>Designed and developed by Francesco Saramin</span>
                </div>

            </div>
        </div>
    );
}

export default MigrateAccount;