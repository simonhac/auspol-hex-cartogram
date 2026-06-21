"use client";

/**
 * Tooltip — thin wrapper over @radix-ui/react-tooltip.
 *
 * Ported from the wallofadvantage app's components/ui/tooltip.tsx, with the
 * Tailwind/`cn()` styling removed in favour of plain semantic classes
 * (`.party-bar-tooltip-content` / `.party-bar-tooltip-arrow`) defined in
 * charts.css — so the library carries no Tailwind dependency. Radix is kept
 * because the trigger (the party badge) lives inside an `overflow: hidden`
 * bar, so the tooltip must portal out to avoid being clipped.
 */

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={
          className
            ? `party-bar-tooltip-content ${className}`
            : "party-bar-tooltip-content"
        }
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="party-bar-tooltip-arrow" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
