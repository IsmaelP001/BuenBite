"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import React, { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main>
      <Navbar />
      {children}
      <Footer />
    </main>
  );
}
