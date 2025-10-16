import React from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import deskImage from "../../assets/images/Hero.png";
import mobileImage from "../../assets/images/hero2.png"; // أضيفي مسار الصورة الجديدة
import { useNavigate } from "react-router-dom";

export default function StudyStation() {
    const navigate = useNavigate();

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
                }}
            >
                {/* صورة للشاشات المتوسطة فقط */}
                <Box
                    component="img"
                    src={mobileImage}
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
                        zIndex: -1,
                        display: { xs: "block", sm: "none", md: "none" },
                    }}
                />

                {/* الصورة الخلفية للشاشات الكبيرة */}
                <Box
                    component="img"
                    src={deskImage}
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
                        zIndex: -1,
                        display: { xs: "none", sm: "block", md: "block" },
                    }}
                />

                {/* Overlay للشاشات الكبيرة فقط */}
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        zIndex: -1,
                        display: { xs: "none", sm: "none", md: "block" },
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "#ffffff",
                        zIndex: -1,
                        display: { xs: "block", sm: "none", md: "none" },
                    }}
                />
                <Grid
                    container
                    spacing={{ xs: 2, sm: 3, md: 4 }}
                    alignItems="center"
                    sx={{ width: "100%", maxWidth: "1200px" }}
                >
                    <Grid item xs={12} md={7} lg={6}>
                        <Box
                            sx={{
                                textAlign: { xs: "center", sm: "left" },
                                maxWidth: { xs: "100%", sm: "90%", md: "100%" },
                                mx: { xs: "auto", sm: 0 },
                            }}
                        >
                            <Typography
                                component="h1"
                                sx={{
                                    color: "#6a6a6a",
                                    fontWeight: "bold",
                                    fontFamily: "'Nunito', sans-serif",
                                    fontSize: {
                                        xs: "1.75rem",
                                        sm: "2rem",
                                        md: "2.25rem",
                                        lg: "2.5rem",
                                        xl: "2.75rem"
                                    },
                                    lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 },
                                    mb: { xs: 2, sm: 2.5, md: 3 },
                                    textShadow: { xs: "none", md: "0 1px 2px rgba(255,255,255,0.8)" },
                                }}
                            >
                                Welcome to Study Station
                            </Typography>

                            <Typography
                                component="p"
                                sx={{
                                    color: "#868686",
                                    fontFamily: "'Open Sans', sans-serif",
                                    fontSize: {
                                        xs: "0.9rem",
                                        sm: "1rem",
                                        md: "1.1rem",
                                        lg: "1.125rem"
                                    },
                                    lineHeight: { xs: 1.5, sm: 1.6, md: 1.7 },
                                    mb: { xs: 3, sm: 3.5, md: 4 },
                                    maxWidth: { xs: "90%", sm: "80%", md: "70%" },
                                    textShadow: { xs: "none", md: "0 1px 1px rgba(255,255,255,0.8)" },
                                }}
                            >
                                Your personal focus zone. Organize your study time, track your progress, and stay motivated all in one place.
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
                                        lg: "1.1rem"
                                    },
                                    px: { xs: 3, sm: 4, md: 5, lg: 6 },
                                    py: { xs: 1.25, sm: 1.5, md: 1.75, lg: 2 },
                                    textTransform: "none",
                                    borderRadius: "18px",
                                    fontFamily: "'Open Sans', sans-serif",
                                    fontWeight: 600,
                                    boxShadow: "0 4px 15px rgba(143, 183, 207, 0.3)",
                                    transition: "all 0.3s ease-in-out",
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
                    <Grid
                        item
                        xs={0}
                        md={5}
                        lg={6}
                        sx={{ display: { xs: "none", md: "block" } }}
                    />
                </Grid>
            </Box>
        </div>
    );
}