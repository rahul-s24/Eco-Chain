import { useState } from 'react';
import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-hot-toast';
import { ScheduledPickup } from './useScheduledPickups';
import { rewardUser } from '../lib/utils';

export const usePickupCompletion = () => {
  const [isCompleting, setIsCompleting] = useState<string | null>(null);
  const [isRating, setIsRating] = useState<string | null>(null);

  const completePickup = async (pickupId: string, pickerId?: string) => {
    try {
      setIsCompleting(pickupId);

      const pickupRef = doc(db, 'scheduled_pickups', pickupId);
      const pickupSnap = await getDoc(pickupRef);

      if (!pickupSnap.exists()) {
        toast.error('Pickup not found!');
        return;
      }
      const pickupData = pickupSnap.data();
      // ✅ Update status to completed
      await updateDoc(pickupRef, {
        status: 'Completed',
        completedAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      // 🎯 Reward picker if provided
      if (pickerId) {
        await rewardUser(pickerId, 10);
      }

      // 🎯 Reward generator if exists in pickup data
      if (pickupData.generatorId) {
        await rewardUser(pickupData.generatorId, 10);
      }

      toast.success('Pickup completed! Both picker & generator earned +10 points 🎉');
    } catch (error) {
      console.error('Error completing pickup:', error);
      toast.error('Failed to complete pickup');
      throw error;
    } finally {
      setIsCompleting(null);
    }
  };

  const submitGeneratorRating = async (
    pickupId: string,
    rating: number,
    comment?: string
  ) => {
    try {
      setIsRating(pickupId);
      await updateDoc(doc(db, 'scheduled_pickups', pickupId), {
        generatorRating: rating,
        generatorComment: comment || null,
        updatedAt: Timestamp.now()
      });
      toast.success('Rating submitted successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
      throw error;
    } finally {
      setIsRating(null);
    }
  };

  const submitPickerRating = async (
    pickupId: string,
    rating: number,
    comment?: string
  ) => {
    try {
      setIsRating(pickupId);
      await updateDoc(doc(db, 'scheduled_pickups', pickupId), {
        pickerRating: rating,
        pickerComment: comment || null,
        updatedAt: Timestamp.now()
      });
      toast.success('Rating submitted successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
      throw error;
    } finally {
      setIsRating(null);
    }
  };

  return {
    isCompleting,
    isRating,
    completePickup,
    submitGeneratorRating,
    submitPickerRating
  };
};
