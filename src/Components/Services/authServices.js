import axios from "axios";

const baseUrl = "http://studystation-1.runasp.net/";

export async function signUpApi(formData) {
    try {
        const { data } = await axios.post(`${baseUrl}api/Users/Registration`, formData);
        return { success: true, data };
    } catch (error) {
        console.error("Signup Error:", error.response?.data || error);
        return {
            success: false,
            message: error.response?.data || "Registration failed"
        };
    }
}


export async function loginApi(formData) {
    try {
        const { data } = await axios.post(`${baseUrl}api/Users/Login`, formData);
        return { success: true, data };
    } catch (error) {
        console.error("Error:", error);
        return {
            success: false,
            message: error.response?.data?.error || "Login failed"
        };
    }
}

export async function forgetPasswordApi(formData) {
    try {
        const { data } = await axios.post(`${baseUrl}api/Users/ForgetPassword`, formData);
        return { success: true, data };
    } catch (error) {
        console.error("Error:", error);
        return {
            success: false,
            message: error.response?.data?.error || "Login failed"
        };
    }
}
export async function resetPasswordApi(formData) {
    try {
        const { data } = await axios.post(`${baseUrl}api/Users/ForgetPassword`, formData);
        return { success: true, data };
    } catch (error) {
        console.error("Error:", error);
        return {
            success: false,
            message: error.response?.data?.error || "Login failed"
        };
    }
}

// ==============================
// export async function signUpApi(formData) {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             if (!formData.email || !formData.password) {
//                 resolve({ success: false, message: "Email and password are required" });
//             } else if (formData.email === "test@example.com") {
//                 resolve({ success: false, message: "Email already exists" });
//             } else {
//                 resolve({ success: true, message: "Account created successfully" });
//             }
//         }, 1000);
//     });
// }

// export async function loginApi(formData) {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             if (!formData.email || !formData.password) {
//                 resolve({ success: false, message: "Email and password are required" });
//             } else if (formData.email === "test@example.com" && formData.password === "password123") {
//                 resolve({ success: true, message: "Login successful" });
//             } else {
//                 resolve({ success: false, message: "Invalid email or password" });
//             }
//         }, 1000);
//     });
// }

// export async function forgetPasswordApi(email) {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             if (!email) {
//                 resolve({ success: false, message: "Email is required" });
//             } else if (email === "test@example.com") {
//                 resolve({ success: true, message: "Reset instructions sent to your email" });
//             } else {
//                 resolve({ success: false, message: "Email not found" });
//             }
//         }, 1000);
//     });
// }

// export async function resetPasswordApi(newPassword, confirmPassword) {
//     return new Promise((resolve) => {
//         setTimeout(() => {
//             if (!newPassword || !confirmPassword) {
//                 resolve({ success: false, message: "Please enter both passwords" });
//             } else if (newPassword !== confirmPassword) {
//                 resolve({ success: false, message: "Passwords do not match" });
//             } else if (newPassword.length < 6) {
//                 resolve({ success: false, message: "Password is too short" });
//             } else {
//                 resolve({ success: true, message: "Password reset successfully" });
//             }
//         }, 1000);
//     });
// }