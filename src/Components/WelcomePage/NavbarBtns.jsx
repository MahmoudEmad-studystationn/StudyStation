// File Description
//File Name: Navbar buttons
//Author: Nehal Amr
//Date of creation: 22/9/2025
//Version information: v1.1
// Dependencies:   React, MUI (Button, Stack), react-router-dom (Link)
//Contributors: [Nehal Amr, Mariam Mohammed]
//Last Modified Date [Mariam Mohammed, 1/10/2025, 3:40AM]
//Description: Authentication buttons (Sign up & Log in) for Navbar.
//              Handles hover effects, responsive sizing, routing links, and MUI styling.

import { Link } from "react-router-dom";
import { Button, Stack } from "@mui/material";
import DarkModeToggle from "../Theme/DarkModeToggle";

export default function AuthButtons() {
    const commonSx = {
        backgroundColor: "#9EC1D6",
        color: "#fff",
        textTransform: "none",
        fontFamily: '"Open Sans", sans-serif',
        fontWeight: 600,
        fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" },
        lineHeight: 1.2,
        px: { xs: 3, sm: 4, md: 5 },
        py: { xs: 1, sm: 1.2, md: 1.5 },
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(158, 193, 214, 0.3)",
        minWidth: { xs: "90px", sm: "100px", md: "110px" },
        transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid rgba(255, 255, 255, 0.2)",

        "&:hover": {
            backgroundColor: "#7BA7C7",
            boxShadow: "0 4px 12px rgba(123, 167, 199, 0.4)",
            transform: "translateY(-2px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
        },
        "&:active": {
            transform: "translateY(0px)",
            boxShadow: "0 2px 6px rgba(158, 193, 214, 0.5)",
        }
    };

    return (
        <Stack direction="row" spacing={{ xs: 0.5, sm: 1.5, md: 2 }} alignItems="center" sx={{ justifyContent: "flex-end" }}>
            <DarkModeToggle />
            <Button
                component={Link}
                to="/auth?mode=login"
                variant="contained"
                disableElevation
                sx={commonSx}
            >
                Log in
            </Button>



        </Stack>
    );
}