import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Package, Truck, Globe, Clock } from "lucide-react";

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Shipping Information
        </h1>
        <p className="text-gray-500 mb-8">
          Everything you need to know about how your custom game gets to you.
        </p>

        <div className="space-y-6">
          {/* Production */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                <Package className="h-5 w-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">
                Production
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Each game is custom-printed on demand by The Game Crafter, an
              industry-leading game manufacturer. Production typically takes 5-7
              business days after your order is confirmed.
            </p>
            <p className="text-sm text-gray-600">
              During production, your custom artwork is printed on
              professional-grade materials, cards are cut and finished, and
              everything is assembled and quality-checked before shipping.
            </p>
          </div>

          {/* Shipping Options */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                <Truck className="h-5 w-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">
                Shipping Options
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Standard Shipping
                  </p>
                  <p className="text-xs text-gray-500">5-10 business days</p>
                </div>
                <span className="text-sm font-semibold text-emerald-600">
                  Free
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Priority Shipping
                  </p>
                  <p className="text-xs text-gray-500">3-5 business days</p>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Included with Premium
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Express Shipping
                  </p>
                  <p className="text-xs text-gray-500">1-3 business days</p>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Included with Deluxe
                </span>
              </div>
            </div>
          </div>

          {/* Coverage */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                <Globe className="h-5 w-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">
                Shipping Coverage
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              We currently ship to all 50 US states. International shipping is
              coming soon — join our mailing list to be notified when it
              launches.
            </p>
            <p className="text-sm text-gray-600">
              For bulk orders (25+ copies), we can arrange special shipping
              accommodations. Contact us at support@boardcraft.com for details.
            </p>
          </div>

          {/* Tracking */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                <Clock className="h-5 w-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg">
                Order Tracking
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Once your game ships, you&apos;ll receive a tracking number via
              email. You can also check your order status anytime from your
              dashboard.
            </p>
            <p className="text-sm text-gray-600">
              If your package hasn&apos;t arrived within the expected timeframe,
              please contact us and we&apos;ll investigate right away.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
