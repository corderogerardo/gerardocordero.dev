import { View, type ViewProps } from "react-native";
import { cn } from "./lib/utils";

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className, ...props }: CardProps) {
  return (
    <View
      className={cn("rounded-lg bg-honeydew p-4 shadow-sm", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return <View className={cn("pb-2", className)} {...props} />;
}

export function CardContent({ className, ...props }: CardProps) {
  return <View className={cn("pt-2", className)} {...props} />;
}
