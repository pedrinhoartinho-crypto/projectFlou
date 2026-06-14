'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle, XCircle, ArrowLeft, Mail } from 'lucide-react';

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  const codeParam = searchParams.get('code');

  const initialCode =
    codeParam && codeParam.length === 6
      ? codeParam.split('')
      : ['', '', '', '', '', ''];

  const [email, setEmail] = useState(emailParam || '');
  const [code, setCode] = useState(initialCode);
  const [devCode, setDevCode] = useState(codeParam && codeParam.length === 6 ? codeParam : '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  function handleCodeChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Digite o codigo completo de 6 digitos');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setVerified(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch {
      setError('Erro ao verificar codigo');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', email, password: '' }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao reenviar');
      } else if (data.code) {
        setDevCode(data.code);
        setCode(data.code.split(''));
      }
      inputRefs.current[0]?.focus();
    } catch {
      setError('Erro ao reenviar');
    } finally {
      setResending(false);
    }
  }

  if (verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="w-full max-w-md p-8 text-center space-y-4 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold text-green-600">Email verificado!</h1>
          <p className="text-gray-500">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Confirme seu email</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Enviamos um codigo de 6 digitos para <strong>{email || 'seu email'}</strong>
          </p>
        </div>

        {devCode && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded-lg text-sm text-center">
            Modo DEV - codigo: <strong className="font-mono text-lg tracking-widest">{devCode}</strong>
            <br />
            <span className="text-xs">(configure RESEND_API_KEY no .env para enviar emails de verdade)</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || code.join('').length !== 6}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Verificando...' : 'Verificar codigo'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
          >
            {resending ? 'Reenviando...' : 'Reenviar codigo'}
          </button>
        </div>

        <Link href="/register" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao cadastro
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <span className="text-gray-500">Carregando...</span>
        </div>
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}
