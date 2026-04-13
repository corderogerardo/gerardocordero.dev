import { Text as RNText, type TextProps } from "react-native";
import { cn } from "./lib/utils";

interface StyledTextProps extends TextProps {
  className?: string;
}

export function Text({ className, ...props }: StyledTextProps) {
  return <RNText className={cn("text-foreground", className)} {...props} />;
}
