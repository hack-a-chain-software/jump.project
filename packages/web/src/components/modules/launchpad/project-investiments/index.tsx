export const ProjectInvestments = () => {
  return (
    <div>
      <div className="flex space-x-[67px] mb-[32px]">
        <div>
          <div>
            <span className="text-[14px] font-[600] tracking-[-0.03em]">
              Total token amount
            </span>
          </div>

          <div>
            <span className="font-[800] text-[24px] tracking-[-0.03em] text-[#E2E8F0]">
              30 UNI
            </span>
          </div>
        </div>

        <div>
          <div>
            <span className="text-[14px] font-[600] tracking-[-0.03em]">
              Allocation ballance
            </span>
          </div>

          <div>
            <span className="font-[800] text-[24px] tracking-[-0.03em] text-[#E2E8F0]">
              400
            </span>
          </div>
        </div>

        <div>
          <div>
            <span className="text-[14px] font-[600] tracking-[-0.03em]">
              Allocations bought
            </span>
          </div>

          <div>
            <span className="font-[800] text-[24px] tracking-[-0.03em] text-[#E2E8F0]">
              100
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[rgba(252,252,252,0.2)] rounded-[20px] pl-[25px] pr-[33px] py-[16px] flex space-between items-center">
        <div className="flex flex-1 space-x-[32px]">
          <div>
            <div>
              <span className="font-[600] text-[14px] tracking-[-0.03em]">
                Unlocked amount
              </span>
            </div>

            <div>
              <span className="font-[800] text-[24px] tracking-[-0.03em]">
                0 UNI
              </span>
            </div>

            <div>
              <span className="font-[600] text-[14px] tracking-[-0.03em] text-[rgba(255,255,255,0.75)]">
                Available to claim
              </span>
            </div>
          </div>

          <div>
            <div>
              <span className="font-[600] text-[14px] tracking-[-0.03em]">
                Claimed Amount
              </span>
            </div>

            <div>
              <span className="font-[800] text-[24px] tracking-[-0.03em]">
                0 UNI
              </span>
            </div>
          </div>
        </div>

        <div>
          <button className="py-[16px] px-[32px] rounded-[10px] bg-white">
            <span className="font-[600] text-[14px] tracking-[-0.04em] text-[#431E5A]">
              Withdraw
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectInvestments;
