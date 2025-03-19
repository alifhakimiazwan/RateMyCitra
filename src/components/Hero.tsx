import { auth } from "@clerk/nextjs/server";

import Header from "./Header";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function Hero() {
  const { userId } = await auth();
  const isAuth = !!userId;
  return (
    <div className="px-7">
      {" "}
      <Header />
      {/* Hero */}
      <div className="relative overflow-hidden py-18 lg:py-15 lg:pl-20 md:px-5">
        {/* Gradients */}
        <div
          aria-hidden="true"
          className="flex absolute -top-96 start-1/2 transform -translate-x-1/2"
        >
          <div className="bg-gradient-to-r from-background/50 to-background blur-3xl w-[25rem] h-[44rem] rotate-[-60deg] transform -translate-x-[10rem]" />
          <div className="bg-gradient-to-tl blur-3xl w-[90rem] h-[50rem] rounded-full origin-top-left -rotate-12 -translate-x-[15rem] from-primary-foreground via-primary-foreground to-background" />
        </div>
        {/* End Gradients */}
        <div className="relative z-10">
          <div className="container py-4 lg:py-16">
            <div className="max-w-2xl text-center mx-auto">
              <p className="">Don't know which citra to pick? Use</p>
              {/* Title */}
              <div className="mt-5 max-w-2xl">
                <h1 className="scroll-m-20 text-4xl font-extrabold font-telegraf tracking-tight lg:text-5xl">
                  RateMyCitra
                </h1>
              </div>
              {/* End Title */}
              <div className="mt-5 max-w-3xl">
                <p className="text-md text-muted-foreground ">
                  Discover the best elective subjects Citra with insights from
                  past students and alumni. Explore ratings, reviews, and
                  feedback to make informed choices for your academic journey.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-center space-x-2">
                <Button className="py-4 px-3">
                  <Link href="/explore" className="flex items-center gap-2">
                    Explore <ArrowRight />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Hero */}
    </div>
  );
}
