// import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";
import { Instagram, Youtube, TrendingUp, Sparkles } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-pink-600/30 bg-black/70 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src={logo} alt="SocialPulse Logo" className="h-10 w-10" />
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-yellow-400">
            SocialPulse
          </h1>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-gray-300">
          <a href="#features" className="hover:text-pink-400 transition">
            Features
          </a>
          <a href="#insights" className="hover:text-pink-400 transition">
            AI Insights
          </a>
          <a href="#connect" className="hover:text-pink-400 transition">
            Connect
          </a>
          <Link
            to="/login"
            className="bg-gradient-to-r from-pink-600 to-yellow-400 text-black px-5 py-2 rounded-xl font-semibold hover:opacity-90 transition"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-10 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-xl"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Your Social Media,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-yellow-400">
              Smarter than Ever.
            </span>
          </h2>
          <p className="mt-6 text-gray-400 text-lg">
            Track analytics, gain AI-powered insights, and discover trending
            hashtags — all in one sleek dashboard for Instagram & YouTube.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              to="/signup"
              className="bg-gradient-to-r from-pink-600 to-yellow-400 text-black px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="border border-pink-600 px-6 py-3 rounded-xl text-pink-400 hover:bg-pink-600/20 transition"
            >
              Learn More
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-10 md:mt-0"
        >
          <img
            src={logo}
            alt="SocialPulse"
            className="w-80 mx-auto drop-shadow-[0_0_25px_#ec4899]"
          />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-[#111]">
        <h3 className="text-center text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-yellow-400">
          Powerful Features
        </h3>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10 px-10 max-w-6xl mx-auto">
          {[
            {
              icon: <Instagram className="h-10 w-10 text-pink-500" />,
              title: "Instagram Insights",
              desc: "Track likes, comments, followers, and engagement in real-time.",
            },
            {
              icon: <Youtube className="h-10 w-10 text-yellow-400" />,
              title: "YouTube Analytics",
              desc: "Monitor views, watch time, and audience performance easily.",
            },
            {
              icon: <TrendingUp className="h-10 w-10 text-pink-500" />,
              title: "Trending Hashtags",
              desc: "Discover what’s trending and boost your visibility instantly.",
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-[#1a1a1a] border border-pink-600/20 rounded-2xl p-6 text-center shadow-lg hover:border-pink-600/40 transition"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h4 className="text-xl font-semibold mb-2 text-yellow-300">
                {feature.title}
              </h4>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Insights Section */}
      <section
        id="insights"
        className="py-20 px-10 text-center bg-gradient-to-b from-[#0a0a0a] to-[#111]"
      >
        <Sparkles className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-3xl font-bold mb-4">
          Unlock <span className="text-pink-500">AI-Powered</span> Insights
        </h3>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Get personalized recommendations on what to post, when to post, and
          which hashtags to use — all powered by cutting-edge AI.
        </p>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#111] text-center">
        <h3 className="text-3xl font-bold mb-6">
          Ready to Elevate Your Social Game?
        </h3>
        <Link
          to="/signup"
          className="bg-gradient-to-r from-pink-600 to-yellow-400 text-black px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition"
        >
          Join SocialPulse
        </Link>
      </section>
    </div>
  );
};

// export default LandingPage;
