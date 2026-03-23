/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        // Lato
        "lato-thin": ["Lato_100Thin"],
        "lato-thin-italic": ["Lato_100Thin_Italic"],
        "lato-light": ["Lato_300Light"],
        "lato-light-italic": ["Lato_300Light_Italic"],
        "lato-regular": ["Lato_400Regular"],
        "lato-italic": ["Lato_400Regular_Italic"],
        "lato-bold": ["Lato_700Bold"],
        "lato-bold-italic": ["Lato_700Bold_Italic"],
        "lato-black": ["Lato_900Black"],
        "lato-black-italic": ["Lato_900Black_Italic"],
        // Inter
        "inter-thin": ["Inter_100Thin"],
        "inter-thin-italic": ["Inter_100Thin_Italic"],
        "inter-extralight": ["Inter_200ExtraLight"],
        "inter-extralight-italic": ["Inter_200ExtraLight_Italic"],
        "inter-light": ["Inter_300Light"],
        "inter-light-italic": ["Inter_300Light_Italic"],
        "inter-regular": ["Inter_400Regular"],
        "inter-italic": ["Inter_400Regular_Italic"],
        "inter-medium": ["Inter_500Medium"],
        "inter-medium-italic": ["Inter_500Medium_Italic"],
        "inter-semibold": ["Inter_600SemiBold"],
        "inter-semibold-italic": ["Inter_600SemiBold_Italic"],
        "inter-bold": ["Inter_700Bold"],
        "inter-bold-italic": ["Inter_700Bold_Italic"],
        "inter-extrabold": ["Inter_800ExtraBold"],
        "inter-extrabold-italic": ["Inter_800ExtraBold_Italic"],
        "inter-black": ["Inter_900Black"],
        "inter-black-italic": ["Inter_900Black_Italic"],
        // Manrope
        "manrope-extralight": ["Manrope_200ExtraLight"],
        "manrope-light": ["Manrope_300Light"],
        "manrope-regular": ["Manrope_400Regular"],
        "manrope-medium": ["Manrope_500Medium"],
        "manrope-semibold": ["Manrope_600SemiBold"],
        "manrope-bold": ["Manrope_700Bold"],
        "manrope-extrabold": ["Manrope_800ExtraBold"],
      },
    },
  },
  plugins: [],
}