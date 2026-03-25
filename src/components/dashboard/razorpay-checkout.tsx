'use client';

import * as React from 'react';
import { Button } from '@/components/ui';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';

interface RazorpayCheckoutProps {
  dealId: string;
  amount: number;
  dealTitle: string;
  brandName: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayCheckout({
  dealId,
  amount,
  dealTitle,
  brandName,
  onSuccess,
  onError,
  disabled,
}: RazorpayCheckoutProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showDemoModal, setShowDemoModal] = React.useState(false);
  const [demoProcessing, setDemoProcessing] = React.useState(false);

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const loadRazorpay = () => {
    return new Promise<void>((resolve) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      document.body.appendChild(script);
    });
  };

  const handleDemoPayment = async () => {
    setDemoProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const demoPaymentId = `demo_${Date.now()}`;
    setDemoProcessing(false);
    setShowDemoModal(false);
    onSuccess(demoPaymentId);
  };

  const handlePayment = async () => {
    if (isDemoMode) {
      setShowDemoModal(true);
      return;
    }

    setIsLoading(true);

    try {
      await loadRazorpay();

      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId,
          amount,
          dealTitle,
          brandName,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: 'INR',
        name: 'RYI - ReachYourInfluencer',
        description: `Payment for: ${dealTitle}`,
        order_id: orderData.orderId,
        prefill: {
          name: brandName,
        },
        notes: {
          dealId,
        },
        theme: {
          color: '#18181b',
        },
        handler: async (response: any) => {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              dealId,
              amount,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            onSuccess(response.razorpay_payment_id);
          } else {
            onError('Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        onError(response.error.description || 'Payment failed');
        setIsLoading(false);
      });

      rzp.open();
    } catch (error: any) {
      onError(error.message || 'Payment initialization failed');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        className="w-full bg-green-600 hover:bg-green-700"
        onClick={handlePayment}
        disabled={disabled || isLoading}
        isLoading={isLoading}
      >
        <CreditCard className="h-4 w-4 mr-2" />
        {isDemoMode ? 'Demo: ' : ''}Pay {amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
        <Lock className="h-3 w-3 ml-2 opacity-70" />
      </Button>

      {isDemoMode && (
        <p className="text-xs text-zinc-500 text-center mt-1">
          Demo Mode - No real payment
        </p>
      )}

      {showDemoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 p-6 rounded-xl max-w-sm w-full mx-4 border border-zinc-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Demo Payment</h3>
              <p className="text-zinc-400 mb-4">
                This is a simulated payment for testing.
                <br />
                Amount: ₹{amount.toLocaleString('en-IN')}
              </p>
              <div className="bg-zinc-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-zinc-400">Payment Method</p>
                <p className="text-white font-medium">Demo Card (Simulated)</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDemoModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleDemoPayment}
                  isLoading={demoProcessing}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
