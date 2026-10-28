import React from "react";
import { useApp } from "../AppContext";
import HomeVlapp from "./vlapp/HomeVlapp";
// import HomeVlapp from "./vlapp/HomeVlapp";

function Home() {
  const { activeApp } = useApp();

  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      {/* {activeApp === "xsplit" && <HomexSplit />} */}
      {activeApp === "xsplit" && <h2>Still developing...</h2>}
      {activeApp === "vlapp" && <HomeVlapp />}

      
    </div>
  );
}

export default Home;