import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../config/firebase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
} 

/**
 * Reward a user with points when they complete pickups or actions.
 * @param userId - Firebase Auth UID of the user.
 * @param rewardPoints - Points to add (default 10).
 */
export const rewardUser = async (userId: string, rewardPoints: number = 10) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { points: increment(rewardPoints) });
    console.log(`✅ Added ${rewardPoints} points to user ${userId}`);
  } catch (error) {
    console.error("❌ Error rewarding user:", error);
  }
};