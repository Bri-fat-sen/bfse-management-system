import React, { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Delete, CheckCircle, XCircle, LogOut } from "lucide-react";

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
  const pinRef = useRef("");

  const verifyPin = useCallback((enteredPin) => {
    if (employee?.pin_hash === enteredPin) {
      setSuccess(true);
      setTimeout(() => {
        onUnlock();
      }, 500);
    } else {
      setAttempts(prev => prev + 1);
      setError("Incorrect PIN. Please try again.");
      setPin("");
      pinRef.current = "";
      
      if (attempts + 1 >= maxAttempts) {
        setError("Too many attempts. Please contact your administrator.");
      }
    }
  }, [employee?.pin_hash, onUnlock, attempts, maxAttempts]);

  const handleDigit = useCallback((digit) => {
    if (pinRef.current.length < 4) {
      const newPin = pinRef.current + digit;
      pinRef.current = newPin;
      setPin(newPin);
      setError("");
      
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  }, [verifyPin]);

  const handleDelete = useCallback(() => {
    pinRef.current = pinRef.current.slice(0, -1);
    setPin(pinRef.current);
    setError("");
  }, []);

  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'delete'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231EB053' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Flag stripe */}
          <div className="flex h-2 w-32 rounded-full overflow-hidden mx-auto mb-6 shadow-md">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-gray-100 border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>

          {/* Logo */}
          {organisation?.logo_url ? (
            <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-2xl p-2 shadow-xl border border-gray-100">
              <img 
                src={organisation.logo_url} 
                alt={organisation.name} 
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <div className="h-1/3 bg-[#1EB053]" />
              <div className="h-1/3 bg-white border-y border-gray-200" />
              <div className="h-1/3 bg-[#0072C6]" />
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {organisation?.name || 'Welcome'}
          </h1>
          <p className="text-gray-500 text-sm">
            Enter your 4-digit PIN to continue
          </p>
        </div>

        {/* User info */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1EB053] to-[#0072C6] flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {employee?.first_name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-gray-900 font-medium">{employee?.full_name || 'User'}</p>
              <p className="text-gray-500 text-sm capitalize">{employee?.role?.replace(/_/g, ' ') || 'Employee'}</p>
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
                  ? 'border-[#1EB053] bg-[#1EB053]/10' 
                  : error && pin.length === 0
                  ? 'border-red-400 bg-red-50'
                  : pin.length > i 
                  ? 'border-[#1EB053] bg-[#1EB053]/5' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              {pin.length > i ? (
                <div className={`w-4 h-4 rounded-full ${success ? 'bg-[#1EB053]' : 'bg-gray-800'}`} />
              ) : null}
            </div>
          ))}
        </div>

        {/* Error/Success message */}
        {error && (
          <div className="flex items-center justify-center gap-2 text-red-500 text-sm mb-4">
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
        <div className="bg-gray-50 rounded-3xl p-4 border border-gray-100">
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
                    className="h-16 rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-all flex items-center justify-center text-gray-600 disabled:opacity-50"
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
                  className="h-16 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-all text-gray-800 text-2xl font-semibold disabled:opacity-50 active:scale-95 shadow-sm"
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
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Switch Account
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex h-1 w-20 rounded-full overflow-hidden mx-auto mb-2">
            <div className="flex-1 bg-[#1EB053]" />
            <div className="flex-1 bg-gray-100 border-y border-gray-200" />
            <div className="flex-1 bg-[#0072C6]" />
          </div>
          <p className="text-gray-400 text-xs">
            🇸🇱 Sierra Leone Business Management
          </p>
        </div>
      </div>
    </div>
  );
}