import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { AiOutlineMenu } from "react-icons/ai";
import { RiAdminLine, RiHome5Line, RiTeamLine } from "react-icons/ri";

import { useLogout, useUser } from "~/utils/auth";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { MdOutlineHistory } from "react-icons/md";
import { api } from "~/utils/api";
import { FaCalendarAlt, FaUserCircle } from "react-icons/fa";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

export const Navbar = () => {
  const [user] = useUser();
  const userId = user?.id;

  const patientData = api.user.getUserPatientId.useQuery(
    { userId: Number(userId) }, { enabled: !!userId && user.role === "PATIENT", }
  );
  const patientId = patientData?.data?.patientId;

  const router = useRouter();
  const { logout } = useLogout();

  const handleLogout = async () => {
    await logout();
  };

  const navMenu = (
    <>
      <li className={`${router.pathname !== "/" && "text-black"}`}>
        <Link
          href="/"
          className="flex w-full flex-row items-center py-2 leading-[24px] hover:bg-transparent lg:py-0"
        >
          <RiHome5Line className="mr-7 h-6 w-6 lg:hidden " />
          <span className="font-medium lg:text-[18px] lg:font-semibold">
            Home
          </span>
        </Link>
      </li>

      <li className={`${router.pathname !== "/" && "text-black"}`}>
        <Link
          href="/doctor"
          className="mt-2 flex w-full flex-row items-center py-2 leading-[24px] hover:bg-transparent md:mt-0 lg:mt-0 lg:py-0"
        >
          <RiTeamLine className="mr-7 h-6 w-6 lg:hidden " />
          <span className="font-medium lg:text-[18px] lg:font-semibold">
            Doctors
          </span>
        </Link>
      </li>

      {user && user.role === 'PATIENT'
        &&
        <>
          <li className={`${router.pathname !== "/" && "text-black"}`}>
            <Link
              href="/appointments"
              className="mt-2 flex w-full flex-row items-center py-2 leading-[24px] hover:bg-transparent md:mt-0 lg:mt-0 lg:py-0"
            >
              <span className="font-medium lg:text-[18px] lg:font-semibold">
                Appointments
              </span>
            </Link>
          </li>
          <li className={`${router.pathname !== "/" && "text-black"}`}>
            <Link
              href={`/med-records/${patientId}`}
              className="mt-2 flex w-full flex-row items-center py-2 leading-[24px] hover:bg-transparent md:mt-0 lg:mt-0 lg:py-0"
            >
              <span className="font-medium lg:text-[18px] lg:font-semibold">
                History
              </span>
            </Link>
          </li>
        </>
      }

      {user && ["ADMIN", "DOCTOR"].includes(user.role) && (
        <li className={`${router.pathname !== "/" && "text-black"}`}>
          <Link
            href="/admin"
            className="mt-2 flex w-full flex-row items-center py-2 leading-[24px] hover:bg-transparent md:mt-0 lg:mt-0 lg:py-0"
          >
            <RiAdminLine className="mr-7 h-6 w-6 lg:hidden " />
            <span className="font-medium lg:text-[18px] lg:font-semibold">
              Admin
            </span>
          </Link>
        </li>
      )}
    </>
  );

  return (
    <header
      className={`mx-auto w-full py-[10px] lg:py-[18px]
        ${router.pathname === "/"
          ? "absolute z-10 bg-transparent"
          : "bg-white shadow-lg"
        }`}
    >
      <section className="flex items-center px-[18px] text-white lg:justify-between lg:px-[90px]">
        {/* MENUBAR FOR SMALL DEVICE */}

        <div className="absolute lg:hidden">
          <Sheet>
            <SheetTrigger>
              <AiOutlineMenu className="h-7 w-7 text-black" />
            </SheetTrigger>

            <SheetContent className="flex flex-col flex-wrap text-[14px] leading-[20px] text-black">
              <div className="mb-8 flex items-center justify-between">
                <SheetTrigger asChild>
                  <Link href="/">
                    <Image
                      src="/assets/images/logo-for-sidebar.svg"
                      alt="logo"
                      width={134}
                      height={32}
                    />
                  </Link>
                </SheetTrigger>

                {!user ? (
                  <SheetTrigger asChild>
                    <Link href="/login">
                      <Button
                        className="cursor-pointer rounded-[15px] bg-[#0099FF] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF] hover:shadow-lg"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </SheetTrigger>
                ) : (
                  <SheetTrigger asChild>
                    <Button
                      className="cursor-pointer rounded-[15px] bg-[#0099FF] px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF] hover:shadow-lg"
                      onClick={async () => {
                        await handleLogout();
                      }}
                    >
                      Sign Out
                    </Button>
                  </SheetTrigger>
                )}
              </div>

              <ul className="ml-2 text-black">
                <li className={`${router.pathname !== "/" && "text-black"}`}>
                  <SheetTrigger asChild>
                    <Link
                      href="/"
                      className="flex w-full flex-row items-center py-2 leading-[24px] hover:bg-transparent lg:py-0"
                    >
                      <RiHome5Line className="mr-7 h-6 w-6 lg:hidden " />
                      <span className="font-medium lg:text-[18px] lg:font-semibold">
                        Home
                      </span>
                    </Link>
                  </SheetTrigger>
                </li>

                <li className={`${router.pathname !== "/" && "text-black"}`}>
                  <SheetTrigger asChild>
                    <Link
                      href="/doctor"
                      className="mt-2 flex w-full flex-row items-center py-2 leading-[24px] hover:bg-transparent md:mt-0 lg:mt-0 lg:py-0"
                    >
                      <RiTeamLine className="mr-7 h-6 w-6 lg:hidden " />
                      <span className="font-medium lg:text-[18px] lg:font-semibold">
                        Doctors
                      </span>
                    </Link>
                  </SheetTrigger>
                </li>


                {user && user.role === 'PATIENT'
                  &&
                  <>
                    <li className={`${router.pathname !== "/" && "text-black"}`}>
                      <SheetTrigger asChild>
                        <Link
                          href="/appointments"
                          className="mt-2 flex w-full flex-row items-center py-2 leading-[24px] hover:bg-transparent md:mt-0 lg:mt-0 lg:py-0"
                        >
                          <FaCalendarAlt className="mr-7 h-6 w-6 lg:hidden " />
                          <span className="font-medium lg:text-[18px] lg:font-semibold">
                            Appointments
                          </span>
                        </Link>
                      </SheetTrigger>
                    </li>
                    <li className={`${router.pathname !== "/" && "text-black"}`}>
                      <SheetTrigger asChild>
                        <Link
                          href={`/med-records/${patientId}`}
                          className="mt-2 flex w-full flex-row items-center py-2 leading-[24px] hover:bg-transparent md:mt-0 lg:mt-0 lg:py-0"
                        >
                          <MdOutlineHistory className="mr-7 h-6 w-6 lg:hidden " />
                          <span className="font-medium lg:text-[18px] lg:font-semibold">
                            History
                          </span>
                        </Link>
                      </SheetTrigger>
                    </li>
                  </>
                }

                {user && ["ADMIN", "DOCTOR"].includes(user.role) && (
                  <li className={`${router.pathname !== "/" && "text-black"}`}>
                    <SheetTrigger asChild>
                      <Link
                        href="/admin"
                        className="mt-2 flex w-full flex-row items-center py-2 leading-[24px] hover:bg-transparent md:mt-0 lg:mt-0 lg:py-0"
                      >
                        <RiAdminLine className="mr-7 h-6 w-6 lg:hidden " />
                        <span className="font-medium lg:text-[18px] lg:font-semibold">
                          Admin
                        </span>
                      </Link>
                    </SheetTrigger>
                  </li>
                )}
              </ul>

              {/* USER INFO */}
              <div className="absolute bottom-8 w-[90%] border-t-2 px-1.5">
                <h2 className="mb-1.5 mt-4 font-semibold">
                  {user?.name ? user.name : "Guest"}
                </h2>
                <h2>
                  {user?.phone ? user.phone : "No phone number available"}
                </h2>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* LOGO */}
        <div className="mx-auto lg:mx-0">
          {router.pathname === "/" ? (
            <Image
              src="/assets/images/logo-long.png"
              alt="logo"
              width={150}
              height={50}
            />
          ) : (
            <Link href="/">
              <Image
                src="/assets/images/logo-for-sidebar.svg"
                alt="logo"
                width={150}
                height={50}
              />
            </Link>
          )}
        </div>

        {/* MENUBAR FOR LARGE DEVICE */}
        <ul className="hidden items-center justify-between gap-9 lg:flex">
          {navMenu}

          <li>
            {!user ? (
              <Link href="/login">
                <button
                  className={`hidden cursor-pointer rounded-[15px] border px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF] hover:shadow-lg lg:block 
                                    ${router.pathname === "/"
                      ? "border-white bg-transparent"
                      : "border-[#0099FF] bg-[#0099FF]"
                    }`}
                >
                  Sign Up
                </button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className={`hidden px-0 py-0 h-fit hover:shadow-lg lg:block 
                  ${router.pathname === "/"
                        ? "text-white bg-transparent"
                        : "text-[#0099FF] bg-white"
                      }`}
                  ><FaUserCircle className="w-7 h-7" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72 py-7 mr-5">
                  <div className="flex justify-center items-center gap-1">
                    <div className="w-16">
                      {user.image ?
                        <Image
                          alt="user-image"
                          src={user?.image}
                          width={400}
                          height={400}
                        />
                        :
                        <Image
                          alt="user-image"
                          src="/assets/images/avatar-patient-other.png"
                          width={400}
                          height={400}
                        />
                      }
                    </div>
                    <div>
                      <DropdownMenuLabel className="text-[18px]">
                        {user?.name ? user.name : "Guest"}
                      </DropdownMenuLabel>
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          {user?.phone ? user.phone : "No phone number available"}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </div>
                  </div>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="focus:bg-transparent flex justify-center">
                    <button
                      className={`hidden cursor-pointer rounded-[15px] border px-[16px] py-[6px] text-[15px] font-bold leading-[30px] text-[#FFF] bg-[#0099FF] lg:block`}
                      onClick={handleLogout}
                    >
                      Sign Out
                    </button>
                  </DropdownMenuItem>

                </DropdownMenuContent>
              </DropdownMenu>

            )}
          </li>
        </ul>
      </section>
    </header>
  );
};
