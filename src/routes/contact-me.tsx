import { Container } from "@/components/container";
import { Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { HoverBorderGradient } from "@/components/hover-border-gradient";

const AboutPage = () => {
  const email = "diwank66mehra@gmail.com";

  return (
    <div className="min-h-screen  text-foreground pt-16">
      {/* Grid background */}
      <div
        className={cn(
          "fixed inset-0 -z-10",
          "w-full min-h-screen",
          "[background-size:70px_70px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_0.5px,transparent_0.5px),linear-gradient(to_bottom,#e4e4e7_0.5px,transparent_0.5px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_0.5px,transparent_0.5px),linear-gradient(to_bottom,#262626_0.5px,transparent_0.5px)]"
        )}
      />

      {/* Radial fade overlay */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-white dark:bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black)]" />

      <Container className="max-w-3xl mx-auto space-y-16 px-4 sm:px-6 lg:px-8">
        {/* Video Section */}
        <div className="rounded-3xl overflow-hidden shadow-2xl">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-auto rounded-xl opacity-90"
            src="/assets/img/video/ai.mp4"
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Content Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            About This Website
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            This platform empowers users to prepare for interviews, customize mock sessions, and gather actionable feedback for continuous growth.
            Whether you're starting out or sharpening your skills, our tools are designed to support your journey toward success.
          </p>
        </div>

        {/* Email Button */}
        <div className="flex justify-center">
  <HoverBorderGradient className="inline-flex items-center justify-center">
    <a
      href={`mailto:${email}`}
      className="inline-flex items-center gap-2 text-white  text-base font-medium px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
    >
      <Mail size={20} />
      Email Me
    </a>
  </HoverBorderGradient>
</div>
      </Container>
    </div>
  );
};

export default AboutPage;
