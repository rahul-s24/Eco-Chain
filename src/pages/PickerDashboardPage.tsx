import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useScheduledPickups } from '../hooks/useScheduledPickups';
import { usePickupAssignment } from '../hooks/usePickupAssignment';
import { usePickupCompletion } from '../hooks/usePickupCompletion';
import { Trash2, Calendar, LogOut, MapPin, Loader2, CheckCircle2, User, Phone, Mail, Clock, Star, PackageSearch, ClipboardCheck, PackageX, Power } from 'lucide-react';
import { auth } from '../config/firebase';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Modal } from '../components/ui/modal';

export const PickerDashboardPage = () => {
  const { currentUser } = useAuth();
  const { profile, isLoading: profileLoading, updateAvailability, isUpdating } = useUserProfile(currentUser?.uid);
  const { pickups, isLoading: pickupsLoading } = useScheduledPickups(currentUser?.uid);
  const { isAssigning, assignPickup } = usePickupAssignment();
  const { completePickup, submitPickerRating, isCompleting, isRating } = usePickupCompletion();
  const navigate = useNavigate();

  const [selectedRating, setSelectedRating] = useState<{ [key: string]: number }>({});
  const [selectedComment, setSelectedComment] = useState<{ [key: string]: string }>({});
  const [pincode, setPincode] = useState('');
  const [savingPincode, setSavingPincode] = useState(false);
  const [pickupToComplete, setPickupToComplete] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  const handleAvailabilityToggle = async () => {
    if (profile) {
      await updateAvailability(!profile.isAvailable);
    }
  };

  const handleAcceptPickup = async (pickupId: string) => {
    if (!profile?.userId) {
      toast.error('User profile not found');
      return;
    }

    try {
      await assignPickup(pickupId, profile.userId);
      // The pickup list will automatically update due to the useEffect dependency
    } catch (error) {
      console.error('Error accepting pickup:', error);
    }
  };

  const handleRatingChange = (pickupId: string, rating: number) => {
    setSelectedRating(prev => ({ ...prev, [pickupId]: rating }));
  };

  const handleCommentChange = (pickupId: string, comment: string) => {
    setSelectedComment(prev => ({ ...prev, [pickupId]: comment }));
  };

  const handleSubmitRating = async (pickupId: string) => {
    if (!selectedRating[pickupId]) {
      toast.error('Please select a rating');
      return;
    }
    await submitPickerRating(pickupId, selectedRating[pickupId], selectedComment[pickupId]);
    setSelectedRating(prev => {
      const newState = { ...prev };
      delete newState[pickupId];
      return newState;
    });
    setSelectedComment(prev => {
      const newState = { ...prev };
      delete newState[pickupId];
      return newState;
    });
  };

  const handleSavePincode = async () => {
    if (!pincode || !profile) return;
    
    setSavingPincode(true);
    try {
      const userRef = doc(db, 'users', profile.userId);
      await updateDoc(userRef, {
        pincode: pincode.trim(),
        updatedAt: new Date()
      });
      toast.success('Pincode saved successfully');
    } catch (error) {
      console.error('Error saving pincode:', error);
      toast.error('Failed to save pincode');
    } finally {
      setSavingPincode(false);
    }
  };

  const handleCompletePickup = (pickupId: string) => {
    setPickupToComplete(pickupId);
  };

  const handleConfirmComplete = async () => {
    if (!pickupToComplete) return;
    
    try {
      await completePickup(pickupToComplete);
      setPickupToComplete(null);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  if (profileLoading || pickupsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Separate pending and accepted pickups
  const pendingPickups = pickups.filter(pickup => pickup.status === 'Pending');
  const acceptedPickups = pickups.filter(pickup => 
    pickup.status === 'Assigned' && pickup.assignedTo === currentUser?.uid
  );
  const completedPickups = pickups.filter(pickup => 
    pickup.status === 'Completed' && pickup.assignedTo === currentUser?.uid
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 drop-shadow-sm">Eco Chain Dashboard</h1>
          <div className="flex items-center space-x-6">
            {/* Availability Toggle */}
            <div className="flex items-center space-x-4 bg-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200">
              <div className="flex items-center space-x-3">
                <Switch
                  id="availability"
                  checked={profile?.isAvailable || false}
                  onCheckedChange={handleAvailabilityToggle}
                  disabled={isUpdating}
                  className={`
                    ${profile?.isAvailable ? 'bg-green-700' : 'bg-gray-200'} 
                    hover:bg-green-600 
                    data-[state=checked]:bg-green-700
                    transition-all duration-200
                    [&>span]:bg-white
                    [&>span]:shadow-[0_2px_4px_rgba(0,0,0,0.2)]
                    [&>span]:hover:shadow-[0_4px_8px_rgba(0,0,0,0.25)]
                    [&>span]:transition-all
                    [&>span]:data-[state=checked]:bg-green-50
                    [&>span]:data-[state=checked]:hover:bg-green-100
                    scale-125
                  `}
                />
                <Label 
                  htmlFor="availability" 
                  className={`
                    font-medium text-base
                    ${profile?.isAvailable ? 'text-green-700' : 'text-gray-600'}
                    drop-shadow-sm
                    transition-colors duration-200
                  `}
                >
                  {profile?.isAvailable ? 'Available' : 'Unavailable'}
                </Label>
              </div>
              {isUpdating && <Loader2 className="w-4 h-4 animate-spin text-green-600" />}
            </div>
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <User className="w-4 h-4 mr-2" />
              My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-green-100 hover:shadow-xl transition-shadow duration-200">
          <h2 className="text-2xl font-semibold mb-6 flex items-center text-green-800">
            <User className="w-6 h-6 mr-3 text-green-600 drop-shadow-sm" />
            Your Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center p-4 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors duration-200">
              <User className="w-5 h-5 mr-3 text-green-500 drop-shadow-sm" />
              <div>
                <p className="text-sm text-green-600 font-medium">Name</p>
                <p className="font-semibold text-gray-900">{profile?.name || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center p-4 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors duration-200">
              <Mail className="w-5 h-5 mr-3 text-green-500 drop-shadow-sm" />
              <div>
                <p className="text-sm text-green-600 font-medium">Email</p>
                <p className="font-semibold text-gray-900">{currentUser?.email || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center p-4 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors duration-200">
              <Phone className="w-5 h-5 mr-3 text-green-500 drop-shadow-sm" />
              <div>
                <p className="text-sm text-green-600 font-medium">Phone</p>
                <p className="font-semibold text-gray-900">{profile?.phone || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center p-4 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors duration-200">
              <MapPin className="w-5 h-5 mr-3 text-green-500 drop-shadow-sm" />
              <div>
                <p className="text-sm text-green-600 font-medium">Address</p>
                <p className="font-semibold text-gray-900">{profile?.address || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center p-4 rounded-lg bg-green-50/50 hover:bg-green-50 transition-colors duration-200">
              <MapPin className="w-5 h-5 mr-3 text-green-500 drop-shadow-sm" />
              <div className="flex-1">
                <p className="text-sm text-green-600 font-medium">Pincode</p>
                {profile?.pincode ? (
                  <p className="font-semibold text-gray-900">{profile.pincode}</p>
                ) : (
                  <div className="mt-2 flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter your pincode"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-32"
                      maxLength={6}
                    />
                    <Button
                      onClick={handleSavePincode}
                      disabled={!pincode || savingPincode}
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      {savingPincode ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Save'
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Show warning if no pincode is set */}
        {!profile?.pincode && (
          <div className="bg-yellow-50 rounded-lg p-4 mb-8 border border-yellow-200">
            <p className="text-yellow-800 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Please set your pincode to see pickup requests in your area.
            </p>
          </div>
        )}

        {/* Pending Pickups Section */}
        <section className="bg-white rounded-xl shadow-lg p-8 border border-green-100 hover:shadow-xl transition-all duration-200">
          <h2 className="text-2xl font-semibold mb-6 flex items-center text-green-800">
            <PackageSearch className="w-6 h-6 mr-3 text-green-600 drop-shadow-sm" />
            Available Pickups
          </h2>

          {!profile?.isAvailable ? (
            <div className="bg-yellow-50 rounded-lg p-12 text-center border border-yellow-100">
              <Power className="h-16 w-16 mx-auto text-yellow-400 mb-4" />
              <p className="text-lg text-yellow-800 font-medium mb-2">You're Currently Unavailable</p>
              <p className="text-gray-600">Toggle your availability above to see and accept new pickup requests.</p>
            </div>
          ) : pickupsLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-green-600">
              <Loader2 className="h-12 w-12 animate-spin mb-4" />
              <p className="text-lg">Loading available pickups...</p>
            </div>
          ) : pendingPickups.length === 0 ? (
            <div className="bg-green-50/50 rounded-lg p-12 text-center border border-green-100">
              <Clock className="h-16 w-16 mx-auto text-green-400 mb-4" />
              <p className="text-lg text-green-800 font-medium mb-2">No Available Pickups</p>
              <p className="text-gray-600">There are no pending waste pickups in your area at the moment.</p>
              <p className="text-sm text-green-600 mt-4">Check back later for new pickup requests!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingPickups.map(pickup => (
                <Card key={pickup.id} className="bg-white border border-green-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-green-200 transform hover:-translate-y-1">
                  <CardHeader className="border-b border-green-100 bg-gradient-to-r from-green-50 to-white">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-green-800 font-semibold">Pickup Request</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 shadow-sm">Pending</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-3 text-green-600" />
                        {pickup.pickupDate ? format(pickup.pickupDate.toDate(), 'MMM d, yyyy') : 'Date not set'}
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-3 text-green-600 mt-1 flex-shrink-0" />
                        <span>{pickup.location?.address || pickup.userAddress || 'Location not specified'}</span>
                      </div>
                      <div className="text-sm border-t border-green-100 pt-4 space-y-2">
                        <div>
                          <span className="font-medium text-green-700">Waste Types: </span>
                          <span className="text-gray-600">{pickup.wasteTypes.join(', ')}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Quantity: </span>
                          <span className="text-gray-600">{pickup.quantity}</span>
                        </div>
                      </div>
                      <Button
                        className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                        onClick={() => handleAcceptPickup(pickup.id)}
                        disabled={isAssigning === pickup.id}
                      >
                        {isAssigning === pickup.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            <span>Accepting...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            <span>Accept Pickup</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Accepted Pickups Section */}
        <section className="bg-white rounded-xl shadow-lg p-8 border border-green-100 hover:shadow-xl transition-all duration-200">
          <h2 className="text-2xl font-semibold mb-6 flex items-center text-green-800">
            <ClipboardCheck className="w-6 h-6 mr-3 text-green-600 drop-shadow-sm" />
            Your Accepted Pickups
          </h2>
          {acceptedPickups.length === 0 ? (
            <div className="bg-green-50/50 rounded-lg p-12 text-center border border-green-100">
              <ClipboardCheck className="h-16 w-16 mx-auto text-green-400 mb-4" />
              <p className="text-lg text-green-800 font-medium mb-2">No Accepted Pickups</p>
              <p className="text-gray-600">You haven't accepted any pickup requests yet.</p>
              <p className="text-sm text-green-600 mt-4">Browse available pickups above to get started!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {acceptedPickups.map(pickup => (
                <Card key={pickup.id} className="bg-white border border-green-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-green-200 transform hover:-translate-y-1">
                  <CardHeader className="border-b border-green-100 bg-gradient-to-r from-green-50 to-white">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-green-800 font-semibold">Pickup Request</span>
                      <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-sm">Assigned</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-3 text-green-600" />
                        {pickup.pickupDate ? format(pickup.pickupDate.toDate(), 'MMM d, yyyy') : 'Date not set'}
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-3 text-green-600 mt-1 flex-shrink-0" />
                        <span>{pickup.location?.address || pickup.userAddress || 'Location not specified'}</span>
                      </div>
                      <div className="text-sm border-t border-green-100 pt-4 space-y-2">
                        <div>
                          <span className="font-medium text-green-700">Waste Types: </span>
                          <span className="text-gray-600">{pickup.wasteTypes.join(', ')}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Quantity: </span>
                          <span className="text-gray-600">{pickup.quantity}</span>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full mt-2 border-green-600 text-green-600 hover:bg-green-50 shadow-md hover:shadow-lg transition-all duration-200"
                        onClick={() => handleCompletePickup(pickup.id)}
                        disabled={isCompleting === pickup.id}
                      >
                        {isCompleting === pickup.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            <span>Completing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            <span>Mark as Complete</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Completed Pickups Section */}
        <section className="bg-white rounded-xl shadow-lg p-8 border border-green-100 hover:shadow-xl transition-all duration-200">
          <h2 className="text-2xl font-semibold mb-6 flex items-center text-green-800">
            <CheckCircle2 className="w-6 h-6 mr-3 text-green-600 drop-shadow-sm" />
            Completed Pickups
          </h2>
          {completedPickups.length === 0 ? (
            <div className="bg-green-50/50 rounded-lg p-12 text-center border border-green-100">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-400 mb-4" />
              <p className="text-lg text-green-800 font-medium mb-2">No Completed Pickups</p>
              <p className="text-gray-600">You haven't completed any pickups yet.</p>
              <p className="text-sm text-green-600 mt-4">Accept a pickup request to get started!</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedPickups.map(pickup => (
                <Card key={pickup.id} className="bg-white border border-green-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-green-200 transform hover:-translate-y-1">
                  <CardHeader className="border-b border-green-100 bg-gradient-to-r from-green-50 to-white">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-green-800 font-semibold">Pickup Request</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 shadow-sm">Completed</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-3 text-green-600" />
                        {pickup.pickupDate ? format(pickup.pickupDate.toDate(), 'MMM d, yyyy') : 'Date not set'}
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-3 text-green-600 mt-1 flex-shrink-0" />
                        <span>{pickup.location?.address || pickup.userAddress || 'Location not specified'}</span>
                      </div>
                      <div className="text-sm border-t border-green-100 pt-4 space-y-2">
                        <div>
                          <span className="font-medium text-green-700">Waste Types: </span>
                          <span className="text-gray-600">{pickup.wasteTypes.join(', ')}</span>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Quantity: </span>
                          <span className="text-gray-600">{pickup.quantity}</span>
                        </div>
                      </div>
                      {!pickup.pickerRating && (
                        <div className="mt-4 space-y-4 border-t border-green-100 pt-4">
                          <div className="flex items-center justify-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleRatingChange(pickup.id, star)}
                                className={`text-2xl transition-colors duration-200 ${
                                  selectedRating[pickup.id] >= star
                                    ? 'text-yellow-400 hover:text-yellow-500'
                                    : 'text-gray-300 hover:text-gray-400'
                                }`}
                              >
                                <Star className="w-6 h-6" />
                              </button>
                            ))}
                          </div>
                          <Textarea
                            placeholder="Add a comment (optional)"
                            value={selectedComment[pickup.id] || ''}
                            onChange={(e) => handleCommentChange(pickup.id, e.target.value)}
                            className="min-h-[100px] resize-none border-green-100 focus:border-green-200 bg-green-50/50 hover:bg-green-50"
                          />
                          <Button
                            variant="outline"
                            className="w-full shadow-md hover:shadow-lg transition-all duration-200 border-green-600 text-green-600 hover:bg-green-50"
                            onClick={() => handleSubmitRating(pickup.id)}
                            disabled={isRating === pickup.id}
                          >
                            {isRating === pickup.id ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                <span>Submitting...</span>
                              </>
                            ) : (
                              'Submit Rating'
                            )}
                          </Button>
                        </div>
                      )}
                      {pickup.pickerRating && (
                        <div className="mt-4 border-t border-green-100 pt-4">
                          <div className="flex flex-col items-center space-y-2">
                            <p className="text-sm text-green-700 font-medium">Your Rating</p>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= (pickup.pickerRating || 0)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            {pickup.pickerComment && (
                              <div className="mt-2 text-center">
                                <p className="text-sm text-gray-500 font-medium">Your Comment</p>
                                <p className="text-sm text-green-600 mt-1 italic">"{pickup.pickerComment}"</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Complete Confirmation Modal */}
      <Modal
        isOpen={!!pickupToComplete}
        onClose={() => setPickupToComplete(null)}
        title="Complete Pickup"
        primaryAction={{
          label: "Confirm Complete",
          onClick: handleConfirmComplete,
          variant: "default"
        }}
        secondaryAction={{
          label: "Cancel",
          onClick: () => setPickupToComplete(null),
          variant: "outline"
        }}
      >
        <div className="space-y-4">
          <p className="text-gray-700">Are you sure you want to mark this pickup as completed?</p>
          <p className="text-sm text-gray-500">This will move the pickup to your completed pickups list.</p>
        </div>
      </Modal>
    </div>
  );
}; 