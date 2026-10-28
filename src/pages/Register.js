import React, { useState, useEffect } from "react";
import styles from "./Login.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { aquery, createNew, createUserProfile, saveRec } from "../api";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { togglePassword } from "../api";

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [show, setShow] = useState(false);
  const [showcp, setShowcp] = useState(false);

  const navigate = useNavigate();
  // localStorage.removeItem('loggedInUser');
  const handleSubmit = async (e) => {
    e.preventDefault();

    var isValid = true;
    var msg = '';

    if (!username) {
      isValid = false;
      msg = 'Please enter a valid username';
    } else if (!email) {
      isValid = false;
      msg = 'Please enter a valid email';
    } else if (!password || password.length < 6) {
      isValid = false;
      msg = 'Please enter a password of at least 6 characters';
    } else if (password !== confirmPassword) {
      isValid = false;
      msg = 'Password not confirmed correctly';
    }

    if (!isValid) {
      alert(msg);
      return;
    }

    let firebaseUser = null;

    try {
      // Create Firebase Authentication account
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      firebaseUser = credential.user;

      const existingProfiles = await aquery('userProfiles', [
        { field: 'username', op: '==', value: username }
      ]);

      if (existingProfiles.length > 0) {
        await deleteUser(firebaseUser);
        alert('This username is already in use, please choose a different one');
        return;
      }

      // Create the VLApp user document
      var newUser = createNew('users');
      newUser.username = username;
      newUser.email = email;
      newUser.firebaseUid = firebaseUser.uid;
      newUser.fullname = fullName || username;
      newUser.user = username;

      // IMPORTANT: password is NOT saved in Firestore


      const ret = await saveRec(newUser);

      if (!ret) {
        await deleteUser(firebaseUser);
        throw new Error('Could not save user profile');
      }

      try {
        await createUserProfile(firebaseUser.uid, username, newUser.fullname);
      } catch (error) {
        await deleteUser(firebaseUser);
        throw error;
      }


      alert('Account created correctly, please login as ' + newUser.email);
      navigate('/login');

    } catch (error) {
      console.error('Registration error:', error);

      if (error.code === 'auth/email-already-in-use') {
        alert('This email is already in use');
      } else if (error.code === 'auth/invalid-email') {
        alert('Please enter a valid email address');
      } else if (error.code === 'auth/weak-password') {
        alert('Password must be at least 6 characters');
      } else if (error.message === 'Could not save user profile') {
        alert('An error occured while creating the account. Please try again.');
      } else {
        alert('An error occured while creating the account. Please try again.');
      }
    }
  };

  return (
    <div className={styles.mainCont} >
      <div className={styles.container}>
        <div className={styles.loginTitle}>
          <h1>Sign up</h1>
          <span>Create an account, choose your username and password</span>
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
          <input
            type="text"
            placeholder="Full name"
            id="Fullname"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            // required
            className={styles.input}
          />
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
              type={show ? 'text' : 'password'}
              placeholder="Password"
              id="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
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
              className={styles.input}
            />
            <div className="icon-eye-pw" onClick={() => togglePassword(showcp, setShowcp)}><FontAwesomeIcon icon={showcp ? 'eye-slash' : 'eye'} /></div>
          </div>
          <button type="submit" className={styles.button}>
            Sign up
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '5rem', fontSize: '0.8rem' }}>
          <span>Already have an account? </span>
          <a style={{ color: 'var(--gold)' }} onClick={() => navigate('/login')}>Login</a>
        </div>
        <div className="copyright">
          <span>Designed and developed by Francesco Saramin</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
