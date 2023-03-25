import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import Image from 'next/image'
import { Fragment } from 'react'
import { useState } from 'react'
import { HiUserGroup } from 'react-icons/hi'

export default function Lobby() {
  const [open, setOpen] = useState(false)
  const [isShowing, setIsShowing] = useState(false)

  return (
    <>
      <div className="flex items-center justify-end absolute right-0 top-[40%] z-10">
        <button
          type="button"
          className="rounded-md fixed text-white hover:text-white bg-[#512da8] flex items-center justify-center w-16 h-16"
          onClick={() => setOpen(true)}
          title="Voice Lobbies"
        >
          <HiUserGroup size={25} className="animate-bounce" />
        </button>
      </div>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-[#512da8] bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-in-out duration-500"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in-out duration-500"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 sm:-ml-10 sm:pr-4">
                        <button
                          type="button"
                          className="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                          onClick={() => setOpen(false)}
                        >
                          <span className="sr-only">Close panel</span>
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </Transition.Child>
                    <div className="flex h-screen flex-col overflow-y-scroll sidebarMain py-6 shadow-xl">
                      <div className="">
                        <div className="text-center font-medium mt-5 tracking-widest text-xl">
                          Voice Lobbies
                        </div>
                        <div className="flex flex-col gap-5 mt-10 w-full">
                          <div className="lobbyBg w-full h-40 rounded-md">
                            <div className="flex items-center justify-center gap-5 mt-2 cursor-pointer">
                              <div
                                className="text-center text-sm"
                                title="Joe Cllas"
                              >
                                <Image
                                  src="/user.png"
                                  className="rounded-full"
                                  width={50}
                                  height={50}
                                  alt="User Name"
                                />
                                <div className="text-md font-medium tracking-wider">
                                  Joe Cllas
                                </div>
                              </div>
                              <div
                                className="text-center text-sm"
                                title="Erica Jenneys"
                              >
                                <Image
                                  src="/user.png"
                                  className="rounded-full"
                                  width={50}
                                  height={50}
                                  alt="User Name"
                                />
                                <div className="text-md font-medium tracking-wider">
                                  Erica Jenneys
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-center mt-5">
                              <button className="button">Join Room</button>
                            </div>
                          </div>
                          <div className="lobbyBg w-full h-40 rounded-md">
                            <div className="flex items-center justify-center gap-5 mt-2 cursor-pointer">
                              <div
                                className="text-center text-sm"
                                title="Walter White"
                              >
                                <Image
                                  src="/user.png"
                                  className="rounded-full"
                                  width={50}
                                  height={50}
                                  alt="User Name"
                                />
                                <div className="text-md font-medium tracking-wider">
                                  Walter White
                                </div>
                              </div>
                              <div
                                className="text-center text-sm"
                                title="Big Bonny"
                              >
                                <Image
                                  src="/user.png"
                                  className="rounded-full"
                                  width={50}
                                  height={50}
                                  alt="User Name"
                                />
                                <div className="text-md font-medium tracking-wider">
                                  Big Bonny
                                </div>
                              </div>
                              <div
                                className="text-center text-sm"
                                title="RuskiBoy21"
                              >
                                <Image
                                  src="/user.png"
                                  className="rounded-full"
                                  width={50}
                                  height={50}
                                  alt="User Name"
                                />
                                <div className="text-md font-medium tracking-wider">
                                  RuskiBoy21
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-center mt-5">
                              <button className="button">Join Room</button>
                            </div>
                          </div>
                          <div className="lobbyBg w-full h-40 rounded-md">
                            <div className="flex items-center justify-center gap-5 mt-2 cursor-pointer">
                              <div
                                className="text-center text-sm"
                                title="Hitler.2"
                              >
                                <Image
                                  src="/user.png"
                                  className="rounded-full"
                                  width={50}
                                  height={50}
                                  alt="User Name"
                                />
                                <div className="text-md font-medium tracking-wider">
                                  Hitler.2
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-center mt-5">
                              <button className="button ">Join Room</button>
                            </div>
                          </div>
                          <div className="lobbyBg w-full h-40 rounded-md">
                            <div className="flex items-center justify-center gap-5 mt-2 cursor-pointer">
                              <div
                                className="text-center text-sm"
                                title="Admin"
                              >
                                <Image
                                  src="/user.png"
                                  className="rounded-full"
                                  width={50}
                                  height={50}
                                  alt="User Name"
                                />
                                <div className="text-md font-medium tracking-wider">
                                  Admin
                                </div>
                              </div>
                              <div
                                className="text-center text-sm"
                                title="Xxgirl"
                              >
                                <Image
                                  src="/user.png"
                                  className="rounded-full"
                                  width={50}
                                  height={50}
                                  alt="User Name"
                                />
                                <div className="text-md font-medium tracking-wider">
                                  Xxgirl
                                </div>
                              </div>
                              <div
                                className="text-center text-sm"
                                title="Henry"
                              >
                                <Image
                                  src="/user.png"
                                  className="rounded-full"
                                  width={50}
                                  height={50}
                                  alt="User Name"
                                />
                                <div className="text-md font-medium tracking-wider">
                                  Henry
                                </div>
                              </div>
                              <div className="text-center text-sm" title="Meoo">
                                <Image
                                  src="/user.png"
                                  className="rounded-full"
                                  width={50}
                                  height={50}
                                  alt="User Name"
                                />
                                <div className="text-md font-medium tracking-wider">
                                  Meoo
                                </div>
                              </div>
                            </div>
                            <div
                              className="flex items-center justify-center mt-5"
                              title="Room is full !"
                            >
                              <button className="button cursor-not-allowed">
                                Join Room
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
