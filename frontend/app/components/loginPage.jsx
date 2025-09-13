'use client'; // For Next.js App Router

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        email,
        password,
      });
      const data = response.data;
      console.log('Login successful:', data);
      localStorage.setItem('token', data.token);
      alert('Login successful!');
      router.push('/devices');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'An unexpected error occurred';
      console.error('Login error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const animationClasses = (delay) =>
    `transition-all duration-700 ease-out ${
      isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
    } ${delay}`;

  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-gray-200">
        <div className="text-center">
          <h1
            className={`text-4xl font-bold text-gray-800 tracking-tight ${animationClasses(
              'delay-200'
            )}`}
          >
            Welcome Back
          </h1>
          <p className={`text-gray-600 mt-2 ${animationClasses('delay-[300ms]')}`}>
            Sign in to access your IoT Dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className={`${animationClasses('delay-[400ms]')}`}>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                placeholder="Email Address"
              />
              <label
                htmlFor="email"
                className="absolute left-3 -top-2 text-xs text-gray-500 bg-white px-1 rounded-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1"
              >
                Email Address
              </label>
            </div>
          </div>

          {/* Password Input */}
          <div className={`${animationClasses('delay-[500ms]')}`}>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="peer w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
                placeholder="Password"
              />
              <label
                htmlFor="password"
                className="absolute left-3 -top-2 text-xs text-gray-500 bg-white px-1 rounded-sm transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:text-blue-600 peer-focus:bg-white peer-focus:px-1"
              >
                Password
              </label>
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div
              className={`text-center p-2 bg-red-100 text-red-700 rounded-lg ${animationClasses(
                'delay-[600ms]'
              )}`}
            >
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className={`${animationClasses('delay-[700ms]')}`}>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-500 shadow-lg hover:shadow-blue-500/50 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}