import React from "react";
import { Link } from "react-router-dom";

export default function StoreDiscoverLink({ className = "" }) {
    return (
        <div className={`text-sm text-slate-500 ${className}`}>
            Don’t know the store slug? <Link to="/stores" className="text-blue-600 underline">Browse stores</Link>
        </div>
    );
}
