// src/hooks/useBilling.js
import { useState } from 'react';
import api from '../utils/api'; // your existing axios instance with JWT headers

export function useBilling() {
  const [bLoading, setBLoading] = useState(false);
  const [bError, setBError]     = useState(null);

  const subscribe = async (plan) => {
    setBLoading(true);
    setBError(null);
    try {
      const { data } = await api.post('/billing/checkout/', { plan });
      window.location.href = data.checkout_url; // redirect to Stripe
    } catch (err) {
      setBError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setBLoading(false);
    }
  };

  const openBillingPortal = async () => {
    setBLoading(true);
    try {
      const { data } = await api.post('/billing/portal/');
      window.location.href = data.portal_url;
    } catch (err) {
      setBError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setBLoading(false);
    }
  };

  const fetchStatus = async () => {
    const { data } = await api.get('/billing/status/');
    return data; // { plan, status, current_period_end, credits_remaining }
  };

  return { subscribe, openBillingPortal, fetchStatus, bLoading, bError };
}
