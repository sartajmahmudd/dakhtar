import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import { Footer } from "~/components/footer/Footer";
import { Button } from "~/components/ui/button";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Home - Dakthar.com</title>
        <meta name="Dakthar.com" content="We are here to help." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col">
        <section className="flex-grow">
          {/* HERO SECTION */}
          <section className="bg-primary isolate overflow-x-hidden overflow-y-hidden">
            <Image
              priority
              src="/assets/svg/mobile-banner-shadow-1.svg"
              alt="corner"
              width={1000}
              height={2000}
              className="absolute -z-10 w-[180px] lg:w-[360px]"
            />
            <Image
              priority
              src="/assets/svg/mobile-banner-shadow-2.svg"
              alt="corner"
              width={1000}
              height={2000}
              className="absolute right-0 -z-10 mt-[342px] w-[350px] max-w-fit lg:hidden"
            />

            <div className="mx-auto max-w-[1240px]">
              <div className="flex items-center pb-[70px] text-white lg:pb-[10px]">
                <div className="ml-[20px] mt-[78px] lg:ml-[90px] lg:mt-[40px]">
                  {/* Heading Title */}
                  <h2 className="text-[32px] font-[700] leading-[45px] -tracking-[3%] lg:text-[42px] lg:leading-[58px]">
                    Patients Can Make Appointments on Their Phone Easily
                  </h2>
                  <ul className="mx-[18px] list-outside list-disc pb-8 pt-6 text-[16px] leading-[25.6px] tracking-[-3%] lg:mx-[20px] ">
                    <li>
                      Save time and money by allowing your patients to make
                      their own appointments
                    </li>
                    <li>Patients can pay online and get SMS reminders</li>
                    <li>
                      You spend more time seeing patients and less time
                      arranging appointments
                    </li>
                  </ul>

                  {/* Buttons */}
                  <div className="ml-6 flex items-center gap-[10px] lg:ml-0 lg:gap-[18px]">
                    <Button className="h-11 cursor-pointer rounded-[15px] border-[2px] border-white/30 bg-white px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#0099FF] hover:shadow-lg ">
                      <a
                        href="https://forms.gle/G8QNBqVpzTp4ptvVA"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Schedule a Demo
                      </a>
                    </Button>

                    <Button className="h-11 cursor-pointer rounded-[15px] border-[2px] border-white/30 bg-transparent px-[16px] py-[6px] text-[15px] font-bold leading-[30px] hover:shadow-lg">
                      <a href="tel:+8801835443436">Contact Sales</a>
                    </Button>
                  </div>
                </div>

                {/* Right Banner */}
                <div className="hidden pt-[120px] md:block">
                  <Image
                    src="/assets/images/hero_img.png"
                    alt="hero_image"
                    width={829}
                    height={584}
                    className="-mr-[156px] max-w-[829px]"
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            {/* Mobile View Banner */}
            <div className="relative -mb-[80px] -mt-[42px] flex justify-center md:hidden lg:hidden">
              <Image
                src="/assets/images/hero_img_phn.png"
                alt="hero_image"
                width={205.79}
                height={395.83}
              />
            </div>
          </section>

          {/* TESTIMONIAL SECTION */}
          <section className="bg-white pb-[44px] pt-[100px] text-black">
            <div className="mx-auto max-w-[1240px] pl-[20px] lg:pl-[120px]">
              <h2 className="mb-[56px] w-full text-[32px] font-[700] -tracking-[3%] lg:w-2/5 lg:text-[42px]">
                Our Happy Clients Says About Us
              </h2>

              {/* Carousel */}
              <div className="flex flex-col items-center gap-10 md:flex-row md:gap-[101px] lg:w-[1091px]">
                <Image
                  src="/assets/images/testimonial.png"
                  alt="testimonial"
                  width={321}
                  height={405}
                  className="-ml-[26px] -mt-5 w-[227px] lg:-ml-0 lg:mb-12 lg:w-[321px]"
                />
                <div className="flex h-[187px] w-[319.38px] flex-col lg:h-[304px] lg:w-[567px]">
                  <Image
                    src="/assets/images/quote.png"
                    alt="quote"
                    width={51}
                    height={38}
                    className="-ml-[20px] mb-[25px] mt-[6px] w-[33px] lg:-ml-0 lg:w-[51px]"
                  />
                  <h2 className="mb-[24px] ml-2 h-[57px] w-[319px] text-[16px] font-bold lg:mb-[36px] lg:ml-10 lg:h-[87px] lg:w-[513px] lg:px-[10px] lg:text-[24px]">
                    “They are able to help doctor practice like mine scale and
                    are very responsive to all our unique needs”
                  </h2>
                  <h3 className="mb-[8px] ml-2 text-[18px] font-bold lg:mb-[12px] lg:ml-12">
                    — Dr. Ziauddin Mohammad
                  </h3>
                  <p className="ml-2 text-[16px] text-[#757B8A] lg:ml-12">
                    National Hospital Chittagong
                  </p>

                  {/* Carousel Dots */}
                  <div className="-ml-52 mt-[20px] flex items-center justify-center gap-[12px] md:justify-start lg:ml-12 lg:mt-[46px]">
                    <div className="aspect-square w-[13px] rounded-full bg-[#243d31]"></div>
                    <div className="aspect-square w-[13px] rounded-full bg-[#d6dfdb]"></div>
                    <div className="aspect-square w-[13px] rounded-full bg-[#d6dfdb]"></div>
                    <div className="aspect-square w-[13px] rounded-full bg-[#d6dfdb]"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>

        <section className="mx-[20px] mt-12 lg:mx-[90px]">
          <Footer />
        </section>
      </main>
    </>
  );
};

export default Home;
