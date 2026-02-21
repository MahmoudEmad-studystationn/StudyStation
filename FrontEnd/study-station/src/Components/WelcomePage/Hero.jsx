import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Grid, useTheme } from "@mui/material";
import deskImage from "../../assets/images/Hero.png";
import mobileImage from "../../assets/images/hero2.png";
import mobileImageDark from "../../assets/images/Hero2Dark.png";
import deskImageDark from "../../assets/images/HeroDark.png";
import { useNavigate } from "react-router-dom";

export default function Hero() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isDarkMode = theme.palette.mode === "dark";
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div id="home">
            <Box
                sx={{
                    position: "relative",
                    minHeight: { xs: "60vh", sm: "70vh", md: "80vh", lg: "95vh" },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    px: { xs: 2, sm: 3, md: 6, lg: 8, xl: 10 },
                    py: { xs: 3, sm: 4, md: 5, lg: 6 },
                    overflow: "hidden",
                    textAlign: { xs: "center", sm: "left" },
                    backgroundColor: "transparent",
                }}
            >
                {/* Mobile Image */}
                <Box
                    component="img"
                    src={isDarkMode ? mobileImageDark : mobileImage}
                    alt="Study Station Mobile Background"
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        zIndex: 0,
                        display: { xs: "block", sm: "none", md: "none" },
                        transform: loaded ? "scale(1)" : "scale(1.05)",
                        transition: "transform 1.5s ease-out",
                    }}
                />

                {/* Desktop Image */}
                <Box
                    key={isDarkMode ? "dark" : "light"}
                    component="img"
                    src={isDarkMode ? deskImageDark : deskImage}
                    alt="Study Station Background"
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "center",
                        zIndex: 0,
                        display: { xs: "none", sm: "block", md: "block" },
                        transform: loaded ? "scale(1)" : "scale(1.05)",
                        transition: "transform 1.5s ease-out",
                    }}
                />

                {/* Content */}
                <Grid
                    container
                    spacing={{ xs: 2, sm: 3, md: 4 }}
                    alignItems="center"
                    justifyContent="flex-start"
                    sx={{
                        width: "100%",
                        maxWidth: "1200px",
                        position: "relative",
                        zIndex: 1,
                    }}
                >
                    <Grid item xs={12} md={7} lg={6}>
                        <Box
                            sx={{
                                textAlign: { xs: "center", sm: "left" },
                                maxWidth: "100%",
                                mx: "auto",
                            }}
                        >
                            <Typography
                                component="h1"
                                sx={{
                                    color: isDarkMode ? "#f5f5f5" : "#6a6a6a",
                                    fontWeight: "bold",
                                    fontFamily: "'Nunito', sans-serif",
                                    fontSize: {
                                        xs: "1.75rem",
                                        sm: "2rem",
                                        md: "2.25rem",
                                        lg: "2.5rem",
                                        xl: "2.75rem",
                                    },
                                    mb: { xs: 2, sm: 2.5, md: 3 },
                                    opacity: loaded ? 1 : 0,
                                    transform: loaded ? "translateY(0)" : "translateY(30px)",
                                    transition: "opacity 1s ease-out 0.3s, transform 1s ease-out 0.3s",
                                }}
                            >
                                Welcome to Study Station
                            </Typography>

                            <Typography
                                component="p"
                                sx={{
                                    color: isDarkMode ? "#cfcfcf" : "#868686",
                                    fontFamily: "'Open Sans', sans-serif",
                                    fontSize: {
                                        xs: "0.9rem",
                                        sm: "1rem",
                                        md: "1.1rem",
                                        lg: "1.125rem",
                                    },
                                    mb: { xs: 3, sm: 3.5, md: 4 },
                                    maxWidth: "600px",
                                    mx: "auto",
                                    opacity: loaded ? 1 : 0,
                                    transform: loaded ? "translateY(0)" : "translateY(30px)",
                                    transition: "opacity 1s ease-out 0.6s, transform 1s ease-out 0.6s",
                                }}
                            >
                                Your personal focus zone. Organize your study time, track your progress,
                                and stay motivated all in one place.
                            </Typography>

                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate("/login")}
                                sx={{
                                    backgroundColor: "#8FB7CF",
                                    fontSize: {
                                        xs: "0.875rem",
                                        sm: "0.9rem",
                                        md: "1rem",
                                        lg: "1.1rem",
                                    },
                                    px: { xs: 3, sm: 4, md: 5, lg: 6 },
                                    py: { xs: 1.25, sm: 1.5, md: 1.75, lg: 2 },
                                    textTransform: "none",
                                    borderRadius: "18px",
                                    fontFamily: "'Open Sans', sans-serif",
                                    fontWeight: 600,
                                    boxShadow: "0 4px 15px rgba(143, 183, 207, 0.3)",
                                    opacity: loaded ? 1 : 0,
                                    transform: loaded ? "translateY(0)" : "translateY(30px)",
                                    transition: "opacity 1s ease-out 0.9s, transform 1s ease-out 0.9s, background-color 0.3s, box-shadow 0.3s",
                                    "&:hover": {
                                        backgroundColor: "#7AA5C4",
                                        boxShadow: "0 6px 20px rgba(143, 183, 207, 0.4)",
                                        transform: "translateY(-2px)",
                                    },
                                    "&:active": {
                                        transform: "translateY(0px)",
                                    },
                                }}
                            >
                                Start Focusing
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </div>
    );
}