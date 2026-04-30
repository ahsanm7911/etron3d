// src/hooks/useBilling.js
import { useState } from 'react';
import api from '../api/axios'; // your existing axios instance with JWT headers

export function useBilling() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const subscribe = async (plan) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/api/billing/checkout/', { plan });
      window.location.href = data.checkout_url; // redirect to Stripe
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const openBillingPortal = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/api/billing/portal/');
      window.location.href = data.portal_url;
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    const { data } = await api.get('/api/billing/status/');
    return data; // { plan, status, current_period_end, credits_remaining }
  };

  return { subscribe, openBillingPortal, fetchStatus, loading, error };
}
