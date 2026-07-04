import OnboardingScreen from "../../components/OnboardingScreen";

export default function Onboarding1() {
    return (
        <OnboardingScreen
            image={require("../../assets/images/onboarding/onboarding1.png")}
            activeIndex={0}
            nextHref="/onboarding2"
        />
    );
}
