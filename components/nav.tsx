"use client";

import { Button, colors } from "@nextui-org/react";
import { AnimatePresence, motion } from "framer-motion";
import useMenuStatesContext from "@/lib/hooks/use-menu-states-context";
import {
  BounceLoader,
  ClockLoader,
  PuffLoader,
  PulseLoader,
} from "react-spinners";
import Icon from "./icon";
import { useEffect, useState } from "react";
import PasswordScreen from "./modals/password-modal";
import { useTheme } from "next-themes";
import NavMenu from "./nav-menu";

export default function Nav({ children }: { children: React.ReactNode }) {
  const { menuStates } = useMenuStatesContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPasswordScreenOpen, setIsPasswordScreenOpen] = useState(false);

  const { theme, setTheme } = useTheme();

  // Open PasswordScreen if password is set
  useEffect(() => {
    if (
      menuStates?.settings?.isUsePassword &&
      !menuStates?.settings?.password
    ) {
      setIsPasswordScreenOpen(true);
    }
  }, [menuStates]);

  return (
    <div className="flex h-screen w-full flex-col overflow-x-hidden">
      <PasswordScreen
        isOpen={isPasswordScreenOpen}
        setIsOpen={setIsPasswordScreenOpen}
      />

      <div className="fixed z-40 h-12 w-full">
        <div
          className={
            "grid h-12 w-full grid-cols-3 grid-rows-1 bg-default px-2 py-1 text-default-foreground"
          }
        >
          <div className="col-start-1">
            <Button
              isIconOnly
              onPress={() => {
                setIsMenuOpen(!isMenuOpen);
              }}
              disableRipple
              variant="light"
            >
              {isMenuOpen ? (
                <Icon name="close" variant="round" />
              ) : (
                <Icon name="menu" variant="round" />
              )}
            </Button>
          </div>
          <div className="col-start-2">
            <AnimatePresence>
              {menuStates?.isRecording && (
                <motion.div
                  initial={{ y: -56 }}
                  animate={{ y: 0 }}
                  exit={{ y: -56 }}
                  transition={{ duration: 0.1 }}
                  className="flex h-full w-full items-center justify-center"
                >
                  <div className="flex h-10 w-40 items-center rounded-full bg-content2 px-4">
                    <div className="flex w-12 items-center justify-center">
                      {menuStates?.isListening ? (
                        <BounceLoader color={colors.red["300"]} size={24} />
                      ) : menuStates?.isThinking ? (
                        <PulseLoader color={colors.blue["300"]} size={8} />
                      ) : menuStates?.isSpeaking ? (
                        <PuffLoader color={colors.green["300"]} size={24} />
                      ) : (
                        <ClockLoader
                          className="!shadow-[0px_0px_0px_2px_inset] !shadow-content2-foreground [&>span]:!bg-content2-foreground"
                          size={24}
                        />
                      )}
                    </div>
                    <p className="w-full text-center text-xl text-content2-foreground">
                      {menuStates?.isListening
                        ? "Listening"
                        : menuStates?.isThinking
                          ? "Thinking"
                          : menuStates.isSpeaking
                            ? "Speaking"
                            : "Waiting"}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="col-start-3 flex justify-end">
            <Button
              // Disable on hover background
              className="data-[hover=true]:bg-transparent"
              isIconOnly
              disableRipple
              variant="light"
              onPress={() => {
                setTheme(theme === "dark" ? "light" : "dark");
              }}
            >
              {theme === "dark" ? (
                <Icon name="dark_mode" variant="round" />
              ) : (
                <Icon name="light_mode" variant="round" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-full w-full overflow-hidden pt-[48px]">
        <NavMenu isMenuOpen={isMenuOpen} />

        <div className="min-w-0 flex-grow">{children}</div>
      </div>
    </div>
  );
}
