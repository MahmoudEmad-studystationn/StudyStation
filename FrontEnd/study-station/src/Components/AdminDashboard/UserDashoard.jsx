import axios from "axios";
import { useState, useEffect } from "react";
import { useThemeContext } from "../Theme/ThemeContext";
import SidebarDashboard from "./SidebarDashboard";
import TopbarDashboard from "./Topbardashboard";

function Badge({ type }) {
    const styles = {
        Active: { bg: "rgba(34,197,94,.12)", color: "#16a34a", dot: "#22c55e" },
        Suspended: { bg: "rgba(248,113,113,.12)", color: "#dc2626", dot: "#f87171" },
        Admin: { bg: "rgba(61,113,141,.15)", color: "#3D718D", dot: "#3D718D" },
        User: { bg: "rgba(104,104,104,.1)", color: "#686868", dot: "#686868" },
    };

    const s = styles[type] || styles.User;

    return (
        <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 9px",
            borderRadius: 999,
            fontSize: ".68rem",
            fontWeight: 700,
            background: s.bg,
            color: s.color
        }}>
            <span style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: s.dot
            }} />
            {type}
        </span>
    );
}

function UserRow({ user, onRoleChange, onToggleStatus }) {
    return (
        <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            <td style={{ padding: ".85rem 1rem" }}>{user.name}</td>
            <td style={{ padding: ".85rem 1rem" }}>{user.email}</td>
            <td style={{ padding: ".85rem 1rem" }}>
                <Badge type={user.role} />
            </td>
            <td style={{ padding: ".85rem 1rem" }}>
                <Badge type={user.status} />
            </td>
            <td style={{ padding: ".85rem 1rem" }}>
                <select
                    value={user.role}
                    onChange={(e) => onRoleChange(user.id, e.target.value)}
                >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                </select>
                <button
                    onClick={() => onToggleStatus(user.id)}
                    style={{ marginLeft: 10 }}
                >
                    {user.status === "Active" ? "Suspend" : "Activate"}
                </button>
            </td>
        </tr>
    );
}

export default function UsersPage() {

    const { isDarkMode } = useThemeContext();
    const [users, setUsers] = useState([]);
    const [query, setQuery] = useState("");

    const token = localStorage.getItem("accessToken");

    const fetchUsers = async () => {
        try {
            const res = await axios.get(
                "https://study-station.runasp.net/api/Admin/users",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setUsers(res.data);
        } catch (err) {
            console.log("GET users error:", err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (id, role) => {
        try {
            await axios.put(
                `https://study-station.runasp.net/api/Admin/users/${id}/role`,
                { userId: id, newRole: role },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(prev =>
                prev.map(u => u.id === id ? { ...u, role } : u)
            );
        } catch (err) {
            console.log("Role error:", err);
        }
    };

    const handleToggleStatus = async (id) => {
        const user = users.find(u => u.id === id);
        const action = user.status === "Active" ? "Suspend" : "Activate";

        try {
            await axios.put(
                `https://study-station.runasp.net/api/Admin/users/${id}/status`,
                { userId: id, action },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(prev =>
                prev.map(u =>
                    u.id === id
                        ? { ...u, status: action === "Suspend" ? "Suspended" : "Active" }
                        : u
                )
            );
        } catch (err) {
            console.log("Status error:", err);
        }
    };

    const filtered = users.filter(u =>
        u.name?.toLowerCase().includes(query.toLowerCase()) ||
        u.email?.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <>
            <SidebarDashboard />
            <TopbarDashboard breadcrumb="Users" />

            <main style={{ padding: 20, marginLeft: 260, marginTop: 60 }}>
                <h2>Users Management</h2>

                <input
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />

                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(user => (
                            <UserRow
                                key={user.id}
                                user={user}
                                onRoleChange={handleRoleChange}
                                onToggleStatus={handleToggleStatus}
                            />
                        ))}
                    </tbody>
                </table>
            </main>
        </>
    );
}