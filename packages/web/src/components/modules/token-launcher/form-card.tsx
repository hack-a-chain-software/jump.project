import { Flex, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { Card } from "../../shared";
import { GlobeAltIcon } from "@heroicons/react/outline";
import { FormButton } from "./form-button";
import { FormInputAndLabel } from "./form-input-label";
import { useFormContext } from "react-hook-form";
import { FormHeader } from "./form-header";

interface FormCardProps {
  onSubmitStepForm: (data: any) => void;
}

export function FormCardStep1({ onSubmitStepForm }: FormCardProps) {
  const { register, watch } = useFormContext();

  const requiredInputs = {
    name: watch("name"),
    symbol: watch("symbol"),
    icon: watch("icon"),
    decimals: watch("decimals"),
  };

  function checkInputLenghtGreaterThanZero(input: string) {
    return input?.length > 0;
  }

  const requiredInputsFilled = Object.values(requiredInputs).every(
    checkInputLenghtGreaterThanZero
  );

  const isButtonDisabled = !requiredInputsFilled;

  return (
    <Card
      p="3px"
      flexGrow="1"
      borderRadius="25px"
      height={{ sm: "auto", md: "914px" }}
    >
      <Flex
        pl={{ base: "none", md: "10.3%" }}
        pr="3%"
        flex={1.6}
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="center"
        height="100%"
      >
        <FormHeader title="Set the basics" step="Step 1/2" />
        <FormControl id="form-step-1" mt="37px" pl={4}>
          <form id="form-step-1" onSubmit={onSubmitStepForm}>
            <FormInputAndLabel
              label="Token name"
              placeholder="Ex: Bitcoin, Ethereum"
              inputName="name"
            />
            <FormInputAndLabel
              label="Symbol"
              placeholder="Ex: BTC, ETH"
              inputName="symbol"
            />
            <FormLabel
              fontSize="16px"
              fontWeight="600"
              lineHeight="16px"
              mb="13px"
              mt="31px"
            >
              Token image
            </FormLabel>
            <div className="relative">
              <Input
                pl="57px"
                border="0px"
                backgroundColor="rgba(255,255,255,0.2)"
                borderRadius="10px"
                width="93%"
                height="40px"
                fontWeight="400"
                fontSize="14px"
                lineHeight="40px"
                _placeholder={{ color: "#FFF", opacity: "0.5" }}
                placeholder="Paste URL here"
                {...register("icon")}
              />
              <div
                className="h-[40px] w-[40px] border-r-[1px] 
                        absolute left-0 top-0 border-[rgba(255,255,255,0.19)]"
              />
              <GlobeAltIcon
                className="h-[14px] w-[14px] 
                            absolute left-[13px] top-[13px] "
              />
            </div>
            <FormInputAndLabel
              label="Decimals"
              placeholder="Ex: 18"
              inputName="decimals"
              type="number"
            />
            <FormInputAndLabel
              label={
                <>
                  Reference <span className="font-normal">(optional)</span>
                </>
              }
              placeholder="Ex: 18"
              inputName="reference"
            />
            <FormInputAndLabel
              label={
                <>
                  Hash reference <span className="font-normal">(optional)</span>
                </>
              }
              placeholder="Ex: 18"
              inputName="reference_hash"
            />
          </form>
        </FormControl>
        <FormButton
          isDisabled={isButtonDisabled}
          mt={{ base: "41px", md: "61px" }}
          mb={{ base: "30px", md: "none" }}
          title="Create token"
          bg="#6E3A85"
          color="#FFF"
          type="submit"
          form="form-step-1"
        />
      </Flex>
    </Card>
  );
}
