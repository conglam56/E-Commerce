import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

export default function EmailVerification() {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    axiosClient.get('/auth/email-status').then(res => setStatus(res.data)).catch(err => setMessage(err.message));
  }, []);
  async function resend() {
    setBusy(true);
    try {
      await axiosClient.post('/auth/resend-verification');
      setMessage('Hãy kiểm tra hộp thư. Bạn có thể yêu cầu gửi lại sau một phút.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }
  return <div className="space-y-2 border-t pt-3 text-sm">
    {status && <p>{status.verified ? 'Email đã xác minh' : 'Email chưa xác minh'}</p>}
    {status && !status.verified && (status.mailAvailable
      ? <button type="button" className="shop-button underline" disabled={busy} onClick={resend}>Gửi lại thư xác minh</button>
      : <p>Chức năng gửi thư hiện chưa khả dụng.</p>)}
    {message && <p role="status">{message}</p>}
  </div>;
}
