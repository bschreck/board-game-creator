import Link from "next/link";
import { Dice5 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600">
                <Dice5 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent">
                BoardCraft
              </span>
            </Link>
            <p className="text-sm text-gray-500 max-w-md">
              Create personalized board games with AI. Upload your photos, choose a theme,
              customize the rules, and we&apos;ll print and ship a professional-quality game to your door.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link href="/create" className="text-sm text-gray-500 hover:text-violet-600 transition-colors">Create a Game</Link></li>
              <li><Link href="/#pricing" className="text-sm text-gray-500 hover:text-violet-600 transition-colors">Pricing</Link></li>
              <li><Link href="/#how-it-works" className="text-sm text-gray-500 hover:text-violet-600 transition-colors">How It Works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/faq" className="text-sm text-gray-500 hover:text-violet-600 transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-500 hover:text-violet-600 transition-colors">Contact</Link></li>
              <li><Link href="/shipping" className="text-sm text-gray-500 hover:text-violet-600 transition-colors">Shipping Info</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} BoardCraft. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Privacy</Link>
            <Link href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
