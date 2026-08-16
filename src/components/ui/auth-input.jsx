"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

const Input = React.forwardRef(
  (
    {
      label,
      type = "text",
      className,
      error,
      showPasswordToggle = true,
      value,
      defaultValue,
      onChange,
      id,
      name,
      ...props
    },
    ref
  ) => {
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState(value ?? defaultValue ?? "");
    const [isAutoFilled, setIsAutoFilled] = useState(false);
    const inputRef = useRef(null);

    // Combine refs
    const combinedRef = (node) => {
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    useEffect(() => {
      if (value !== undefined) setInternalValue(value ?? "");
    }, [value]);

    // Enhanced auto-fill detection
    useEffect(() => {
      const input = inputRef.current;
      if (!input) return;

      const checkAutoFill = () => {
        if (input.value && input.value !== internalValue) {
          setInternalValue(input.value);
          setIsAutoFilled(true);
          return;
        }

        const computedStyle = window.getComputedStyle(input);
        const backgroundColor = computedStyle.backgroundColor;
        
        const isLikelyAutofilled = (
          backgroundColor !== 'rgba(0, 0, 0, 0)' && 
          backgroundColor !== 'white' && 
          backgroundColor !== '#ffffff' &&
          backgroundColor !== 'rgb(255, 255, 255)'
        );

        if (isLikelyAutofilled) {
          setIsAutoFilled(true);
        }
      };

      checkAutoFill();

      const timers = [
        setTimeout(checkAutoFill, 10),
        setTimeout(checkAutoFill, 100),
        setTimeout(checkAutoFill, 500),
        setTimeout(checkAutoFill, 1000)
      ];

      return () => {
        timers.forEach(timer => clearTimeout(timer));
      };
    }, [id, name, internalValue]);

    const handleChange = (e) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      setIsAutoFilled(false);
      onChange?.(e);
    };

    const handleBlur = (e) => {
      if (inputRef.current?.value && !internalValue) {
        setInternalValue(inputRef.current.value);
        setIsAutoFilled(true);
      }
      props.onBlur?.(e);
    };

    const inputType = isPassword && showPassword ? "text" : type;
    const currentValue = value ?? internalValue;
    const hasValue = currentValue !== "" && currentValue != null;
    const shouldFloatLabel = hasValue || isAutoFilled;

    const generatedId =
      id || name || (label ? String(label).toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="relative w-full">
        <input
          id={generatedId}
          ref={combinedRef}
          name={name}
          type={inputType}
          value={currentValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder=" "
          className={cn(
            "peer block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 text-sm text-slate-800",
            "focus:border-[#4f8cff] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4f8cff]/20 transition-all duration-150",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "autofill:bg-white autofill:shadow-[inset_0_0_0px_1000px_white]",
            "[-webkit-text-fill-color:#1e293b]",
            "[&:-webkit-autofill]:bg-white",
            "[&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_white]",
            "[&:-internal-autofill-selected]:bg-white",
            "[&:-internal-autofill-selected]:shadow-[inset_0_0_0px_1000px_white]",
            isPassword ? "pr-10" : "",
            className
          )}
          style={{
            boxShadow: "inset 0 0 0 1000px white",
          }}
          {...props}
        />

        {label && (
          <label
            htmlFor={generatedId}
            className={cn(
              "absolute left-3.5 pointer-events-none transition-all duration-200",
              "text-slate-400 font-medium",
              shouldFloatLabel
                ? [
                    "-top-2.5 text-xs font-semibold text-[#4f8cff]",
                    "bg-white px-1.5 rounded-sm",
                  ].join(' ')
                : [
                    "top-3 text-xs",
                    "bg-transparent"
                  ].join(' '),
              "peer-focus:-top-2.5 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-[#4f8cff] peer-focus:bg-white peer-focus:px-1.5"
            )}
          >
            {label}
          </label>
        )}

        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}

        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
export { Input };
