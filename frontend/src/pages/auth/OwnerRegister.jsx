import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function OwnerRegister() {
    const { registerOwner } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        tenant_name: "",
        subdomain: "",
        contact_email: "",
        owner_username: "",
        owner_email: "",
        owner_password: ""
    });
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await registerOwner(formData);
            navigate("/dashboard/stats"); // Redirect to owner dashboard
        } catch (err) {
            setError("Registration failed. Subdomain might be taken.");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Start your business</h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Create your store and start selling today
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input name="tenant_name" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Store Name" onChange={handleChange} />
                        </div>
                        <div>
                            <input name="subdomain" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Subdomain (e.g. mystore)" onChange={handleChange} />
                        </div>
                        <div>
                            <input name="contact_email" type="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Support Email" onChange={handleChange} />
                        </div>
                        <div>
                            <input name="owner_username" type="text" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Owner Username" onChange={handleChange} />
                        </div>
                        <div>
                            <input name="owner_email" type="email" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Owner Email" onChange={handleChange} />
                        </div>
                        <div>
                            <input name="owner_password" type="password" required className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Password" onChange={handleChange} />
                        </div>
                    </div>

                    <div>
                        <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Create Account
                        </button>
                    </div>
                </form>
                <div className="text-center text-sm">
                    <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">Already have an account? Sign in</Link>
                </div>
            </div>
        </div>
    );
}
