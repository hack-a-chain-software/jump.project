import { JumpTextIcon } from "@/assets/svg/jump-text";
import { Button } from "./button";
import { MobileNav } from "./mobile-nav";
import { useEffect, useState } from "react";
import { AirdropModal } from "@/modals";
import { Wallet } from "./wallet";
import { JumpIcon } from "@/assets/svg/jump-logo";
import { MoonIcon, Bars3Icon } from "@heroicons/react/24/solid";
import { SunIcon } from "@heroicons/react/24/outline";

const SCROLL_TOLERANCE = 8;

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [isStyleSchemeDark, setStyleScheme] = useState(true);
  const [isHeaderFloating, setHeaderFloating] = useState(
    window.scrollY > SCROLL_TOLERANCE
  );

  useEffect(() => {
    // Add/remove scrolling listener to isHeaderFloating
    const onScroll = () => setHeaderFloating(window.scrollY > SCROLL_TOLERANCE);

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const classes =
    "transition-all fixed inset-0 bottom-auto z-50 flex items-center justify-between px-8 h-[74px]";
  const floatingClasses = " shadow-lg backdrop-blur bg-white-600";

  return (
    <div className="relative w-full h-[74px]">
      <header className={classes + (isHeaderFloating ? floatingClasses : "")}>
        <AirdropModal
          isOpen={showTokenModal}
          onClose={() => setShowTokenModal(false)}
        />
        <div className="flex gap-x-4 items-center">
          <JumpIcon />
          <JumpTextIcon />
        </div>

        <div className="flex gap-x-6 items-center">
          {/* GetTestnet Tokens Button */}
          <Button
            inline
            className="p-0 text-3.5 font-semibold leading-4 tracking-normal"
            onClick={() => setShowTokenModal(!showTokenModal)}
          >
            Get Testnet Tokens
          </Button>

          {/* Wallet Button/Menu */}
          <Wallet />

          {/* Dark/Light Switch Button */}
          <Button
            white
            className="h-10 aspect-square p-0 hidden"
            onClick={() => setStyleScheme(!isStyleSchemeDark)}
          >
            {!isStyleSchemeDark && <MoonIcon className="h-3 fill-purple" />}
            {isStyleSchemeDark && <SunIcon className="h-3" />}
          </Button>

          {/* Mobile Hamburger Button */}
          <Button white onClick={() => setIsOpen(true)} className="lg:hidden">
            <Bars3Icon className="h-3.5" />
          </Button>

          <MobileNav isOpen={isOpen} onClose={() => setIsOpen(!isOpen)} />
        </div>
      </header>
    </div>
  );
}
