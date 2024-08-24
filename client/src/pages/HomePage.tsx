import illustration from "@/assets/illustration.svg";
import FormComponent from "@/components/forms/FormComponent";
// import Footer from "@/components/common/Footer";

function HomePage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-16 relative">
            <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400 opacity-70"></div>
            <div className="my-12 flex h-full min-w-full flex-col items-center justify-evenly sm:flex-row sm:pt-0">
                <div className="flex w-full animate-up-down justify-center sm:w-1/2 sm:pl-4">
                    <img
                        src={illustration}
                        alt="333SyncLab Illustration"
                        className="mx-auto w-[250px] sm:w-[400px]"
                    />
                </div>
                <div className="flex w-full items-center justify-center sm:w-1/2">
                    <FormComponent />
                </div>
            </div>
            {/* <Footer /> */}
        </div>
    );
}

export default HomePage;
