import OnboardingScreen from "../../components/OnboardingScreen";

export default function Onboarding2() {
    return (
        <OnboardingScreen
            image={require("../../assets/images/onboarding/onboarding2.png")}
            activeIndex={1}
            nextHref="/onboarding3"
        />
    );
}
