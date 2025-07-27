import { Sparkles } from "lucide-react";
import Marquee from "react-fast-marquee";
import { Container } from "@/components/container";
import { Link } from "react-router-dom";
import { HoverBorderGradient } from "@/components/hover-border-gradient";

const HomePage = () => {
  return (
    <div className="w-full bg-background text-foreground  pt-10 ">
      <Container className=" space-y-7">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Image */}
          <img
            src="/assets/img/aibot.png"
            alt="aibot"
            className="md:max-w-[35rem] lg:max-h-[35rem]  object-cover  hover:scale-105 transition-transform duration-300"
          />

          {/* Text */}
          <div className="flex flex-col items-center justify-center text-center space-y-8 lg:w-1/2">
  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
    Boost Your Confidence with{" "}
    <span className="bg-gradient-to-r from-blue-500 to-blue-900 bg-clip-text text-transparent">
      MOCK-MATE
    </span>
  </h1>

  <p className="text-muted-foreground text-lg md:text-xl max-w-xl leading-relaxed">
    Say goodbye to uncertainty. Practice smarter with AI-driven mock interviews,
    improve your answers, and walk into your next interview fully prepared and confident.
  </p>

  <HoverBorderGradient>
    <Link to="/generate" className="w-full p-1 flex justify-center items-center font-semibold">
      Get Started <Sparkles className="ml-2 h-5 w-5" />
    </Link>
  </HoverBorderGradient>
</div>

        </div>

        {/* Marquee Section */}
        <div className="w-full border-t border-border rounded-xl shadow-inner bg-gradient-to-r from-white via-slate-50 to-white dark:bg-none dark:bg-slate-200 py-4">
      <Marquee pauseOnHover gradient={false} speed={100}>
       {[
      { src: "google.png", alt: "Google" },
      { src: "zoom.png", alt: "Zoom" },
      { src: "amazon.png", alt: "Amazon" },
      { src: "microsoft.png", alt: "Microsoft" },
      { src: "apple.png", alt: "Apple" },
      { src: "meta.png", alt: "Meta" },
      { src: "netflix.png", alt: "Netflix" },
      ].map((img, index) => (
        <div
         key={index}
        className="mx-10 my-10 transition-transform hover:scale-110 duration-300"
      >
        <img
          src={`/assets/img/logo/${img.src}`}
          alt={img.alt}
          className="h-12 w-auto object-contain"
        />
      </div>
    ))}
  </Marquee>
</div>

      </Container>
       <footer className=" bg-base-100   text-gray-500 overflow-hidden text-center py-12 w-full mt-14 backdrop-blur-lg bg-base-100/80 border-black dark:border-white  border-[0.4px] shadow-2xl ">
      <div className="max-w-4xl mx-auto px-4">
        <p className="text-sm mb-2">
          Developed by <span className="font-bold text-indigo-400">Diwank Singh</span> | All Rights Reserved
        </p>
        <p className="text-sm text-gray-300">Thank you for visiting!</p>
        <div className="mt-6">
          <hr className="border-gray-600 mb-4" />
          <a
            href="#top"
            className="text-indigo-400 hover:text-indigo-200 transition-colors duration-300 text-sm"
          >
            Back to top
          </a>
        </div>
      </div>
    </footer>
    </div>
    
    
  );
};

export default HomePage;
