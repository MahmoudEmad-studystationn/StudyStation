import axios from "axios";

const baseUrl = "https://study-station.runasp.net/api/";

export async function signUpApi(formData) {
    try {
        const payload = {
            FirstName: formData.firstName.trim(),
            LastName: formData.lastName.trim(),
            Email: formData.email.trim().toLowerCase(),
            Password: formData.password,
            ConfirmPassword: formData.confirmPassword,
            DateOfBirth: formData.dateOfBirth,
            Gender: formData.gender === "male" ? "Male" : "Female"
        };

        const { data } = await axios.post(`${baseUrl}Users/register`, payload, { timeout: 10000 });
        return { success: true, data };

    } catch (error) {
        const errData = error.response?.data;
        let errMsg = "Registration failed.";

        if (errData?.errors) {
            if (Array.isArray(errData.errors) && errData.errors.length > 0) {
                errMsg = errData.errors[0];
            } else if (typeof errData.errors === 'object') {
                const firstKey = Object.keys(errData.errors)[0];
                errMsg = errData.errors[firstKey][0];
            }
        } else if (errData?.message) {
            errMsg = errData.message;
        }

        return { success: false, message: errMsg };
    }
}

export async function loginApi(formData) {
    try {
        const payload = {
            email: formData.email.trim().toLowerCase(),
            password: formData.password
        };
        const { data } = await axios.post(`${baseUrl}Users/login`, payload);
        if (data.accessToken && data.refreshToken) {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
        }

        return { success: true, data };
    } catch (error) {
        let errMsg = "Invalid email or password";
        if (error.response?.data?.message) {
            errMsg = error.response.data.message;
        } else if (error.response?.data?.error) {
            errMsg = error.response.data.error;
        }
        return { success: false, message: errMsg };
    }
}

export async function forgetPasswordApi({ email, clientURI }) {
    try {
        const { data } = await axios.post(`${baseUrl}Users/forgot-password`, {
            email,
            clientURI
        });
        return { success: true, data, message: data.message || "Reset link sent!" };
    } catch (error) {
        const errorMessage =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.message ||
            "Failed to send reset email";
        return { success: false, message: errorMessage };
    }
}

export async function resetPasswordApi({ email, token, password }) {
    try {
        const payload = {
            email: email.trim().toLowerCase(),
            code: token,
            newPassword: password
        };

        const { data } = await axios.post(`${baseUrl}users/reset-password`, payload);
        return { success: true, data, message: data.message || "Password reset successfully!" };
    } catch (error) {
        if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            if (typeof errors === 'object') {
                const firstKey = Object.keys(errors)[0];
                errorMessage = errors[firstKey][0] || errors[firstKey];
            } else if (Array.isArray(errors)) {
                errorMessage = errors[0];
            }
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.data?.title) {
            errorMessage = error.response.data.title;
        }

        return { success: false, message: errorMessage };
    }
}

export async function verifyCodeApi({ email, code }) {
    try {
        const payload = {
            email: email.trim().toLowerCase(),
            code: code
        };

        const { data } = await axios.post(`${baseUrl}users/verify-email`, payload, { timeout: 10000 });

        return {
            success: true,
            token: data.token || data.resetToken,
            data
        };

    } catch (error) {
        let errMsg = "Invalid verification code";

        if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            if (typeof errors === 'object') {
                const firstKey = Object.keys(errors)[0];
                errMsg = errors[firstKey][0];
            }
        } else if (error.response?.data?.message) {
            errMsg = error.response.data.message;
        } else if (error.response?.data?.error) {
            errMsg = error.response.data.error;
        }

        return { success: false, message: errMsg };
    }
}

export async function resendCodeApi(email) {
    try {
        const payload = {
            Email: email.trim().toLowerCase(),
            CodeType: "VerifyEmail"
        };

        const { data } = await axios.post(`${baseUrl}users/resend-code`, payload, { timeout: 10000 });

        return {
            success: true,
            message: data.message || "Code resent successfully!",
            data
        };

    } catch (error) {
        let errMsg = "Failed to resend code";

        if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            if (typeof errors === 'object') {
                const firstKey = Object.keys(errors)[0];
                errMsg = errors[firstKey][0];
            }
        } else if (error.response?.data?.message) {
            errMsg = error.response.data.message;
        } else if (error.response?.data?.error) {
            errMsg = error.response.data.error;
        }

        return { success: false, message: errMsg };
    }
}

export async function refreshTokenApi() {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
        throw new Error("No refresh token available");
    }
    try {
        const { data } = await axios.post(`${baseUrl}Users/refresh-token`, {
            accessToken,
            refreshToken,
        });
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        return data;
    } catch (error) {
        console.error("Token refresh failed:", error);
        throw error;
    }
}