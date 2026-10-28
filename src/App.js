import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./AppContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MigrateAccount from "./pages/MigrateAccount";
import Welcome from "./pages/Welcome";
// import HomexSplit from "./pages/xsplit/HomexSplit"; 
import HomeVlapp from "./pages/vlapp/HomeVlapp";
import NewRecipe from "./pages/vlapp/NewRecipe";
import UseRecipe from "./pages/vlapp/UseRecipe";
import BackButton from "./components/BackButton";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { DndContext } from "@dnd-kit/core";
import "./icons";
import './App.css';
import Exchange from "./pages/vlapp/Exchange";
import Profile from "./pages/vlapp/Profile";
import KaliHome from "./pages/kali/KaliHome";

function MainApp() {
  const { activeApp } = useApp();

  function PrivateRoute({ children }) {
    const [user, setUser] = useState(undefined);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });

      return unsubscribe;
    }, []);

    if (user === undefined) return <div className="loader"></div>;

    return user ? children : <Navigate to="/login" replace />;
  }

  return (
    <DndContext>
      <BrowserRouter>
        {/* <BackButton /> */}
        {/* <Sidebar /> */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/welcome" element={<PrivateRoute><Welcome /></PrivateRoute>} />

          {/* xSplit */}
          <Route path="/xsplit" element={<PrivateRoute><div>Work in progress...</div></PrivateRoute>} />

          {/* Vlapp */}
          <Route path="/vlapp" element={<PrivateRoute><HomeVlapp /></PrivateRoute>} />
          <Route path="/new-recipe" element={<PrivateRoute><NewRecipe /></PrivateRoute>} />
          <Route path="/use-recipe" element={<PrivateRoute><UseRecipe /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/exchange" element={<PrivateRoute><Exchange /></PrivateRoute>} />
          <Route path="/migrate-account" element={<MigrateAccount />} />

          {/* Kali */}
          <Route path="/kali" element={<PrivateRoute><KaliHome /></PrivateRoute>} />

          {/* catch all other paths */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </DndContext>
  );
}

function App() {


  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;