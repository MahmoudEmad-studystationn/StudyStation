// File Description
// File Name: Navbar
// Author: Nehal Amr
// Date of creation: 23/9/2025
// Version information: v1.0
// Dependencies:  
// React – for building the component and handling JSX  
// Material-UI (MUI) – for AppBar, Toolbar, Buttons, Menu, Typography, Box, and other UI elements  
// AuthButtons component – custom authentication buttons (Login/Signup)  
// Intersection Observer API – to detect and highlight the active page section on scroll
// Contributors: [Nehal Amr, Mariam Mohammed]
// Last Modified Date: [Mariam Mohammed, 27/9/2025, 5:46PM]
// Description:  
// This file defines the ResponsiveAppBar component, which renders a responsive
// navigation bar for the StudyStation platform. The navbar dynamically changes
// its style on scroll, hides or shows based on scroll direction, and highlights
// the currently active section using the Intersection Observer API. It supports
// a mobile-friendly menu and includes authentication buttons.
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import AuthButtons from "./NavbarBtns";
import { Link } from "react-router-dom";


const pages = [
    { name: "Home", id: "home" },
    { name: "Features", id: "features" },
    { name: "About", id: "about" },
];

function ResponsiveAppBar() {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [scrolled, setScrolled] = React.useState(false);
    const [visible, setVisible] = React.useState(true);
    const lastScrollY = React.useRef(0);
    // 💡 حالة تتبع القسم النشط
    const [activeSection, setActiveSection] = React.useState('home');

    // 🚀 useEffect لـ Scroll and Visibility
    React.useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrolled(currentScrollY > 50);
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setVisible(false);
            } else {
                setVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // 🚀 useEffect لـ Intersection Observer لتحديد القسم النشط
    React.useEffect(() => {
        const sectionIds = pages.map(page => page.id);
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50% 0px', // عندما يصل القسم لمنتصف الشاشة تقريباً
            threshold: 0,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // إذا كان القسم في مجال الرؤية
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, observerOptions);

        // بدء المراقبة
        sectionIds.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                observer.observe(section);
            }
        });

        return () => {
            sectionIds.forEach(id => {
                const section = document.getElementById(id);
                if (section) {
                    observer.unobserve(section);
                }
            });
        };
    }, [pages]);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            // استخدام scrollIntoView مع خاصية smooth للانتقال السلس
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const handlePageClick = (id) => {
        // عند الضغط، قم بالتحديث الفوري
        setActiveSection(id);
        handleCloseNavMenu();
        scrollToSection(id);
    };

    const buttonSx = {
        fontFamily: '"Open Sans", sans-serif',
        fontWeight: 600,
        fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" },
        color: "#5a5a5a",
        textTransform: "none",
        my: 2,
        mx: 1,
        display: "block",
        position: "relative",
        padding: { xs: "8px 12px", sm: "10px 16px", md: "10px 20px" },
        borderRadius: "6px",
        transition: "all 0.3s ease",
        "&:before": {
            content: '""',
            position: "absolute",
            width: "0%",
            height: "2px",
            bottom: "6px",
            left: "50%",
            backgroundColor: "#8fb7cc",
            transition: "all 0.3s ease",
            transform: "translateX(-50%)",
        },
        "&:hover": {
            backgroundColor: "rgba(143, 183, 204, 0.08)",
            color: "#4a4a4a",
            "&:before": {
                width: "80%",
            },
        },
    };

    const logoSx = {
        fontFamily: '"Open Sans", sans-serif',
        fontWeight: 700,
        textDecoration: "none",
        fontSize: { xs: "1.1rem", md: "1.25rem" },
        letterSpacing: "0.5px",
        transition: "all 0.3s ease",
        "&:hover": { transform: "scale(1.02)" },
    };

    return (
        <AppBar
            sx={{
                backgroundColor: scrolled ? "rgba(255, 255, 255, 0.9)" : "transparent",
                boxShadow: scrolled ? "0 4px 12px rgba(0, 0, 0, 0.15)" : "none",
                backdropFilter: scrolled ? "blur(8px)" : "none",
                WebkitBackdropFilter: scrolled ? "blur(8px)" : "none",
                borderBottom: scrolled ? "1px solid rgba(0, 0, 0, 0.08)" : "none",
                fontFamily: '"Open Sans", sans-serif',
                transition: "transform 0.3s ease-in-out, background-color 0.3s ease, box-shadow 0.3s ease, border-bottom 0.3s ease, backdrop-filter 0.3s ease",
                transform: visible ? "translateY(0)" : "translateY(-100%)",
            }}
        >
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ minHeight: "60px" }}>
                    {/* Logo Large Screen */}
                    {/* ... (Logo Code) ... */}
                    <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
                        <Typography variant="h6" sx={{ ...logoSx, color: "#6a6a6a" }}>
                            Study
                        </Typography>
                        <Typography variant="h6" sx={{ ...logoSx, color: "#8fb7cc" }}>
                            Station
                        </Typography>
                    </Box>

                    {/* Menu Icon Small Screen */}
                    <Box sx={{ display: { xs: "flex", md: "none" } }}>
                        <IconButton
                            size="large"
                            aria-label="menu"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            sx={{
                                color: "#6a6a6a",
                                padding: "10px",
                                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                "&:hover": {
                                    transform: "translateY(-2px)",
                                    color: "#4a4a4a",
                                },
                            }}
                        >
                            <MenuIcon sx={{ fontSize: "1.6rem" }} />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                            keepMounted
                            transformOrigin={{ vertical: "top", horizontal: "left" }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: "block", md: "none" },
                                "& .MuiPaper-root": { borderRadius: "12px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)", mt: 1 },
                            }}
                        >
                            {pages.map((page) => (
                                <MenuItem
                                    key={page.name}
                                    onClick={() => handlePageClick(page.id)}
                                    selected={page.id === activeSection}
                                    sx={{
                                        transition: "all 0.3s ease",
                                        "&:hover": { backgroundColor: "rgba(143, 183, 204, 0.1)" },
                                        // يمكن تعديل هذا النمط للتمييز إذا كان activeSection
                                        ...(page.id === activeSection && { backgroundColor: "rgba(143, 183, 204, 0.2)", color: "#4a4a4a" })
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            textAlign: "center",
                                            fontFamily: '"Open Sans", sans-serif',
                                            fontWeight: 600,
                                            fontSize: "1rem",
                                            color: "#5a5a5a",
                                            textDecoration: "none",
                                        }}
                                    >
                                        {page.name}
                                    </Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    {/* Logo Small Screen */}
                    {/* ... (Small Logo Code) ... */}
                    <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 700, color: "#6a6a6a", textDecoration: "none", fontSize: "1.1rem" }}>
                            Study
                        </Typography>
                        <Typography variant="h6" sx={{ fontFamily: '"Open Sans", sans-serif', fontWeight: 700, color: "#8fb7cc", textDecoration: "none", fontSize: "1.1rem" }}>
                            Station
                        </Typography>
                    </Box>

                    {/* Center Pages Large Screen */}
                    <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent: "center", gap: 0.5 }}>
                        {pages.map((page) => {
                            const isActive = page.id === activeSection;
                            const activeButtonStyle = {
                                ...buttonSx,
                                position: "relative",
                                ...(isActive && {
                                    color: "#4a4a4a",
                                    "&::after": {
                                        content: '""',
                                        position: "absolute",
                                        bottom: "5px",
                                        left: "50%",
                                        width: "80%",
                                        height: "2.5px",
                                        backgroundColor: "#8fb7cc",
                                        transform: "translateX(-50%)",
                                        transition: "width 0.3s ease-in-out",
                                    },
                                    "&:hover": {
                                        backgroundColor: "transparent",
                                        color: "#4a4a4a",
                                        "&:before": { width: "0%" },
                                        "&::after": { width: "80%" },
                                    }
                                }),
                                ...(!isActive && {
                                    color: "#5a5a5a",
                                    "&::after": {
                                        content: '""',
                                        position: "absolute",
                                        bottom: "5px",
                                        left: "50%",
                                        width: "0%",
                                        height: "2.5px",
                                        backgroundColor: "#8fb7cc",
                                        transform: "translateX(-50%)",
                                        transition: "width 0.3s ease-in-out",
                                    },
                                    "&:hover": {
                                        backgroundColor: "transparent",
                                        color: "#4a4a4a",
                                        "&::after": {
                                            width: "80%",
                                        },
                                    },
                                }),
                            };

                            return (
                                <Button
                                    key={page.name}
                                    onClick={() => handlePageClick(page.id)}
                                    sx={activeButtonStyle}
                                >
                                    {page.name}
                                </Button>
                            );
                        })}
                    </Box>

                    {/* Auth Buttons */}
                    <Box sx={{ display: "flex" }}>
                        <AuthButtons />
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default ResponsiveAppBar;