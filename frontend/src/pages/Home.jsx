import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <main className="min-h-[calc(100vh-64px)] flex items-start justify-center py-16">
            <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-12 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Left: Hero */}
                    <section className="pt-6">
                        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4" style={{ color: "var(--color-text)" }}>
                            Powerful multi-tenant commerce — without the complexity
                        </h1>
                        <p className="text-lg text-slate-600 mb-6">
                            Launch multiple storefronts on a single backend. Tenant data is always isolated — owners manage products, staff handle operations, and customers buy securely.
                        </p>

                        <div className="flex gap-3 items-center">
                            <Link to="/signup/customer" className="inline-flex items-center px-5 py-3 rounded-lg text-base font-semibold" style={{ background: "var(--color-accent)", color: "#fff", boxShadow: "var(--shadow-soft)" }}>
                                Create account
                            </Link>
                            <Link to="/login" className="inline-flex items-center px-4 py-2 rounded-lg text-base font-medium border" style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}>
                                Sign in
                            </Link>
                        </div>

                        <div className="mt-8 text-sm text-slate-500">
                            <div>✅ Role-based access (Owner, Staff, Customer)</div>
                            <div>✅ Tenant isolation by design</div>
                            <div>✅ JWT-based auth & secure APIs</div>
                        </div>
                    </section>

                    {/* Right: feature card / visual */}
                    <aside className="hidden md:block">
                        <div className="rounded-2xl bg-white p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
                            <div className="text-sm uppercase text-slate-400 tracking-wide mb-3">Live dashboard preview</div>
                            <div className="h-64 bg-gradient-to-br from-[#f8fafc] to-white rounded-md border" style={{ borderColor: "var(--color-border)" }}>
                                {/* placeholder: keep simple — do not embed heavy charts */}
                                <div className="p-6 text-slate-500">Dashboard preview placeholder — shows product counts, orders and revenue.</div>
                            </div>
                            <div className="mt-4 text-sm text-slate-500">Quickly add products, invite staff, and track orders.</div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
