import { useState, useRef } from "react";
import { View, Text, Pressable, ScrollView, Image, TextInput, Platform, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useSelector } from "react-redux";
import { TIME_SLOTS } from "../../data/visits";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { useRouter } from "expo-router";

export default function BookSiteVisit() {
  const router = useRouter();
  const bookedSiteVisits = useSelector((state) => state.properties.bookedSiteVisits);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [calendarMonth, setCalendarMonth] = useState(new Date().toISOString().split('T')[0]);
  const scrollViewRef = useRef(null);
  const [selectedTime, setSelectedTime] = useState("10:30 AM");
  const [visitors, setVisitors] = useState(2);
  const [notes, setNotes] = useState("");
  const insets = useSafeAreaInsets();

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
          {bookedSiteVisits.map((visit) => {
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
                  <Pressable className="flex-row items-center mt-0.5">
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
                  onPress={() => setSelectedTime(slot)}
                  className={`flex-1 items-center justify-center py-2.5 rounded-xl border ${selectedTime === slot ? 'bg-[#F2EFFF] border-[#B2A7FF]' : 'bg-white border-gray-200'}`}
                >
                  <Text className={`text-[11.5px] font-manrope-bold tracking-wide ${selectedTime === slot ? 'text-[#4A43EC]' : 'text-[#111827]'}`}>
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
                  onPress={() => setSelectedTime(slot)}
                  className={`flex-1 items-center justify-center py-2.5 rounded-xl border ${selectedTime === slot ? 'bg-[#F2EFFF] border-[#B2A7FF]' : 'bg-white border-gray-200'}`}
                >
                  <Text className={`text-[11.5px] font-manrope-bold tracking-wide ${selectedTime === slot ? 'text-[#4A43EC]' : 'text-[#111827]'}`}>
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
            onPress={() => {
              // handle submit
              router.push({
                pathname: '/(screens)/booking-status',
                params: { date: selectedDate, time: selectedTime }
              });
            }}
            className="bg-[#4A43EC] rounded-[16px] py-[15px] flex-row items-center justify-center mt-2 mb-2"
          >
            <Text className="text-white font-manrope-bold text-[15px] mr-2">
              Confirm Site Visit
            </Text>
            <Feather name="arrow-right" size={16} color="white" />
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
