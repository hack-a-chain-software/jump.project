import {
  PageContainer,
  FormCardStep1,
  TokenLauncherTopCard,
  FormCardStep2,
  FormIntroModal,
} from "../components";
import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useWalletSelector } from "@/context/wallet-selector";
import { useTokenLauncher } from "@/stores/token-louncher-store";

export type TokenDataProps = {
  name: string;
  symbol: string;
  icon?: string | null;
  decimals: number;
  reference?: string | null;
  reference_hash?: string | null;
  type: string;
  supply_type: string;
  total_supply?: number;
};

export const TokenLauncher = () => {
  const [step, setStep] = useState<string>("step 1");
  const [tokenData, setTokenData] = useState<TokenDataProps>({
    name: "",
    symbol: "",
    icon: "",
    decimals: 0,
    reference: null,
    reference_hash: null,
    type: "",
    supply_type: "",
    total_supply: 0,
  });
  const [showModal, setShowModal] = useState<boolean>(false);

  const { accountId, selector } = useWalletSelector();

  const { createToken } = useTokenLauncher();

  const newTokenForm = useForm<TokenDataProps>();

  const { handleSubmit, reset } = newTokenForm;

  function handleFormStepChange() {
    step == "step 1" ? setStep("step 2") : setStep("step 1");
  }

  function handleUpdateTokenType(tokenType: string) {
    if (tokenType == "Mintable Token") {
      setTokenData((prevState) => {
        return {
          ...prevState,
          type: "mintable",
          supply_type: "unlimited",
        };
      });
    }
    if (tokenType == "Simple Token") {
      setTokenData((prevState) => {
        return {
          ...prevState,
          type: "simple",
          supply_type: "fixed",
        };
      });
    }
  }

  function createArgsForTokenContract(obj: TokenDataProps) {
    const supply_type =
      obj?.supply_type == "fixed" ? "total_supply" : "init_supply";
    const params = {
      owner_id: accountId,
      [supply_type]: obj.total_supply,
      metadata: {
        spec: "ft-1.0.0",
        name: obj.name,
        symbol: obj.symbol,
        icon: obj.icon || null,
        reference: obj.reference || null,
        reference_hash: obj.reference_hash || null,
        decimals: Number(obj.decimals),
      },
    };

    return params;
  }

  const handleStep1FormSubmit = handleSubmit((data) => {
    setTokenData(() => data);
    handleFormStepChange();
  });

  const handleStep2FormSubmit = handleSubmit(async (data) => {
    setTokenData((prevState) => {
      return { ...prevState, ...data };
    });

    const contract_args = createArgsForTokenContract({ ...tokenData, ...data });
    // const storageCost = await viewFunction(
    //   selector,
    //   "launcher.testnet",
    //   "view_storage_cost_near",
    //   {
    //     contract_name: "token",
    //   }
    // );

    const deployCost = "20756340000000000000000010";

    createToken(
      deployCost,
      accountId!,
      tokenData?.name,
      contract_args,
      selector
    );

    reset();
  });

  const handleOpenModal = () => {
    if (localStorage.getItem("@token-launcher-first-interaction")) {
      return;
    } else {
      setShowModal(true);
      localStorage.setItem("@token-launcher-first-interaction", "false");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    handleOpenModal();
  }, []);

  return (
    <PageContainer>
      <FormProvider {...newTokenForm}>
        <FormIntroModal isOpen={showModal} handleClose={handleCloseModal} />
        <TokenLauncherTopCard />
        {step == "step 1" && (
          <FormCardStep1 onSubmitStepForm={handleStep1FormSubmit} />
        )}

        {step == "step 2" && (
          <FormCardStep2
            onSubmitStep2Form={handleStep2FormSubmit}
            onReturnFunction={handleFormStepChange}
            onUpdateTokenType={handleUpdateTokenType}
          />
        )}
      </FormProvider>
    </PageContainer>
  );
};

export default TokenLauncher;
