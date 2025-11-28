import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";
import { Instagram, Youtube, TrendingUp, Sparkles, CheckCircle, HelpCircle, ArrowRight } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-pink-600/30 bg-black/70 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-600 to-yellow-400 rounded-lg flex items-center justify-center">
            <img src={logo} alt="SocialPulse Logo" className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-yellow-400">
            SocialPulse
          </h1>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-gray-300">
          <a href="#features" className="hover:text-pink-400 transition">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-pink-400 transition">
            How It Works
          </a>
          <a href="#testimonials" className="hover:text-pink-400 transition">
            Testimonials
          </a>
          <a href="#faq" className="hover:text-pink-400 transition">
            FAQ
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
      <section className="flex flex-col md:flex-row items-center justify-between px-10 py-20 max-w-[1920px] mx-auto">
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
      <section id="features" className="py-20 bg-[#0a0a0a]">
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

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-[#111]">
        <div className="max-w-6xl mx-auto px-10">
          <h3 className="text-center text-3xl font-bold mb-16 text-white">
            How <span className="text-pink-500">SocialPulse</span> Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Connect Your Accounts", desc: "Securely link your YouTube and Instagram profiles in seconds." },
              { step: "02", title: "Get AI Analysis", desc: "Our AI scans your performance and identifies growth opportunities." },
              { step: "03", title: "Grow Your Audience", desc: "Apply recommendations and watch your engagement soar." }
            ].map((item, i) => (
              <div key={i} className="relative p-8 bg-[#1a1a1a] rounded-2xl border border-gray-800 hover:border-pink-500/50 transition duration-300">
                <div className="absolute -top-6 left-8 text-6xl font-black text-gray-800/50 select-none">{item.step}</div>
                <h4 className="text-xl font-bold text-white mb-3 relative z-10">{item.title}</h4>
                <p className="text-gray-400 relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
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
        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          Get personalized recommendations on what to post, when to post, and
          which hashtags to use — all powered by cutting-edge AI.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-full border border-gray-800 text-sm text-gray-300">
            <CheckCircle className="w-4 h-4 text-green-500" /> Content Ideas
          </div>
          <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-full border border-gray-800 text-sm text-gray-300">
            <CheckCircle className="w-4 h-4 text-green-500" /> Best Time to Post
          </div>
          <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-full border border-gray-800 text-sm text-gray-300">
            <CheckCircle className="w-4 h-4 text-green-500" /> Hashtag Optimization
          </div>
        </div>
      </section>

      {/* Testimonials Section Removed - Coming Soon */}

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-[#111]">
        <div className="max-w-4xl mx-auto px-10">
          <h3 className="text-center text-3xl font-bold mb-12 text-white">
            Frequently Asked <span className="text-pink-500">Questions</span>
          </h3>
          <div className="space-y-4">
            {[
              { q: "Is SocialPulse free to use?", a: "We offer a free tier with basic analytics. Pro features with advanced AI insights are available on our premium plan." },
              { q: "Can I connect multiple accounts?", a: "Yes! You can connect multiple YouTube channels and Instagram profiles to a single dashboard." },
              { q: "How does the AI recommendation work?", a: "Our AI analyzes your past performance and current trends to suggest content topics and optimization strategies tailored to you." },
              { q: "Is my data safe?", a: "Absolutely. We use official APIs and bank-grade encryption to ensure your data remains secure and private." }
            ].map((faq, i) => (
              <div key={i} className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800">
                <h4 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-pink-500" /> {faq.q}
                </h4>
                <p className="text-gray-400 pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-pink-900/20 to-yellow-900/20 text-center border-t border-pink-500/20">
        <h3 className="text-4xl font-bold mb-6 text-white">
          Ready to Elevate Your Social Game?
        </h3>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">Join thousands of creators who are growing faster with SocialPulse.</p>
        <Link
          to="/signup"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-600 to-yellow-400 text-black px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition hover:scale-105 transform duration-200"
        >
          Join SocialPulse Now <ArrowRight className="w-5 h-5" />
        </Link>
      </section>
    </div >
  );
};

// export default LandingPage;
