import { useState } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { authService } from "../../api/services/authService";
import { getErrorMessage } from "../../lib/api-client";

interface Props {
  open: boolean;
  onClose: () => void;
  initialEmail?: string;
}

type Step = "email" | "otp" | "reset";

export default function ForgotPasswordDialog({ open, onClose, initialEmail = "" }: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setStep("email");
    setCode("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const sendOtp = async () => {
    setError("");
    if (!email.trim()) return setError("Email is required");
    setLoading(true);
    try {
      await authService.sendOtp({ email });
      setStep("otp");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    if (!code.trim()) return setError("Code is required");
    setLoading(true);
    try {
      await authService.verifyOtp({ email, code });
      setStep("reset");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setError("");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    try {
      await authService.resetPassword({ email, code, newPassword: password });
      handleClose();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Reset Password">
      {step === "email" && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Enter your email. We'll send you a 6-digit OTP.
          </p>
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button fullWidth loading={loading} onClick={sendOtp}>
            Send OTP
          </Button>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Enter the OTP sent to <b>{email}</b>.
          </p>
          <Input
            label="OTP Code"
            placeholder="123456"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button fullWidth loading={loading} onClick={verifyOtp}>
            Verify OTP
          </Button>
          <button
            onClick={() => setStep("email")}
            className="text-xs text-brand hover:underline w-full text-center"
          >
            Change email
          </button>
        </div>
      )}

      {step === "reset" && (
        <div className="space-y-4">
          <p className="text-sm text-muted">Choose a new password.</p>
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <Button fullWidth loading={loading} onClick={resetPassword}>
            Reset Password
          </Button>
        </div>
      )}
    </Modal>
  );
}