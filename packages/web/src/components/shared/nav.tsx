import { Tooltip } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { navRoutes } from "@/routes";
import { twMerge } from "tailwind-merge";

export const Nav = () => {
  const navigate = useNavigate();

  const onClick = (event, route) => {
    event.preventDefault();
    route.enabled && navigate(route.route);
  };

  const renderLink = (route) => {
    const { route: path, enabled, icon, title } = route;
    const {
      location: { pathname },
    } = window;

    const current =
      pathname === path || (path === "/" && pathname.includes("/projects"));

    return (
      <Tooltip
        isDisabled={enabled}
        key={path}
        hasArrow
        label="Coming soon"
        placement="right"
      >
        <a
          href={enabled ? path : null}
          onClick={(event) => onClick(event, route)}
        >
          <div
            className={twMerge(
              "relative before:transition before:content-[' ']",
              "before:rounded-full before:absolute before:aspect-square",
              "before:scale-0 before:w-17 hover:before:scale-100",
              "before:bg-white-600 before:opacity-30 hover:before:opacity-100 font-semibold text-center w-full flex",
              "flex-col items-center justify-center p-4 leading-3 tracking-normal gap-y-[.47rem]",
              current ? "text-white" : "text-white-400"
            )}
          >
            {icon}
            <p className="w-min text-3">{title}</p>
          </div>
        </a>
      </Tooltip>
    );
  };

  return (
    <div className="relative hidden lg:block h-screen inline-block flex-grow-0 flex-shrink-0 basis-[107px]">
      {/* pb-[98px] = HEADER_HEIGHT + 24px */}
      <nav className="fixed hidden lg:block h-screen w-[107px] overflow-y-scroll py-4 pb-[98px]">
        {navRoutes.map(renderLink)}
      </nav>
    </div>
  );
};
