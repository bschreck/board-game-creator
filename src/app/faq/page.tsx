import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function FAQPage() {
  const faqs = [
    {
      q: "How does BoardCraft work?",
      a: "Choose a base game, pick a theme, customize the rules, upload your photos, and we use AI to generate unique artwork and a complete rules booklet. Then we print and ship a professional-quality game to your door.",
    },
    {
      q: "What base games can I customize?",
      a: "We offer 37+ base games across card games (Dominion, Codenames, Exploding Kittens, UNO, and more) and board games (Risk, Monopoly, Clue, Scrabble, and more). Each can be fully re-themed and customized with new rules.",
    },
    {
      q: "How long does it take to receive my game?",
      a: "After you complete your order, production takes 5-7 business days. Standard shipping is 5-10 business days, priority is 3-5 days, and express is 1-3 days depending on your package tier.",
    },
    {
      q: "Can I preview my game before ordering?",
      a: "Yes! Our AI generates a full preview including board art, card designs, box cover art, and a complete rules booklet. You can regenerate any element until you're satisfied before placing your order.",
    },
    {
      q: "What's included in each pricing tier?",
      a: "Basic includes standard components and free shipping. Premium adds premium materials, more photos, and custom box art. Deluxe (board games only) includes wooden pieces, metal tokens, embossed box, and express shipping.",
    },
    {
      q: "Do you offer bulk discounts?",
      a: "Yes! Order 5+ copies for 10% off, 10+ for 15% off, 25+ for 20% off, or 50+ for 25% off. Bulk pricing is perfect for events, parties, team-building, or corporate gifts.",
    },
    {
      q: "Can I send copies to multiple addresses?",
      a: "Absolutely. Use our Gift Mode at checkout to add multiple shipping addresses with different quantities for each. All copies count toward your bulk discount.",
    },
    {
      q: "What quality are the game components?",
      a: "We print through The Game Crafter, an industry-leading print-on-demand service. Components include professional poker-quality cards, sturdy game boards, and durable packaging — the same quality you'd find in retail stores.",
    },
    {
      q: "Can I edit my game after ordering?",
      a: "Once an order is placed and enters production, changes cannot be made. However, you can create a new version of your game at any time from your dashboard.",
    },
    {
      q: "What if I'm not happy with my game?",
      a: "If there's a manufacturing defect, we'll replace it at no charge. Since each game is custom-made to your specifications, we can't offer refunds for design choices, but our preview system lets you see exactly what you'll get.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-500 mb-8">
          Everything you need to know about creating your custom board game.
        </p>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
