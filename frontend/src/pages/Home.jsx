import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <main className="min-h-[calc(100vh-64px)] flex items-center bg-gradient-to-br from-[#EEF3FF] to-white relative overflow-hidden">

            {/* 1. Abstract Shape / Blob Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-100px] left-[-100px] w-[600px] h-[600px] bg-blue-400/10 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-purple-400/5 rounded-full blur-3xl opacity-60"></div>
            </div>

            <div className="container-max py-20 relative z-10 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Left Column: Hero Content */}
                    <section className="lg:col-span-6 lg:pr-8 relative">

                        {/* 5. Soft Gradient Line Divider (Visual Separation) */}
                        {/* This acts as a divider on large screens if positioned right, or we just rely on grid gap. 
                 User asked for a soft divider. Let's put a border on the right of this section for LG screens. */}
                        <div className="hidden lg:block absolute right-0 top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent"></div>



                        {/* 2. Tightened Heading */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-slate-900 mb-6">
                            E-Commerce for <br className="hidden sm:block" /> modern platforms.
                        </h1>

                        {/* 10. Increased Line Height */}
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                            The all-in-one infrastructure for multi-tenant e-commerce. Scale faster with isolated stores and powerful APIs — built for developers, designed for growth.
                        </p>

                        {/* 4. Improved CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <Link
                                to="/signup/customer"
                                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-600 text-white text-base font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
                            >
                                Start building
                                {/* Right Arrow Icon */}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path></svg>
                            </Link>

                            <Link
                                to="/login"
                                className="inline-flex items-center px-6 py-4 rounded-xl border border-slate-200 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                            >
                                Sign in
                            </Link>
                        </div>

                        {/* 6. Microcopy */}
                        <div className="mt-3 text-xs text-slate-400 font-medium pl-1">
                            No credit card required
                        </div>

                        {/* 3. Trusted By Logo Row */}
                        <div className="mt-12 pt-8 border-t border-slate-100/60">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">Trusted by next-gen teams</p>
                            <div className="flex flex-wrap gap-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                {/* Fake Logos (Text based for now as requested) */}
                                <span className="font-bold text-slate-600 text-lg font-sans tracking-tight">Nova</span>
                                <span className="font-bold text-slate-600 text-lg font-serif">PixelCart</span>
                                <span className="font-black text-slate-700 text-lg tracking-tighter">StackScale</span>
                                <span className="font-semibold text-slate-600 text-lg italic">CommerceFlow</span>
                            </div>
                        </div>
                    </section>

                    {/* Right Column: Dashboard Card */}
                    <aside className="hidden lg:block lg:col-span-6 lg:pl-12">
                        {/* 7. Elevated Dashboard Card */}
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 transform rotate-1 hover:rotate-0 transition-transform duration-700">

                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <div className="text-sm font-semibold text-slate-900">Store Performance</div>
                                    <div className="text-xs text-slate-500">Last 30 days</div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                </div>
                            </div>

                            {/* Preview Content */}
                            <div className="space-y-6">
                                {/* Chart Placeholder */}
                                <div className="h-48 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group">
                                    <div className="absolute inset-x-0 bottom-0 h-24 bg-blue-50/50 skew-y-3 transform origin-bottom-left"></div>
                                    <span className="text-sm text-slate-400 font-medium relative z-10">Revenue Chart Preview</span>
                                </div>

                                {/* 9. Improved Stats Cards (Abstract Data Mode) */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Products</div>
                                        <div className="space-y-2">
                                            {/* Abstract Skeleton Representation */}
                                            <div className="h-6 w-16 bg-slate-200 rounded-md"></div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full w-3/4 bg-blue-500 rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Revenue Trend</div>
                                        <div className="space-y-2">
                                            {/* Abstract Trend Line */}
                                            <div className="h-6 w-20 bg-slate-200 rounded-md"></div>
                                            <div className="flex items-end gap-1 h-3 mt-1">
                                                <div className="w-1 h-1/2 bg-green-300 rounded-sm"></div>
                                                <div className="w-1 h-3/4 bg-green-400 rounded-sm"></div>
                                                <div className="w-1 h-2/3 bg-green-300 rounded-sm"></div>
                                                <div className="w-1 h-full bg-green-500 rounded-sm"></div>
                                                <div className="w-1 h-4/5 bg-green-400 rounded-sm"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-center text-slate-400">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                System status: Operational
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}
