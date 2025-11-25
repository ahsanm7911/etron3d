import React, { useState } from "react";
import { motion } from 'framer-motion';

export default function Pricing() {

    const [billing, setBilling] = useState("monthly");


    const prices = {
        monthly: {
            free: 0,
            pro: 9,
            studio: 29,
            enterprise: 99,
        },
        yearly: {
            free: 0,
            pro: 90,
            studio: 290,
            enterprise: 990,
        },
    };


    return (
        <div className="min-h-screen pt-24 pb-32 text-center px-6">
            <h1 className="text-5xl font-extrabold mb-6">Pricing</h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
                Choose a plan that fits your needs. Save more by switching to yearly billing.
            </p>


            {/* Billing Toggle */}
            <div className="mt-10 flex justify-center items-center gap-4">
                <span className={billing === "monthly" ? "font-bold" : "opacity-60"}>Monthly</span>
                <button
                    onClick={() => setBilling(billing === "monthly" ? "yearly" : "monthly")}
                    className="relative inline-flex h-7 w-14 items-center rounded-full bg-gray-300 dark:bg-gray-700"
                >
                    <motion.span
                        className="h-6 w-6 rounded-full bg-white shadow"
                        animate={{ x: billing === "yearly" ? 32 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                </button>
                <span className={billing === "yearly" ? "font-bold" : "opacity-60"}>Yearly</span>
            </div>


            {/* Pricing Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mt-20">
                {/* Free */}
                <motion.div whileHover={{ scale: 1.03 }} className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-2xl font-bold mb-3">Free</h3>
                    <p className="text-4xl font-extrabold mb-6">${prices[billing].free}</p>
                    <button className="my-6 w-full py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">Get Started</button>
                    <ul className="text-sm text-left space-y-3">
                        <li>✔ 10 Credits / month</li>
                        <li>✔ Standard Queue Speed</li>
                        <li>✔ 5 Downloads / month</li>
                        <li>✔ Community Support</li>
                    </ul>
                </motion.div>


                {/* Pro */}
                <motion.div whileHover={{ scale: 1.03 }} className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-blue-500">
                    <h3 className="text-2xl font-bold mb-3">Pro</h3>
                    <p className="text-4xl font-extrabold mb-6">${prices[billing].pro}</p>
                    <button className="my-6 w-full py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition">Subscribe Now</button>
                    <ul className="text-sm text-left space-y-3">
                        <li>✔ 150 Credits / month</li>
                        <li>✔ Faster Queue Priority</li>
                        <li>✔ Unlimited Downloads</li>
                        <li>✔ Email Support</li>
                    </ul>
                </motion.div>


                {/* Studio */}
                <motion.div whileHover={{ scale: 1.03 }} className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-purple-500">
                    <h3 className="text-2xl font-bold mb-3">Studio</h3>
                    <p className="text-4xl font-extrabold mb-6">${prices[billing].studio}</p>
                    <button className="my-6 w-full py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition">Subscribe Now</button>
                    <ul className="text-sm text-left space-y-3">
                        <li>✔ 500 Credits / month</li>
                        <li>✔ High Priority Queue</li>
                        <li>✔ Unlimited Downloads</li>
                        <li>✔ Dedicated Support</li>
                    </ul>
                </motion.div>


                {/* Enterprise */}
                <motion.div whileHover={{ scale: 1.03 }} className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-yellow-500">
                    <h3 className="text-2xl font-bold mb-3">Enterprise</h3>
                    <p className="text-4xl font-extrabold mb-6">${prices[billing].enterprise}</p>
                    <button className="my-6 w-full py-2 rounded-lg bg-yellow-500 text-black hover:bg-yellow-600 transition">Contact Us</button>
                    <ul className="text-sm text-left space-y-3">
                        <li>✔ Unlimited Credits</li>
                        <li>✔ Instant Queue Priority</li>
                        <li>✔ Unlimited Downloads</li>
                        <li>✔ 24/7 Premium Support</li>
                    </ul>
                </motion.div>
            </div>
        </div>
    );
}