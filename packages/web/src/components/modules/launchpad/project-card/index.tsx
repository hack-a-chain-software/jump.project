import { launchpadProject } from "@/interfaces";
import { StatusEnum } from "@near/apollo";
import { useMemo } from "react";
import Badge from "./badge";
import isBefore from "date-fns/isBefore";
import { getUTCDate } from "@near/ts";
import { RocketIcon } from "@/assets/svg/rocket";
import { JumpGradient } from "@/assets/svg";

const closedArray = [
  "sale_finalized",
  "pool_created",
  "pool_project_token_sent",
  "pool_price_token_sent",
  "liquidity_pool_finalized",
];

const progress = 50;

export const ProjectCard = ({
  status,
  project_token_info,
  public: publicProject,
  open_sale_1_timestamp,
  final_sale_2_timestamp,
}: Partial<launchpadProject>) => {
  const projectStatus = useMemo(() => {
    return StatusEnum.Open;

    if (status !== "funded" && closedArray.includes(status!)) {
      return StatusEnum.Closed;
    }

    const now = getUTCDate();

    const open = getUTCDate(Number(open_sale_1_timestamp));
    const final = getUTCDate(Number(final_sale_2_timestamp));

    if (status === "funded" && isBefore(now, open)) {
      return StatusEnum.Waiting;
    }

    if (status === "funded" && isBefore(final, now)) {
      return StatusEnum.Closed;
    }

    if (status === "funded" && isBefore(open, now) && isBefore(now, final)) {
      return StatusEnum.Open;
    }

    return StatusEnum.Open;
  }, [status, open_sale_1_timestamp, final_sale_2_timestamp]);

  return (
    <div
      className="
        relative
        bg-[#FFFFFF]/[.10] 
        border-box
        min-w-[325px] w-[313px]
        rounded-[9.37553px]
        px-[18.75px] pt-[35px] pb-[23px]
        font-sans
      "
    >
      <div className="absolute right-[19px] top-[20px] flex space-x-[8px]">
        <Badge type={projectStatus} />

        {!publicProject && <Badge type="whitelist" />}
      </div>

      <div className="flex space-x-[6.25px] mb-[24px]">
        <div>
          <img
            src={project_token_info?.image ?? ""}
            className="w-[45px] h-[45px] rounded-full"
          />
        </div>

        <div>
          <div className="mb-[-4px]">
            <span
              className="text-white text-[16px] font-[700] tracking-[-0.04em]"
              children={project_token_info?.symbol}
            />
          </div>

          <div>
            <span
              className="text-[13px] font-[600] text-white opacity-[0.5] leading-[6px] tracking-[-0.04em]"
              children={project_token_info?.name}
            />
          </div>
        </div>
      </div>

      {[StatusEnum.Open, StatusEnum.Closed].includes(projectStatus) && (
        <>
          <div className="mb-[24px]">
            <div>
              <span className="text-white text-[12px] tracking-[-0.04em] font-[700]">
                Total raised amount
              </span>
            </div>

            <div className="mb-[16px]">
              <span className="text-[20px] font-[700] tracking-[-0.04em]">
                $50.000,00 USDT
              </span>
            </div>

            <div>
              <div className="mb-[6px] text-end">
                <span
                  children={progress + "%"}
                  className="text-white font-[700] text-[16px] tracking-[-0.04em]"
                />
              </div>

              <div
                className="
                flex-grow
                rounded-[40px]
                bg-white/[.38]
              "
              >
                <div
                  style={{
                    width: progress + "%",
                  }}
                  className="
                  h-[6.25px]
                  rounded-[40px]
                  bg-[linear-gradient(90deg,_#AE00FF_0%,_#FF1100_100%)]
                "
                />
              </div>
            </div>
          </div>

          <div className="mb-[4px] flex space-x-[29px] items-center">
            <div className="w-[99px]">
              <span className="font-[700] text-[14px] tracking-[-0.04em]">
                Tokens for sale:
              </span>
            </div>

            <div>
              <span className="text-white font-[700] text-[15.6259px] tracking-[-0.04em]">
                250.000 UNI
              </span>
            </div>
          </div>

          <div className="flex space-x-[29px] items-center mb-[16px]">
            <div className="w-[99px]">
              <span className="font-[700] text-[14px] tracking-[-0.04em]">
                Token price:
              </span>
            </div>

            <div>
              <span className="text-white font-[700] text-[15.6259px] tracking-[-0.04em]">
                10 USDT
              </span>
            </div>
          </div>
        </>
      )}

      {projectStatus === StatusEnum.Waiting && (
        <>
          <div
            className="
              relative
              px-[22px]
              mb-[44px]
              w-full h-[85px] 
              rounded-[9.17099px] 
              space-x-[5px]
              flex items-center justify-start
              bg-[linear-gradient(90deg,_#510B72_0%,_#740B0B_100%)]
            "
          >
            <div>
              <RocketIcon />
            </div>

            <div>
              <span className="font-[700] text-[16px] tracking-[-0.04em] text-[#E2E8F0]">
                Coming soon
              </span>
            </div>

            <div className="absolute right-0 bottom-0">
              <JumpGradient />
            </div>
          </div>

          <div
            className="
              w-full 
              flex justify-center items-center 
              bg-[#20002E] 
              py-[4px] 
              rounded-[10px] mb-[8px] space-x-[29px]
            "
          >
            <div className="w-[108px]">
              <span className="font-[700] text-[14px] tracking-[-0.04em]">
                Sales start:
              </span>
            </div>

            <div>
              <span className="text-[#E2E8F0] font-[700] text-[14px] tracking-[-0.04em]">
                01:05:26:40
              </span>
            </div>
          </div>
        </>
      )}

      <div className="bg-[#20002E] rounded-[10px] px-[16px] py-[24px] mb-[20px] h-[100px]">
        {projectStatus === StatusEnum.Closed ? (
          <div className="h-full w-full flex items-center justify-center">
            <span className="font-[700] text-[14px] tracking-[-0.04em]">
              Sales closed
            </span>
          </div>
        ) : (
          <>
            <div className="mb-[4px] flex space-x-[29px] items-center">
              <div className="w-[108px]">
                <span className="font-[700] text-[14px] tracking-[-0.04em]">
                  Open sales start:
                </span>
              </div>

              <div>
                <span className="text-[#E2E8F0] font-[700] text-[14px] tracking-[-0.04em]">
                  02:05:26:40
                </span>
              </div>
            </div>

            <div className="flex space-x-[29px] items-center">
              <div className="w-[108px]">
                <span className="font-[700] text-[14pxx] tracking-[-0.04em]">
                  Sales end:
                </span>
              </div>

              <div>
                <span className="text-[#E2E8F0] font-[700] text-[14px] tracking-[-0.04em]">
                  07:04:15:31
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex justify-center">
        <button className="rounded-[8.5px] bg-[#6E3A85] py-[9px] px-[33px] hover:opacity-[.8]">
          <span className="font-[700] text-[12px] relative top-[-2px]">
            Join project
          </span>
        </button>
      </div>
    </div>
  );
};
