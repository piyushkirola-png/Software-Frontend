import { useParams, Link } from "react-router-dom";
import { CheckCircle, Mail, FileText, Key, Loader2 } from "lucide-react";
import Button from "../../components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "../../api/services/orderService";

export default function OrderSuccess() {
  const { orderNumber = "" } = useParams<{ orderNumber: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-success", orderNumber],
    queryFn: () => orderService.getByNumber(orderNumber),
    enabled: !!orderNumber,
  });

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-soft min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="w-20 h-20 mx-auto bg-success/10 rounded-full flex items-center justify-center mb-4">
            <CheckCircle size={40} className="text-success" />
          </div>

          <h1 className="text-2xl font-extrabold text-navy mb-2">
            Thank you for your order!
          </h1>
          <p className="text-sm text-muted mb-6">
            Your order <b className="text-navy">{orderNumber}</b> has been
            confirmed.
          </p>

          {/* Info cards */}
          <div className="grid grid-cols-3 gap-3 my-8">
            <div className="text-center">
              <Mail className="w-6 h-6 text-brand mx-auto mb-2" />
              <div className="text-xs font-semibold text-navy">
                Email Sent
              </div>
              <div className="text-[11px] text-muted mt-1">
                License key + invoice
              </div>
            </div>
            <div className="text-center">
              <Key className="w-6 h-6 text-brand mx-auto mb-2" />
              <div className="text-xs font-semibold text-navy">
                Key Delivered
              </div>
              <div className="text-[11px] text-muted mt-1">
                Ready to activate
              </div>
            </div>
            <div className="text-center">
              <FileText className="w-6 h-6 text-brand mx-auto mb-2" />
              <div className="text-xs font-semibold text-navy">
                GST Invoice
              </div>
              <div className="text-[11px] text-muted mt-1">
                Download anytime
              </div>
            </div>
          </div>

          {order && (
            <div className="bg-soft rounded-lg p-4 mb-6 text-left">
              <div className="text-xs text-muted mb-1">Total Paid</div>
              <div className="text-2xl font-extrabold text-navy">
                ₹{order.total.toFixed(2)}
              </div>
              <div className="text-xs text-muted mt-2">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/my-account/orders">
              <Button fullWidth>View My Orders</Button>
            </Link>
            <Link to="/">
              <Button fullWidth variant="outline">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}