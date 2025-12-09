import React, { ReactNode } from 'react';
import { Controller, Control, FieldValues, Path, RegisterOptions } from 'react-hook-form';

interface FormFieldRenderProps {
  value: any;
  onChange: (value: any) => void;
  onBlur: () => void;
  error?: string;
  touched: boolean;
}

interface FormFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  rules?: RegisterOptions<TFieldValues>;
  children: (props: FormFieldRenderProps) => ReactNode;
}

export const FormField = <TFieldValues extends FieldValues>({
  control,
  name,
  rules,
  children,
}: FormFieldProps<TFieldValues>) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) =>
        children({
          value: field.value,
          onChange: field.onChange,
          onBlur: field.onBlur,
          error: fieldState.error?.message,
          touched: fieldState.isTouched,
        })
      }
    />
  );
};
