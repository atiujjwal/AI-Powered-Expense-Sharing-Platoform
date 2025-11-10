import Link from "next/link";
import { Wallet, TrendingUp, Bell, PieChart } from "lucide-react";
import Button from "../src/components/ui/Button";

export default function HomePage() {
  const features = [
    {
      icon: <Wallet className="w-8 h-8" />,
      title: "Track Every Rupee",
      description: "Log expenses with AI-powered categorization.",
    },
    {
      icon: <PieChart className="w-8 h-8" />,
      title: "Visual Analytics",
      description: "Charts that clarify spending patterns.",
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Smart Reminders",
      description: "Get nudges before bills and budgets hit.",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Savings Goals",
      description: "Monitor progress towards goals.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-mono-50 to-white">
      <header className="border-b border-mono-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-mono-900" />
            <span className="text-xl font-semibold text-mono-900">
              PayAId
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm text-mono-600 hover:text-mono-900"
            >
              Features
            </Link>
            <Link
              href="/auth/login"
              className="text-sm text-mono-600 hover:text-mono-900"
            >
              Login
            </Link>
            <Link href="/auth/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-mono-900 mb-6 text-balance">
          Pay your share smAIrtly.
        </h1>
        <p className="text-xl text-mono-600 mb-8 text-balance">
          Create groups, scan receipts, auto-categorize, and settle debts
          seamlessly with rich analytics.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mx-auto">
          <Link href="/auth/register" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-[180px] bg-mono-900 hover:bg-mono-800">
              Start Free
            </Button>
          </Link>
          <Link href="#features" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-[180px]">
              Learn More
            </Button>
          </Link>
        </div>
        <p className="text-sm text-mono-500 mt-4">
          No credit card required. 14-day free trial.
        </p>
      </section>

      <section
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-mono-900 mb-4 text-center">
          Everything you need
        </h2>
        <p className="text-lg text-mono-600 max-w-2xl mx-auto text-center mb-12">
          From trips to roommates to events—manage it all with delightful UI and
          powerful automation.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white border border-mono-200 rounded-xl p-6 hover:shadow-card transition-all"
            >
              <div className="w-14 h-14 bg-mono-100 rounded-lg flex items-center justify-center mb-4 text-mono-700">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-mono-900 mb-1">
                {f.title}
              </h3>
              <p className="text-sm text-mono-600">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-mono-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-sm text-mono-600 text-center">
          © 2025 PayAId. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
