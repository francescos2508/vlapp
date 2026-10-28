import React, { useState, useEffect } from "react";
import styles from "./Login.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../AppContext";
import { aquery, togglePassword } from "../api";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


function Login() {
  // const [username, setUsername] = useState("Vlad");
  // const [password, setPassword] = useState("VladVlad");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const {setUser} = useApp();
  const [show, setShow] = useState(false);
  const [loginType, setLoginType] = useState('vlapp');        // other option: kali

  const navigate = useNavigate();
  // Hardcoded simples users for testing
  const validUsers = [{username: 'admin', password: 'admin'}, {username: 'Vlad', password: 'Vlad'}];

  // const loginKali = async (e) => {
  //   setLoginType('kali');
  //   handleSubmit(e);
  // }

  const loginVlapp = async (e) => {
    setLoginType('vlapp');
    handleSubmit(e);
  }

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const firebaseUser = credential.user;

    const users = await aquery('users', [
      { field: 'firebaseUid', op: '==', value: firebaseUser.uid }
    ]);

    if (!users || users.length === 0) {
      alert("Account authenticated, but Vlapp profile not found.");
      return;
    }

    const user = users[0];

    setUser(user.username);
    localStorage.setItem("loggedInUser", user.username);

    if (loginType === 'vlapp' || !loginType) {
      navigate('/vlapp');
    } else {
      navigate('/kali');
    }

  } catch (error) {
    console.error('Login error:', error);

    if (
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password'
    ) {
      alert("Invalid email or password");
    } else {
      alert("An error occured while trying to login");
    }
  }
};

  return (
    <div className={styles.mainCont} >
      <div className={styles.container}>
        <div className={styles.loginTitle}>
          <h1>Welcome back to Vlapp</h1>
          <span>Please login to continue</span>
        </div>
        <form onSubmit={handleSubmit}>
          {/* <input
            type="text"
            placeholder="Username"
            id="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.input}
          /> */}
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
          <button /* type="submit" */ className={styles.button} onClick={(e) => loginVlapp(e) }>
            Login
          </button>
        </form>
        {/* <div style={{textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem'}}>
          <span>Wanna join the dark side of Vlapp? </span>
          <br />
          <a style={{color: 'var(--gold)'}} onClick={(e) => loginKali(e) }>Login here</a>
        </div> */}
        <div style={{textAlign: 'center', marginTop: '3rem', fontSize: '0.8rem'}}>
          <span>Don't have an account? </span>
          <a style={{color: 'var(--gold)'}} onClick={() => navigate('/register')}>Sign up</a>
        </div>
        <div className="copyright">
          <span>Designed and developed by Francesco Saramin</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
