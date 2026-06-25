import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await base44.auth.register({ email: form.email, password: form.password });
      setStep('otp');
      toast({ title: 'Check your email', description: 'We sent you a verification code' });
    } catch (err) {
      setError(err.message || 'Registration failed');
      toast({ title: 'Registration failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await base44.auth.verifyOtp({ email: form.email, otpCode });
      await base44.auth.loginViaEmailPassword(form.email, form.password);
      if (form.full_name) {
        await base44.auth.updateMe({ full_name: form.full_name });
      }
      navigate('/onboarding');
    } catch (err) {
      setError(err.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await base44.auth.resendOtp(form.email);
      toast({ title: 'Code resent', description: 'Check your email for the new code' });
    } catch (err) {
      toast({ title: 'Failed to resend code', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === 'form' ? 'Create your account' : 'Verify your email'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === 'form' ? 'Start growing your pipeline with VelocityAI CRM' : `We sent a code to ${form.email}`}
          </p>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleRegister} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
            <div>
              <Label className="text-xs">Full Name</Label>
              <Input required value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Jane Doe" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@company.com" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Password</Label>
              <Input type="password" required minLength={8} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" className="mt-1" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
            <div>
              <Label className="text-xs">Verification Code</Label>
              <Input required value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="123456" className="mt-1 text-center text-lg tracking-widest" maxLength={6} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </Button>
            <button type="button" onClick={handleResend} className="w-full text-xs text-indigo-600 hover:underline">
              Didn't get a code? Resend
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
