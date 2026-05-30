import { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Image, TextInput, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useSelector, useDispatch } from "react-redux";
import { confirmVisits } from "../../store/slices/propertiesSlice";
import { fetchBranchListThunk, fetchAvailableSlotsThunk, createSiteVisitThunk, clearAvailableSlots } from "../../store/slices/visitSlice";
import { TIME_SLOTS } from "../../data/visits";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { useLocalSearchParams, useRouter } from "expo-router";
import { currentUser } from "../../data/user";

export default function BookSiteVisit() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rawBookedSiteVisits = useSelector((state) => state.properties.bookedSiteVisits);
  const { isLoggedIn, token } = useSelector((state) => state.auth);
  const { branches, availableSlots, branchesLoading, slotsLoading, creating } = useSelector((state) => state.visit);

  // Deduplicate securely to prevent persisted duplicates lingering from old bug
  const bookedSiteVisits = Array.from(new Map(rawBookedSiteVisits.map(item => [item.projectId || item.id.toString().replace(/_reschedule_.*/, ""), item])).values());

  const { selectedIds, initialDate, initialTime, initialVisitors, initialNotes } = useLocalSearchParams();

  const [selectedDate, setSelectedDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [calendarMonth, setCalendarMonth] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const scrollViewRef = useRef(null);
  const [selectedTime, setSelectedTime] = useState(initialTime ? [initialTime] : []);
  const [visitors, setVisitors] = useState(initialVisitors ? parseInt(initialVisitors, 10) : 1);
  const [notes, setNotes] = useState(initialNotes || "");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const insets = useSafeAreaInsets();

  const selectedPropertyIds = selectedIds ? selectedIds.split(",") : bookedSiteVisits.map(v => v.id);
  const visitCount = selectedPropertyIds.length || 1;

  // Get first property to determine city for branch lookup
  const firstProperty = bookedSiteVisits.find(v => selectedPropertyIds.includes(v.id));
  const propertyCity = firstProperty?.location?.split(',').pop()?.trim() || firstProperty?.city || 'Mumbai';

  // Fetch branches when component mounts
  useEffect(() => {
    if (isLoggedIn && token && propertyCity) {
      console.log('🏢 Fetching branches for city:', propertyCity);
      dispatch(fetchBranchListThunk(propertyCity));
    }
  }, [propertyCity, isLoggedIn, token]);

  // Auto-select first branch when branches load
  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0]);
      console.log('✅ Auto-selected branch:', branches[0].name);
    }
  }, [branches]);

  // Fetch available slots when date or branch changes
  useEffect(() => {
    if (isLoggedIn && token && selectedDate && selectedBranch && firstProperty) {
      // Get property_id from stored data, fallback to project ID
      const propertyId = firstProperty.propertyIds?.[0] || firstProperty.projectId || firstProperty.id.replace(/\d{13}$/, "");
      
      console.log('🕐 Fetching available slots:', {
        property_id: propertyId,
        date: selectedDate,
        branch_id: selectedBranch.id
      });
      
      dispatch(fetchAvailableSlotsThunk({
        property_id: propertyId,
        date: selectedDate,
        branch_id: selectedBranch.id
      }));
    }
  }, [selectedDate, selectedBranch, isLoggedIn, token]);

  // Clear slots when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearAvailableSlots());
    };
  }, []);

  const allSlots = [
    ...(TIME_SLOTS.morning || []),
    ...(TIME_SLOTS.afternoon || []),
    ...(TIME_SLOTS.evening || []),
  ];

  const handleSlotPress = (slot) => {
    const idx = allSlots.indexOf(slot);
    setSelectedTime(allSlots.slice(idx, idx + visitCount));
  };

  const isSlotSelected = (slot) =>
    Array.isArray(selectedTime) ? selectedTime.includes(slot) : selectedTime === slot;

  const handleConfirmVisit = async () => {
    if (!isLoggedIn || !token) {
      Alert.alert('Login Required', 'Please login to book a site visit');
      return;
    }

    if (selectedTime.length === 0) {
      Alert.alert('Select Time', 'Please select a time slot for your visit');
      return;
    }

    const itemsToBook = bookedSiteVisits.filter(v => selectedPropertyIds.includes(v.id));
    if (itemsToBook.length === 0) return;

    const selectedTimeVal = Array.isArray(selectedTime) ? selectedTime[0] : selectedTime;
    
    // Convert selected date and time to ISO format for API
    const [hours, minutes] = selectedTimeVal.replace(/[AP]M/, '').trim().split(':').map(Number);
    const isPM = selectedTimeVal.includes('PM');
    const hour24 = isPM && hours !== 12 ? hours + 12 : (!isPM && hours === 12 ? 0 : hours);
    
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(hour24, minutes || 0, 0, 0);

    try {
      const firstItem = itemsToBook[0];
      
      // Get property ID from stored data, fallback to project ID
      const propertyId = firstItem.propertyIds?.[0] || firstItem.projectId;
      
      if (!propertyId) {
        Alert.alert('Error', 'Unable to determine property ID. Please try adding the project to cart again.');
        return;
      }
      
      console.log('📤 Creating site visit:', {
        property_id: propertyId,
        slot_start: slotDateTime.toISOString(),
        user_note: notes || null,
        branch_id: selectedBranch?.id
      });

      const result = await dispatch(createSiteVisitThunk({
        property_id: propertyId, // Use stored property ID
        slot_start: slotDateTime.toISOString(),
        user_note: notes || null,
        branch_id: selectedBranch?.id
      })).unwrap();

      console.log('✅ Site visit created:', result);

      // Also update local Redux state for UI
      const dateObj = new Date(selectedDate);
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const newUpcoming = itemsToBook.map(item => ({
        id: result.data?.id || Math.random().toString(),
        projectId: item.projectId || item.id.replace(/\d{13}$/, ""),
        title: item.title || item.name,
        location: item.location,
        image: item.image || item.imageMain || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
        status: "UPCOMING",
        dateFull: `${formattedDate} · ${selectedTimeVal || "10:00 AM"}`,
        isoDate: selectedDate,
        visitors: visitors,
        notes: notes,
        bookingId: `SQF-${Math.floor(10000 + Math.random() * 90000)}`,
        visitorName: currentUser.name,
        duration: "1.5 Hours",
      }));

      dispatch(confirmVisits(newUpcoming));

      router.replace({
        pathname: '/(screens)/booking-status',
        params: {
          date: selectedDate,
          time: selectedTimeVal,
          propertyName: newUpcoming[0].title,
          propertyId: newUpcoming[0].projectId
        }
      });
    } catch (error) {
      console.log('❌ Error creating site visit:', error);
      
      // Handle specific error messages with user-friendly alerts
      const errorMessage = error?.message || error || 'Failed to book site visit. Please try again.';
      
      if (errorMessage.includes('No officers available')) {
        Alert.alert(
          'No Officers Available',
          'Unfortunately, no sales officers are available for this time slot. Please try selecting a different date or time.',
          [{ text: 'OK', style: 'default' }]
        );
      } else if (errorMessage.includes('already have a booking')) {
        Alert.alert(
          'Booking Conflict',
          'You already have a site visit booked at this time. Please choose a different time slot.',
          [{ text: 'OK', style: 'default' }]
        );
      } else if (errorMessage.includes('fully booked')) {
        Alert.alert(
          'Slot Fully Booked',
          'This time slot is fully booked. Please select another time.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Booking Failed',
          errorMessage,
          [{ text: 'OK', style: 'default' }]
        );
      }
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{ paddingTop: Platform.OS === "ios" ? insets.top : 40, backgroundColor: "white" }}>
        <View className="flex-row items-center justify-between px-6 py-0.5 bg-white border-b border-gray-200">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 justify-center"
          >
            <Feather name="arrow-left" size={24} color="#111827" />
          </Pressable>

          <Text className="text-[15px] font-manrope-bold text-[#111827]">
            Book a site visit
          </Text>

          <View className="w-10 h-10" />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={-30}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 bg-white"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >

          {/* Selected Properties */}
          {bookedSiteVisits.filter(v => selectedPropertyIds.includes(v.id)).map((visit) => {
            const fallbackId = visit.id.replace(/\d{13}$/, "");
            const imageObj = visit.image || visit.imageMain;
            const imageSource = imageObj
              ? (typeof imageObj === "string" ? { uri: imageObj } : imageObj)
              : { uri: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" };

            return (
              <View key={visit.id} className="border border-gray-200 rounded-2xl p-4 flex-row mb-2 mt-2 bg-white">
                <Image source={imageSource} className="w-[75px] h-[75px] rounded-[12px] mr-4 border border-gray-200" resizeMode="cover" />
                <View className="flex-1 justify-center">
                  <Text className="text-[#4A43EC] text-[9px] font-manrope-extrabold uppercase tracking-[1.5px] mb-1.5">
                    SQUARFT PREMIUM
                  </Text>
                  <Text className="text-[14px] font-manrope-extrabold text-[#111827] mb-1" numberOfLines={1}>
                    {visit.title || visit.name}
                  </Text>
                  <View className="flex-row items-center mb-1.5">
                    <Feather name="map-pin" size={11} color="#9CA3AF" />
                    <Text className="text-[11px] font-manrope text-[#6B7280] ml-1.5" numberOfLines={1}>
                      {visit.location}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => router.push({
                      pathname: "/(screens)/project-detail",
                      params: { id: visit.projectId || fallbackId, from: "visit" }
                    })}
                    className="flex-row items-center mt-0.5"
                  >
                    <Text className="text-[#4A43EC] text-[11px] font-manrope-bold">
                      View Details
                    </Text>
                    <Feather name="chevron-right" size={12} color="#4A43EC" className="ml-1" />
                  </Pressable>
                </View>
              </View>
            );
          })}

          {/* Select Date */}
          <View className="mb-7 mt-3">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[14px] font-manrope-bold text-[#111827]">Select Date</Text>
              <View className="flex-row items-center">
                <Text className="text-[12px] font-manrope text-[#4B5563] mr-4">
                  {new Date(calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </Text>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => {
                      const d = new Date(calendarMonth);
                      d.setMonth(d.getMonth() - 1);
                      setCalendarMonth(d.toISOString().split('T')[0]);
                    }}
                    className="w-[24px] h-[24px] border border-gray-200 rounded-full bg-white items-center justify-center"
                  >
                    <Feather name="chevron-left" size={12} color="#9CA3AF" />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      const d = new Date(calendarMonth);
                      d.setMonth(d.getMonth() + 1);
                      setCalendarMonth(d.toISOString().split('T')[0]);
                    }}
                    className="w-[24px] h-[24px] border border-gray-200 rounded-full bg-white items-center justify-center"
                  >
                    <Feather name="chevron-right" size={12} color="#4B5563" />
                  </Pressable>
                </View>
              </View>
            </View>

            <View className="border border-gray-200 rounded-[20px] pb-2 pt-2 bg-white overflow-hidden">
              <Calendar
                key={calendarMonth}
                current={calendarMonth}
                hideArrows={true}
                renderHeader={() => <View style={{ height: 0 }} />}
                onDayPress={(day) => setSelectedDate(day.dateString)}
                onMonthChange={(month) => setCalendarMonth(month.dateString)}
                markingType={'custom'}
                markedDates={{
                  [selectedDate]: {
                    selected: true,
                    disableTouchEvent: true,
                    customStyles: {
                      container: {
                        backgroundColor: '#4A43EC',
                        elevation: 6,
                        shadowColor: '#4A43EC',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.35,
                        shadowRadius: 6,
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        borderWidth: 2,
                        borderColor: 'white',
                        justifyContent: 'center',
                        alignItems: 'center'
                      },
                      text: {
                        color: 'white',
                        fontFamily: 'manrope-extrabold',
                        fontSize: 14
                      }
                    }
                  }
                }}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: '#9CA3AF',
                  dayTextColor: '#111827',
                  textDisabledColor: '#D1D5DB',
                  textDayFontFamily: 'manrope-medium',
                  textDayHeaderFontFamily: 'manrope-bold',
                  textDayFontSize: 13.5,
                  textDayHeaderFontSize: 10,
                  'stylesheet.calendar.header': {
                    header: {
                      height: 0,
                      opacity: 0,
                    },
                    dayHeader: {
                      marginTop: 6,
                      marginBottom: 8,
                      width: 32,
                      textAlign: 'center',
                      fontSize: 10,
                      fontFamily: 'manrope-bold',
                      color: '#9CA3AF'
                    }
                  }
                }}
              />
            </View>
          </View>

          {/* Select Time Slot */}
          <View className="mb-7">
            <Text className="text-[14px] font-manrope-bold text-[#111827] mb-4">Select Time Slot</Text>

            <View className="flex-row items-center mb-3.5">
              <Feather name="sun" size={12} color="#9CA3AF" />
              <Text className="text-[10px] font-manrope-extrabold text-[#6B7280] ml-2 uppercase tracking-[1px]">MORNING</Text>
            </View>
            <View className="flex-row justify-between gap-3 mb-5">
              {TIME_SLOTS.morning.map(slot => (
                <Pressable
                  key={slot}
                  onPress={() => handleSlotPress(slot)}
                  className={`flex-1 items-center justify-center py-2.5 rounded-xl border ${isSlotSelected(slot) ? 'bg-[#F2EFFF] border-[#B2A7FF]' : 'bg-white border-gray-200'}`}
                >
                  <Text className={`text-[11.5px] font-manrope-bold tracking-wide ${isSlotSelected(slot) ? 'text-[#4A43EC]' : 'text-[#111827]'}`}>
                    {slot}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="flex-row items-center mb-3.5">
              <Feather name="sun" size={12} color="#9CA3AF" />
              <Text className="text-[10px] font-manrope-extrabold text-[#6B7280] ml-2 uppercase tracking-[1px]">AFTERNOON</Text>
            </View>
            <View className="flex-row justify-between gap-3 mb-2">
              {TIME_SLOTS.afternoon.map(slot => (
                <Pressable
                  key={slot}
                  onPress={() => handleSlotPress(slot)}
                  className={`flex-1 items-center justify-center py-2.5 rounded-xl border ${isSlotSelected(slot) ? 'bg-[#F2EFFF] border-[#B2A7FF]' : 'bg-white border-gray-200'}`}
                >
                  <Text className={`text-[11.5px] font-manrope-bold tracking-wide ${isSlotSelected(slot) ? 'text-[#4A43EC]' : 'text-[#111827]'}`}>
                    {slot}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View className="flex-row items-center mb-3.5">
              <Feather name="sun" size={12} color="#9CA3AF" />
              <Text className="text-[10px] font-manrope-extrabold text-[#6B7280] ml-2 uppercase tracking-[1px]">EVENING</Text>
            </View>
            <View className="flex-row justify-between gap-3 mb-2">
              {TIME_SLOTS.evening.map(slot => (
                <Pressable
                  key={slot}
                  onPress={() => handleSlotPress(slot)}
                  className={`flex-1 items-center justify-center py-2.5 rounded-xl border ${isSlotSelected(slot) ? 'bg-[#F2EFFF] border-[#B2A7FF]' : 'bg-white border-gray-200'}`}
                >
                  <Text className={`text-[11.5px] font-manrope-bold tracking-wide ${isSlotSelected(slot) ? 'text-[#4A43EC]' : 'text-[#111827]'}`}>
                    {slot}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Number of Visitors */}
          <View className="bg-[#F8F9FB] rounded-[18px] p-4 flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-[13px] font-manrope-bold text-[#111827] mb-0.5">Number of Visitors</Text>
              <Text className="text-[11px] font-manrope text-[#9CA3AF]">Including children</Text>
            </View>
            <View className="flex-row items-center bg-white border border-gray-200 rounded-full p-[2px]">
              <Pressable
                onPress={() => setVisitors(Math.max(1, visitors - 1))}
                className="w-7 h-7 items-center justify-center rounded-full border border-gray-200 bg-white"
              >
                <Feather name="minus" size={13} color={visitors > 1 ? "#4A43EC" : "#D1D5DB"} />
              </Pressable>
              <Text className="text-[13px] font-manrope-bold text-[#111827] w-7 text-center">{visitors}</Text>
              <Pressable
                onPress={() => setVisitors(visitors + 1)}
                className="w-7 h-7 bg-[#4A43EC] rounded-full items-center justify-center"
              >
                <Feather name="plus" size={13} color="white" />
              </Pressable>
            </View>
          </View>


          {/* Notes */}
          <View className="mb-4">
            <Text className="text-[13px] font-manrope-bold text-[#4B5563] mb-3">Notes / Special Requests</Text>
            <View className="bg-[#F8F9FB] rounded-[14px] p-3.5">
              <TextInput
                multiline
                numberOfLines={3}
                placeholder="e.g. Would like to see the penthouse floor, coming with senior citizens..."
                placeholderTextColor="#9CA3AF"
                className="text-[13px] font-manrope text-[#111827] h-16"
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 150);
                }}
              />
            </View>
          </View>
          <Pressable
            onPress={handleConfirmVisit}
            disabled={creating}
            className={`rounded-[16px] py-[15px] flex-row items-center justify-center mt-2 mb-2 ${creating ? 'bg-gray-400' : 'bg-[#4A43EC]'}`}
          >
            {creating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text className="text-white font-manrope-bold text-[15px] mr-2">
                  Confirm Site Visit
                </Text>
                <Feather name="arrow-right" size={16} color="white" />
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
