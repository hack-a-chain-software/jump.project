import { JumpBigWhite } from "@/assets/svg";
import { twMerge } from "tailwind-merge";
import { Tutorial, TutorialItemInterface } from "@/components";
import isEmpty from "lodash/isEmpty";
import { ReactNode } from "react";

type Props = {
  maxW?: string;
  gradientText: string;
  bigText: string;
  bottomDescription: string;
  renderAsset?: JSX.Element;
  content?: JSX.Element;
  jumpLogo?: boolean;
  transparent?: boolean;
  children?: ReactNode;
  onClick?: () => void;
  stepItems?: TutorialItemInterface[];
};

export const TopCard = ({
  gradientText,
  bigText,
  bottomDescription,
  jumpLogo = false,
  content = <></>,
  maxW = "",
  children,
  stepItems,
  transparent,
}: Props) => {
  return (
    <div className={twMerge("launchpad top-card flex", maxW)}>
      <div
        className={`overflow-hidden
                      flex
                      flex-wrap
                      align-middle
                      justify-between
                      w-full
                      color-white
                      font-extrabold
                      ${
                        transparent
                          ? "pt-8 pb-3.5"
                          : "bg-white-600 px-6 py-7 pb-16"
                      }
                      h-full
                      rounded-lg
                      gap-1.5
                      relative`}
      >
        {!isEmpty(stepItems) && (
          <Tutorial
            items={stepItems || []}
            className={transparent ? "top-2.5 right-0" : undefined}
          />
        )}

        <div
          className={`flex flex-col relative flex-grow z-20 ${
            transparent ? "gap-y-4" : "gap-y-4"
          }`}
        >
          <p
            className={`text-base leading-4 mb-0.5 ${
              transparent ? "tracking-normal" : "tracking"
            }`}
          >
            {gradientText}
          </p>
          <h1
            className={`text-2xl font-bolder leading-6 ${
              transparent ? "mt-2 tracking-normal" : "tracking-tighter"
            }`}
          >
            {bigText}
          </h1>
          <p
            className={`font-semibold text-3.5 max-w-3xl leading-4.5 ${
              transparent ? "mt-[-.2rem] tracking-normal" : "tracking"
            }`}
          >
            {bottomDescription}
          </p>
          {children}
        </div>

        {content && (
          <div className="relative z-20 flex space-x-[1.25rem]">{content}</div>
        )}

        <div className="absolute bottom-0 right-0 z-10 max-h-full overflow-hidden">
          {jumpLogo && <JumpBigWhite />}
        </div>
      </div>
    </div>
  );
};
