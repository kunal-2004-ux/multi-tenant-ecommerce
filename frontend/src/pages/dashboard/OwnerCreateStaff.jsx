import React, { useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function OwnerCreateStaff() {
    const { user } = useAuth();
    const [form, setForm] = useState({ username: "", email: "", password: "" });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError(null); setSuccess(null);
        try {
            const res = await api.post("/api/auth/create-staff/", form);
            setSuccess("Staff account created.");
            setForm({ username: "", email: "", password: "" });
        } catch (err) {
            console.error("Create staff error:", err.response?.status, err.response?.data);
            setError(err.response?.data || "Failed to create staff");
        }
    };

    if (user?.role !== "OWNER") return <div>You are not authorized to create staff.</div>;

    return (
        <div className="mx-auto max-w-xl">
            <h2 className="text-2xl font-semibold mb-4">Invite Staff</h2>
            {error && <div className="mb-4 rounded bg-red-100 px-4 py-2 text-sm text-red-700">{JSON.stringify(error)}</div>}
            {success && <div className="mb-4 rounded bg-green-100 px-4 py-2 text-sm text-green-700">{success}</div>}
            <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded shadow-sm">
                <label className="block"><div className="text-sm font-medium mb-1">Username</div><input name="username" value={form.username} onChange={onChange} className="w-full rounded border px-3 py-2" required /></label>
                <label className="block"><div className="text-sm font-medium mb-1">Email</div><input name="email" value={form.email} onChange={onChange} type="email" className="w-full rounded border px-3 py-2" required /></label>
                <label className="block">
                    <div className="text-sm font-medium mb-1">Password</div>
                    <div className="relative">
                        <input name="password" value={form.password} onChange={onChange} type={showPassword ? "text" : "password"} className="w-full rounded border px-3 py-2 pr-10" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600">
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </label>
                <div className="flex justify-end gap-2"><button type="button" onClick={() => navigate("/owner")} className="px-4 py-2 rounded bg-gray-200">Cancel</button><button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Create staff</button></div>
            </form>
        </div>
    );
}
