import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useScheduledPickups } from '../hooks/useScheduledPickups';
import { usePickupCompletion } from '../hooks/usePickupCompletion';
import { 
  Trash2, Calendar, LogOut, MapPin, User, Package, 
  Loader2, Star, ClipboardList, PackageX, CheckCircle2,
  PackageSearch, CalendarDays, Scale
} from 'lucide-react';
import { Map } from '../components/Map';
import { toast } from 'react-toastify';
import { auth } from '../config/firebase';
import { format } from 'date-fns';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Modal } from '../components/ui/modal';

interface PickupLocation {
    lat: number;
    lng: number;
    address: string;
}

export const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { profile, isLoading: profileLoading } = useUserProfile(currentUser?.uid);
  const { 
    pickups, 
    isLoading: pickupsLoading, 
    isSaving, 
    isCancelling, 
    addPickup, 
    cancelPickup 
  } = useScheduledPickups(currentUser?.uid);
  const { submitGeneratorRating, isRating } = usePickupCompletion();
  const navigate = useNavigate();
  const [showMap, setShowMap] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<any>(null);

  const [selectedWasteTypes, setSelectedWasteTypes] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<PickupLocation | null>(null);
  const [pickupDate, setPickupDate] = useState<string>('');
  const [showSchedulePickup, setShowSchedulePickup] = useState(false);

  const [selectedRating, setSelectedRating] = useState<{ [key: string]: number }>({});
  const [selectedComment, setSelectedComment] = useState<{ [key: string]: string }>({});

  const [pickupToCancel, setPickupToCancel] = useState<string | null>(null);

  const wasteTypes = ['Plastic', 'Paper', 'Metal', 'Glass'];
  const quantities = ['Small Bag', 'Medium Bag', 'Large Bag'];

  const handleWasteTypeToggle = (type: string) => {
    setSelectedWasteTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      }
      return [...prev, type];
    });
  };

  const validateForm = () => {
    if (selectedWasteTypes.length === 0) {
      toast.error('Please select at least one waste type');
      return false;
    }
    if (!quantity) {
      toast.error('Please select a quantity');
      return false;
    }
    if (!pickupDate) {
      toast.error('Please select a pickup date');
      return false;
    }
    if (!selectedLocation) {
      toast.error('Please select a pickup location');
      return false;
    }
    return true;
  };

  const handleSchedulePickup = async () => {
    if (!currentUser || !selectedLocation) return;

    if (!validateForm()) {
      return;
    }

    try {
      await addPickup({
        wasteTypes: selectedWasteTypes,
        pickupDate,
        quantity,
        location: selectedLocation,
        userAddress: profile?.address || ''
      });
      
      // Reset form
      setSelectedWasteTypes([]);
      setPickupDate('');
      setSelectedLocation(null);
      setQuantity('');
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
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
    await submitGeneratorRating(pickupId, selectedRating[pickupId], selectedComment[pickupId]);
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

  const handleCancelPickup = (pickupId: string) => {
    setPickupToCancel(pickupId);
  };

  const handleConfirmCancel = async () => {
    if (!pickupToCancel) return;
    
    try {
      await cancelPickup(pickupToCancel);
      setPickupToCancel(null);
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

  const pendingPickups = pickups.filter(pickup => pickup.status === 'Pending');
  const assignedPickups = pickups.filter(pickup => pickup.status === 'Assigned');
  const completedPickups = pickups.filter(pickup => pickup.status === 'Completed');

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Eco Chain Dashboard</h1>
          <div className="flex items-center bg-yellow-50 px-4 py-2 rounded-lg shadow-sm border border-yellow-200">
            <Star className="w-5 h-5 text-yellow-500 mr-2" />
              <span className="text-lg font-semibold text-yellow-700">
                Reward Points: {profile?.points ?? 0}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <User className="w-4 h-4 mr-2" />
              My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {/* Schedule Pickup Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-green-100 hover:shadow-xl transition-all duration-200 mb-8">
          <h2 className="text-2xl font-semibold mb-6 flex items-center text-green-800">
            <PackageSearch className="w-6 h-6 mr-3 text-green-600 drop-shadow-sm" />
            Schedule a Pickup
          </h2>

          {profile?.address && (
            <div className="bg-green-50/50 rounded-lg p-4 mb-6 border border-green-100">
              <p className="text-sm text-green-700 font-medium">Your saved pickup address:</p>
              <p className="text-gray-600 mt-1">{profile.address}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Waste Types Selection */}
            <div className="bg-white rounded-lg p-6 border border-green-100 shadow-md hover:shadow-lg transition-all duration-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-green-800">
                <Package className="w-5 h-5 mr-2 text-green-600" />
                Select Waste Types
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {wasteTypes.map((type) => (
                  <label
                    key={type}
                    className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedWasteTypes.includes(type)
                        ? 'bg-green-50 border-2 border-green-500 shadow-md'
                        : 'bg-white border-2 border-green-100 hover:border-green-200 hover:bg-green-50/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedWasteTypes.includes(type)}
                      onChange={() => handleWasteTypeToggle(type)}
                      className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                    />
                    <span className="ml-2 text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div className="bg-white rounded-lg p-6 border border-green-100 shadow-md hover:shadow-lg transition-all duration-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-green-800">
                <Scale className="w-5 h-5 mr-2 text-green-600" />
                Select Quantity
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {quantities.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuantity(q)}
                    className={`px-4 py-3 rounded-lg transition-all duration-200 ${
                      quantity === q
                        ? 'bg-green-600 text-white shadow-md hover:bg-green-700'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div className="bg-white rounded-lg p-6 border border-green-100 shadow-md hover:shadow-lg transition-all duration-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-green-800">
                <CalendarDays className="w-5 h-5 mr-2 text-green-600" />
                Select Date
              </h3>
              <div className="relative">
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full p-3 rounded-lg border border-green-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-green-50/50 hover:bg-green-50 transition-colors duration-200"
                min={new Date().toISOString().split('T')[0]}
              />
              </div>
            </div>

            {/* Location Selection */}
            <div className="bg-white rounded-lg p-6 border border-green-100 shadow-md hover:shadow-lg transition-all duration-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center text-green-800">
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                Select Location
              </h3>
              <div className="rounded-lg overflow-hidden border border-green-200">
              <Map
                onLocationSelect={(lat, lng, address) => 
                  setSelectedLocation({ lat, lng, address })
                }
                initialLocation={selectedLocation || undefined}
              />
              </div>
              {selectedLocation && (
                <div className="mt-4 p-4 rounded-lg bg-green-50/50 border border-green-100">
                  <p className="text-sm text-gray-700">{selectedLocation.address}</p>
                  <p className="text-xs text-green-600 mt-1">
                    Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Button */}
            <Button
              onClick={handleSchedulePickup}
              disabled={selectedWasteTypes.length === 0 || !pickupDate || !selectedLocation || !quantity || isSaving}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center text-lg font-medium"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <PackageSearch className="w-5 h-5 mr-2" />
              Confirm Schedule
                </>
              )}
            </Button>
          </div>
        </div>

        {/* My Scheduled Pickups Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-green-100 hover:shadow-xl transition-all duration-200">
          <h2 className="text-2xl font-semibold mb-6 flex items-center text-green-800">
            <ClipboardList className="w-6 h-6 mr-3 text-green-600 drop-shadow-sm" />
            My Scheduled Pickups
          </h2>
          {pickups.length === 0 ? (
            <div className="bg-green-50/50 rounded-lg p-12 text-center border border-green-100">
              <ClipboardList className="h-16 w-16 mx-auto text-green-400 mb-4" />
              <p className="text-lg text-green-800 font-medium mb-2">No Pickups Scheduled</p>
              <p className="text-gray-600">You haven't scheduled any waste pickups yet.</p>
              <Button 
                variant="outline"
                className="mt-6 border-green-600 text-green-600 hover:bg-green-50"
                onClick={() => setShowSchedulePickup(true)}
              >
                Schedule Your First Pickup
              </Button>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Pending Pickups Section */}
              <section>
                <h3 className="text-xl font-semibold mb-6 text-yellow-800 drop-shadow-sm">Pending Pickups</h3>
                {pendingPickups.length === 0 ? (
                  <div className="bg-yellow-50/50 rounded-lg p-8 text-center border border-yellow-100">
                    <PackageX className="h-12 w-12 mx-auto text-yellow-400 mb-3" />
                    <p className="text-gray-600">No pending pickups at the moment</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pendingPickups.map(pickup => (
                      <Card key={pickup.id} className="bg-white border border-yellow-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-yellow-200 transform hover:-translate-y-1">
                        <CardHeader className="border-b border-yellow-100 bg-gradient-to-r from-yellow-50 to-white">
                          <CardTitle className="flex items-center justify-between">
                            <span className="text-yellow-800 font-semibold">Pickup Request</span>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 shadow-sm">Pending</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-3 text-yellow-600" />
                              {pickup.pickupDate ? format(pickup.pickupDate.toDate(), 'MMM d, yyyy') : 'Date not set'}
                            </div>
                            <div className="flex items-start text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-3 text-yellow-600 mt-1 flex-shrink-0" />
                              <span>{pickup.location?.address || pickup.userAddress || 'Location not specified'}</span>
                            </div>
                            <div className="text-sm border-t border-yellow-100 pt-4 space-y-2">
                              <div>
                                <span className="font-medium text-yellow-700">Waste Types: </span>
                                <span className="text-gray-600">{pickup.wasteTypes.join(', ')}</span>
                              </div>
                              <div>
                                <span className="font-medium text-yellow-700">Quantity: </span>
                                <span className="text-gray-600">{pickup.quantity}</span>
                              </div>
                            </div>
                            <Button
                              variant="destructive"
                              className="w-full mt-2 shadow-md hover:shadow-lg transition-all duration-200"
                              onClick={() => handleCancelPickup(pickup.id)}
                              disabled={isCancelling === pickup.id}
                            >
                              {isCancelling === pickup.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  <span>Cancelling...</span>
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  <span>Cancel Pickup</span>
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
              <hr className="my-8 border-t border-green-100" />

              {/* Assigned Pickups Section */}
              <section>
                <h3 className="text-xl font-semibold mb-6 text-blue-800 drop-shadow-sm">Assigned Pickups</h3>
                {assignedPickups.length === 0 ? (
                  <div className="bg-blue-50/50 rounded-lg p-8 text-center border border-blue-100">
                    <Package className="h-12 w-12 mx-auto text-blue-400 mb-3" />
                    <p className="text-gray-600">No assigned pickups at the moment</p>
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {assignedPickups.map(pickup => (
                      <Card key={pickup.id} className="bg-white border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-blue-200 transform hover:-translate-y-1">
                        <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white">
                          <CardTitle className="flex items-center justify-between">
                            <span className="text-blue-800 font-semibold">Pickup Request</span>
                            <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-sm">Assigned</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-3 text-blue-600" />
                              {pickup.pickupDate ? format(pickup.pickupDate.toDate(), 'MMM d, yyyy') : 'Date not set'}
                            </div>
                            <div className="flex items-start text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-3 text-blue-600 mt-1 flex-shrink-0" />
                              <span>{pickup.location?.address || pickup.userAddress || 'Location not specified'}</span>
                            </div>
                            <div className="text-sm border-t border-blue-100 pt-4 space-y-2">
                              <div>
                                <span className="font-medium text-blue-700">Waste Types: </span>
                                <span className="text-gray-600">{pickup.wasteTypes.join(', ')}</span>
                              </div>
                              <div>
                                <span className="font-medium text-blue-700">Quantity: </span>
                                <span className="text-gray-600">{pickup.quantity}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
              <hr className="my-8 border-t border-green-100" />

              {/* Completed Pickups Section */}
              <section>
                <h3 className="text-xl font-semibold mb-6 text-green-800 drop-shadow-sm">Completed Pickups</h3>
                {completedPickups.length === 0 ? (
                  <div className="bg-green-50/50 rounded-lg p-8 text-center border border-green-100">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-400 mb-3" />
                    <p className="text-gray-600">No completed pickups yet</p>
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
                            {!pickup.generatorRating && (
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
                            {pickup.generatorRating && (
                              <div className="mt-4 border-t border-green-100 pt-4">
                                <div className="flex flex-col items-center space-y-2">
                                  <p className="text-sm text-green-700 font-medium">Your Rating</p>
                                  <div className="flex items-center space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`w-5 h-5 ${
                                          star <= (pickup.generatorRating || 0)
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  {pickup.generatorComment && (
                                    <div className="mt-2 text-center">
                                      <p className="text-sm text-gray-500 font-medium">Your Comment</p>
                                      <p className="text-sm text-green-600 mt-1 italic">"{pickup.generatorComment}"</p>
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
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!pickupToCancel}
        onClose={() => setPickupToCancel(null)}
        title="Cancel Pickup"
        primaryAction={{
          label: "Confirm Cancel",
          onClick: handleConfirmCancel,
          variant: "destructive"
        }}
        secondaryAction={{
          label: "Keep Pickup",
          onClick: () => setPickupToCancel(null),
          variant: "outline"
        }}
      >
        <div className="space-y-4">
          <p className="text-gray-700">Are you sure you want to cancel this pickup?</p>
          <p className="text-sm text-gray-500">This action cannot be undone.</p>
        </div>
      </Modal>
    </div>
  );
};