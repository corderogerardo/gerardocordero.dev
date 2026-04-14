import React from "react";
import { Pressable, type PressableProps } from "react-native";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";
import { Text } from "./text";

const buttonVariants = cva(
  "flex items-center justify-center rounded-md active:opacity-80",
  {
    variants: {
      variant: {
        default: "bg-prussian-blue",
        destructive: "bg-imperial-red",
        outline: "border border-celadon-blue bg-transparent",
        ghost: "bg-transparent",
        link: "bg-transparent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-12 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva("font-medium", {
  variants: {
    variant: {
      default: "text-honeydew",
      destructive: "text-honeydew",
      outline: "text-celadon-blue",
      ghost: "text-foreground",
      link: "text-celadon-blue underline",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

export interface ButtonProps
  extends PressableProps,
    VariantProps<typeof buttonVariants> {
  className?: string;
  textClassName?: string;
  children: React.ReactNode;
}

export const Button = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  ButtonProps
>(({ className, textClassName, variant, size, children, ...props }, ref) => (
  <Pressable
    ref={ref}
    className={cn(buttonVariants({ variant, size }), className)}
    {...props}
  >
    {typeof children === "string" ? (
      <Text className={cn(buttonTextVariants({ variant, size }), textClassName)}>
        {children}
      </Text>
    ) : (
      children
    )}
  </Pressable>
));

Button.displayName = "Button";
