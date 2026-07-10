import { useEffect, useRef, useState } from "react";
import { Alert, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { openFilter, setFilterLocation } from "../../store/slices/filterSlice";

const DEFAULT_COORDINATE = { latitude: 22.7196, longitude: 75.8577 };

const formatAddress = (place) => [
  place?.name,
  place?.street,
  place?.district,
  place?.city,
  place?.region,
  place?.postalCode,
].filter(Boolean).filter((value, index, all) => all.indexOf(value) === index).join(", ");

export default function LocationPicker() {
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  const savedCoordinates = useSelector((state) => state.location.coordinates);
  const [coordinate, setCoordinate] = useState(savedCoordinates || DEFAULT_COORDINATE);
  const [address, setAddressLabel] = useState("Move the map or tap to choose a location");

  useEffect(() => {
    let active = true;
    Location.reverseGeocodeAsync(coordinate)
      .then((places) => {
        if (active) setAddressLabel(formatAddress(places?.[0]) || `${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`);
      })
      .catch(() => {
        if (active) setAddressLabel(`${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`);
      });
    return () => { active = false; };
  }, [coordinate]);

  const chooseCoordinate = (coords) => {
    setCoordinate(coords);
    setAddressLabel("Finding address...");
  };

  const useCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Location permission needed", "Allow location access to center the map on your position.");
      return;
    }
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
    chooseCoordinate(coords);
    mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.015, longitudeDelta: 0.015 }, 500);
  };

  const selectAddress = () => {
    dispatch(setFilterLocation({ address, coordinates: coordinate }));
    dispatch(openFilter());
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={{ ...coordinate, latitudeDelta: 0.04, longitudeDelta: 0.04 }}
        onPress={(event) => chooseCoordinate(event.nativeEvent.coordinate)}
        onLongPress={(event) => chooseCoordinate(event.nativeEvent.coordinate)}
      >
        <Marker coordinate={coordinate} draggable onDragEnd={(event) => chooseCoordinate(event.nativeEvent.coordinate)} />
      </MapView>

      <View style={{ position: "absolute", top: 48, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 5 }}>
          <Ionicons name="chevron-back" size={23} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity onPress={useCurrentLocation} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", elevation: 5 }}>
          <MaterialCommunityIcons name="crosshairs-gps" size={23} color="#4A43EC" />
        </TouchableOpacity>
      </View>

      <View style={{ position: "absolute", left: 16, right: 16, bottom: 24, backgroundColor: "#fff", borderRadius: 20, padding: 16, elevation: 8 }}>
        <Text style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>SELECTED LOCATION</Text>
        <Text style={{ fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 14 }} numberOfLines={2}>{address}</Text>
        <TouchableOpacity disabled={address === "Finding address..."} onPress={selectAddress} style={{ height: 50, borderRadius: 14, backgroundColor: "#4A43EC", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Select this address</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
