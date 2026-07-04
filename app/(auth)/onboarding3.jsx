import OnboardingScreen from "../../components/OnboardingScreen";

export default function Onboarding3() {
    return (
        <OnboardingScreen
            image={require("../../assets/images/onboarding/onboarding3.png")}
            activeIndex={2}
            nextHref="/login"
        />
    );
}
