import { useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { authService } from "../../api/services/authService";
import { getErrorMessage } from "../../lib/api-client";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function OtpLoginDialog({ open, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    setError("");
    if (!email.trim()) return setError("Email required");
    setLoading(true);
    try {
      await authService.sendOtp({ email, purpose: "LOGIN" });
      setStep("otp");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setError("");
    if (!code.trim()) return setError("Code required");
    setLoading(true);
    try {
      await authService.verifyOtp({ email, code });
      onClose();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Login with OTP">
      {step === "email" ? (
        <div className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button fullWidth loading={loading} onClick={send}>
            Send OTP
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            label="OTP Code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            maxLength={6}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button fullWidth loading={loading} onClick={verify}>
            Verify & Login
          </Button>
        </div>
      )}
    </Modal>
  );
}
