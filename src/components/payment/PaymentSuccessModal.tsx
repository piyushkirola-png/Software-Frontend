import Modal from "../ui/Modal";
import Button from "../ui/Button";
import { CheckCircle } from "lucide-react";

interface Props {
  open: boolean;
  orderNumber?: string;
  onClose: () => void;
  onViewOrder?: () => void;
}

export default function PaymentSuccessModal({
  open,
  orderNumber,
  onClose,
  onViewOrder,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title="">
      <div className="text-center py-4">
        <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-success" />
        </div>
        <h2 className="text-xl font-extrabold text-navy mb-2">
          Payment Successful!
        </h2>
        {orderNumber && (
          <p className="text-sm text-muted mb-1">
            Order <b className="text-navy">{orderNumber}</b>
          </p>
        )}
        <p className="text-sm text-muted mb-6">
          License key + invoice sent to your email.
        </p>

        <div className="flex flex-col gap-2">
          {onViewOrder && (
            <Button fullWidth onClick={onViewOrder}>
              View Order
            </Button>
          )}
          <Button fullWidth variant="outline" onClick={onClose}>
            Continue Shopping
          </Button>
        </div>
      </div>
    </Modal>
  );
}
