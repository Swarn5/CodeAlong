import React, { ReactNode } from "react";
import Navbar from "../Navbar";
import Footer from "./Footer";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
       <div className="flex flex-col justify-between min-h-screen">
      <Navbar />
      <main className="flex-1 flex overflow-y-auto bg-white">
        {children}
      </main>
      <Footer />
    </div>
    </>
  );
};

export default Layout;
