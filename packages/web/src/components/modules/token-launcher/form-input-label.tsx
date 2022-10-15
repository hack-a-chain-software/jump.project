import { FormLabel, Input } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";

interface FormInputAndLabelProps {
  placeholder: string;
  label: JSX.Element | string;
  inputName: string;
  type?: string;
}

export function FormInputAndLabel({
  placeholder,
  label,
  inputName,
  type,
}: FormInputAndLabelProps) {
  const { register } = useFormContext();

  return (
    <>
      <FormLabel
        fontSize="16px"
        fontWeight="600"
        lineHeight="16px"
        mb="13px"
        mt="31px"
      >
        {label}
      </FormLabel>
      <Input
        border="0px"
        backgroundColor="rgba(255,255,255,0.2)"
        borderRadius="10px"
        width="93%"
        height="40px"
        fontWeight="400"
        fontSize="14px"
        lineHeight="40px"
        pl="20px"
        _placeholder={{ color: "#FFF", opacity: "0.5" }}
        placeholder={placeholder}
        {...register(inputName)}
        type={type}
      />
    </>
  );
}
