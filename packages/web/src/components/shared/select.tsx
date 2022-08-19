/* This example requires Tailwind CSS v2.0+ */
import { Fragment } from "react";
import { useTheme } from "@/hooks/theme";
import { Flex, useColorModeValue } from "@chakra-ui/react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, SelectorIcon } from "@heroicons/react/solid";

export function Select({
  value,
  onChange,
  items,
  placeholder,
}: {
  placeholder: string;
  value: string;
  items: string[];
  onChange: (string: string) => void;
}) {
  const {
    jumpGradient,
    gradientBackground,
    darkPurple,
    glassyWhite,
    glassyWhiteOpaque,
  } = useTheme();

  return (
    <Listbox
      value={value}
      onChange={(newValue) => onChange(newValue === value ? "" : newValue)}
    >
      {({ open }) => (
        <>
          <div className="mt-1 relative">
            <Listbox.Button>
              <Flex
                bg={jumpGradient}
                className="p-[2px] rounded-[17px] min-w-[159px]"
              >
                <Flex
                  bg={useColorModeValue(gradientBackground, "#21002F")}
                  className="cursor-pointer w-full items-center justify-between min-w-[110px] p-[12px] h-[60px] rounded-[15px]"
                >
                  <span className="first-letter:uppercase truncate pl-[15px] pr-[30px] text-[16px]">
                    {value || placeholder}
                  </span>

                  <SelectorIcon className="h-[18px]" />
                </Flex>
              </Flex>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="cursor-pointer shadow-lg cursor-pointer">
                <Flex
                  bg={jumpGradient}
                  className="absolute z-10 mt-1 w-full max-h-60 overflow-auto focus:outline-none cursor-pointer shadow-lg p-[2px] rounded-[17px] overflow-hidden"
                >
                  <Flex
                    className="flex-col w-full rounded-[15px] overflow-hidden"
                    bg={useColorModeValue(gradientBackground, "#21002F")}
                  >
                    {items.map((item) => (
                      <Listbox.Option
                        key={"select-option-" + item}
                        value={item}
                        className="cursor-pointer overflow-hidden"
                      >
                        {({ selected }) => (
                          <Flex
                            _hover={{
                              bg: useColorModeValue(darkPurple, "white"),
                              color: useColorModeValue("white", "black"),
                            }}
                            className="cursor-default select-none relative py-2 pl-3 pr-9 cursor-pointer"
                          >
                            <Flex className="block truncate first-letter:uppercase cursor-pointer">
                              {item}
                            </Flex>

                            {selected ? (
                              <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                                <CheckIcon
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                />
                              </span>
                            ) : null}
                          </Flex>
                        )}
                      </Listbox.Option>
                    ))}
                  </Flex>
                </Flex>
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
