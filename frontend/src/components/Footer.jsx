import React from "react";
import { Link } from "react-router-dom";


export default function Footer() {
    return (
        <footer className="mt-32 py-12 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-t border-gray-300/30 dark:border-gray-700/30">
            <div className="max-w-6xl mx-auto grid sm:grid-cols-4 gap-8 px-6 text-left">
                <div>
                    <h3 className="font-bold mb-3 text-lg">Product</h3>
                    <ul className="space-y-2 text-sm">
                        <li><a href="#features">Features</a></li>
                        <li><a href="#solutions">Solutions</a></li>
                    </ul>
                </div>


                <div>
                    <h3 className="font-bold mb-3 text-lg">Company</h3>
                    <ul className="space-y-2 text-sm">
                        <li>About</li>
                        <li>Careers</li>
                        <li>Press</li>
                    </ul>
                </div>


                <div>
                    <h3 className="font-bold mb-3 text-lg">Community</h3>
                    <ul className="space-y-2 text-sm">
                        <li>Forums</li>
                        <li>Discord</li>
                        <li>Events</li>
                    </ul>
                </div>


                <div>
                    <h3 className="font-bold mb-3 text-lg">Resources</h3>
                    <ul className="space-y-2 text-sm">
                        <li>Documentation</li>
                        <li>API Reference</li>
                        <li>Support</li>
                    </ul>
                </div>
            </div>


            <p className="text-center mt-10 text-sm opacity-60">© 2025 3DGen. All rights reserved.</p>
        </footer>
    );
}