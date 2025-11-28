import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Delete, CheckCircle, XCircle, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PinLockScreen({ 
  employee, 
  organisation, 
  onUnlock, 
  onLogout 
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError("");
      
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError("");
  };

  const handleClear = () => {
    setPin("");
    setError("");
  };

  const verifyPin = async (enteredPin) => {
    // Simple PIN verification - compare with stored pin_hash
    // In production, you'd hash the entered PIN and compare
    if (employee?.pin_hash === enteredPin) {
      setSuccess(true);
      setTimeout(() => {
        onUnlock();
      }, 800);
    } else {
      setAttempts(prev => prev + 1);
      setError("Incorrect PIN. Please try again.");
      setPin("");
      
      if (attempts + 1 >= maxAttempts) {
        setError("Too many attempts. Please contact your administrator.");
      }
    }
  };

  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'delete'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden">
      {/* Background with Sierra Leone pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F1F3C] via-[#1a3a5c] to-[#0F1F3C]">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-[#1EB053] rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#0072C6] rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-[80px] opacity-20" />
        </div>

        {/* Pattern overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Flag stripe */}
          <div className="flex h-2 w-32 rounded-full overflow-hidden mx-auto mb-6 shadow-lg">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>

          {/* Logo */}
          {organisation?.logo_url ? (
            <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-2xl p-2 shadow-xl">
              <img 
                src={organisation.logo_url} 
                alt={organisation.name} 
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-xl border-4 border-white/20">
              <div className="h-1/3 bg-[#1EB053]" />
              <div className="h-1/3 bg-white" />
              <div className="h-1/3 bg-[#0072C6]" />
            </div>
          )}

          <h1 className="text-2xl font-bold text-white mb-1">
            {organisation?.name || 'Welcome'}
          </h1>
          <p className="text-white/60 text-sm">
            Enter your 4-digit PIN to continue
          </p>
        </div>

        {/* User info */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {employee?.first_name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-white font-medium">{employee?.full_name || 'User'}</p>
              <p className="text-white/50 text-sm capitalize">{employee?.role?.replace(/_/g, ' ') || 'Employee'}</p>
            </div>
          </div>
        </div>

        {/* PIN input display */}
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                success 
                  ? 'border-[#1EB053] bg-[#1EB053]/20' 
                  : error && pin.length === 0
                  ? 'border-red-400 bg-red-400/10'
                  : pin.length > i 
                  ? 'border-[#1EB053] bg-white/10' 
                  : 'border-white/20 bg-white/5'
              }`}
            >
              {pin.length > i ? (
                <div className={`w-4 h-4 rounded-full ${success ? 'bg-[#1EB053]' : 'bg-white'}`} />
              ) : null}
            </div>
          ))}
        </div>

        {/* Error/Success message */}
        {error && (
          <div className="flex items-center justify-center gap-2 text-red-400 text-sm mb-4">
            <XCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center justify-center gap-2 text-[#1EB053] text-sm mb-4">
            <CheckCircle className="w-4 h-4" />
            <span>Access Granted</span>
          </div>
        )}

        {/* PIN Keypad */}
        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-4 border border-white/10">
          <div className="grid grid-cols-3 gap-3">
            {digits.map((digit, index) => {
              if (digit === null) {
                return <div key={index} className="h-16" />;
              }
              if (digit === 'delete') {
                return (
                  <button
                    key={index}
                    onClick={handleDelete}
                    disabled={success || attempts >= maxAttempts}
                    className="h-16 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/20 transition-all flex items-center justify-center text-white disabled:opacity-50"
                  >
                    <Delete className="w-6 h-6" />
                  </button>
                );
              }
              return (
                <button
                  key={index}
                  onClick={() => handleDigit(digit.toString())}
                  disabled={success || attempts >= maxAttempts}
                  className="h-16 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/25 transition-all text-white text-2xl font-semibold disabled:opacity-50 active:scale-95"
                >
                  {digit}
                </button>
              );
            })}
          </div>
        </div>

        {/* Logout button */}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={onLogout}
            className="text-white/50 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Switch Account
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex h-1 w-20 rounded-full overflow-hidden mx-auto mb-2">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <p className="text-white/30 text-xs">
            🇸🇱 Sierra Leone Business Management
          </p>
        </div>
      </div>
    </div>
  );
}