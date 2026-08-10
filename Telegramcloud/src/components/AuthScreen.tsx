import { useState } from 'react';
import { Cloud, Phone, Key, Shield } from 'lucide-react';
import { initClient, sendCode, signIn, checkPassword } from '../lib/telegram';
import { storeApiCredentials } from '../lib/storage';

export default function AuthScreen({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<'credentials' | 'phone' | 'code' | 'password'>('credentials');
  const [apiId, setApiId] = useState(''); const [apiHash, setApiHash] = useState('');
  const [phone, setPhone] = useState(''); const [code, setCode] = useState('');
  const [password, setPassword] = useState(''); const [hash, setHash] = useState('');
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);

  const run = async (fn: () => Promise<void>) => { setError(''); setLoading(true); try { await fn(); } catch (e: any) { setError(e.message || 'خطا'); } finally { setLoading(false); } };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"><Cloud className="w-10 h-10 text-white" /></div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Telegram Drive</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">فضای ابری شخصی • نسخه پرمیوم</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {step === 'credentials' && (
            <form onSubmit={(e) => { e.preventDefault(); run(async () => { const id = parseInt(apiId); if (isNaN(id)) throw new Error('API ID نامعتبر'); await initClient({ apiId: id, apiHash }); storeApiCredentials(id, apiHash); setStep('phone'); }); }}>
              <h2 className="text-xl font-bold mb-2">API Credentials</h2>
              <p className="text-sm text-gray-500 mb-6">از <a href="https://my.telegram.org" target="_blank" rel="noreferrer" className="text-blue-500">my.telegram.org</a> دریافت کنید</p>
              <input className="input mb-3" placeholder="API ID" value={apiId} onChange={(e) => setApiId(e.target.value)} required />
              <input className="input" placeholder="API Hash" value={apiHash} onChange={(e) => setApiHash(e.target.value)} required />
              <button disabled={loading} className="w-full mt-6 btn btn-primary disabled:opacity-50">{loading ? '...' : 'ادامه'}</button>
            </form>
          )}
          {step === 'phone' && (
            <form onSubmit={(e) => { e.preventDefault(); run(async () => { const r = await sendCode(phone); setHash(r.phoneCodeHash); setStep('code'); }); }}>
              <h2 className="text-xl font-bold mb-6">شماره تلفن</h2>
              <div className="relative"><Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="tel" dir="ltr" className="input pr-12" placeholder="+989123456789" value={phone} onChange={(e) => setPhone(e.target.value)} required /></div>
              <button disabled={loading} className="w-full mt-6 btn btn-primary disabled:opacity-50">{loading ? '...' : 'ارسال کد'}</button>
            </form>
          )}
          {step === 'code' && (
            <form onSubmit={(e) => { e.preventDefault(); run(async () => { await signIn(phone, code, hash); onSuccess(); }); }}>
              <h2 className="text-xl font-bold mb-2">کد تأیید</h2>
              <p className="text-sm text-gray-500 mb-6">کد ارسال شده به {phone}</p>
              <div className="relative"><Key className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input className="input pr-12 text-center text-2xl tracking-widest" maxLength={5} value={code} onChange={(e) => setCode(e.target.value)} required autoFocus /></div>
              <button disabled={loading} className="w-full mt-6 btn btn-primary disabled:opacity-50">{loading ? '...' : 'تأیید و ورود'}</button>
              <button type="button" onClick={() => setStep('phone')} className="w-full mt-3 text-sm text-gray-500">تغییر شماره</button>
            </form>
          )}
          {step === 'password' && (
            <form onSubmit={(e) => { e.preventDefault(); run(async () => { await checkPassword(password); onSuccess(); }); }}>
              <h2 className="text-xl font-bold mb-2">رمز دومرحله‌ای</h2>
              <div className="relative"><Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="password" className="input pr-12" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus /></div>
              <button disabled={loading} className="w-full mt-6 btn btn-primary disabled:opacity-50">{loading ? '...' : 'ورود'}</button>
            </form>
          )}
          {error && <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg">{error}</div>}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">Telegram Drive v4 Premium • PWA</p>
      </div>
    </div>
  );
}