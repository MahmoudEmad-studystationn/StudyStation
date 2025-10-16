import React from 'react'
import Features from '../Components/WelcomePage/Features'
import Navbar from '../Components/WelcomePage/Navbar'
import Footer from '../Components/WelcomePage/Footer'
import Hero from '../Components/WelcomePage/Hero'
import About from '../Components/WelcomePage/About'


export default function Home() {
    return (
        <>
            <Navbar />
            <Hero />
            <Features />
            <About/>
            <Footer />
        </>
    )
}