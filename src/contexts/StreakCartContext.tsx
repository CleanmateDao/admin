import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { StreakSubmission } from "../types";
import { formatEther } from "viem";

export interface StreakCartItem {
  submissionId: string;
  amount: string;
  metadata?: string;
  user?: string;
  submittedAt?: string;
}

interface StreakCartContextType {
  cart: StreakCartItem[];
  addToCart: (streak: StreakSubmission) => void;
  removeFromCart: (submissionId: string) => void;
  clearCart: () => void;
  updateCartItemAmount: (submissionId: string, amount: string) => void;
  isInCart: (submissionId: string) => boolean;
}

const StreakCartContext = createContext<StreakCartContextType | undefined>(
  undefined
);

const CART_STORAGE_KEY = "streakCart";

export function StreakCartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<StreakCartItem[]>(() => {
    // Load from localStorage on mount
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (streak: StreakSubmission) => {
    // Check if already in cart
    if (cart.some((item) => item.submissionId === streak.submissionId)) {
      return;
    }

    // Format rewardAmount from wei to B3TR if it exists, otherwise use "0"
    const amount = streak.rewardAmount
      ? formatEther(BigInt(streak.rewardAmount))
      : "0";
    setCart([
      ...cart,
      {
        submissionId: streak.submissionId,
        amount: amount,
        metadata: streak.metadata,
        user: streak.user,
        submittedAt: streak.submittedAt,
      },
    ]);
  };

  const removeFromCart = (submissionId: string) => {
    setCart(cart.filter((item) => item.submissionId !== submissionId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const updateCartItemAmount = (submissionId: string, amount: string) => {
    setCart(
      cart.map((item) =>
        item.submissionId === submissionId ? { ...item, amount } : item
      )
    );
  };

  const isInCart = (submissionId: string) => {
    return cart.some((item) => item.submissionId === submissionId);
  };

  return (
    <StreakCartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        updateCartItemAmount,
        isInCart,
      }}
    >
      {children}
    </StreakCartContext.Provider>
  );
}

export function useStreakCart() {
  const context = useContext(StreakCartContext);
  if (context === undefined) {
    throw new Error("useStreakCart must be used within a StreakCartProvider");
  }
  return context;
}

