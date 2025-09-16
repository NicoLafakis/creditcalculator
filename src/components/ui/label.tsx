import * as React from "react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  // Optional short tooltip text shown on hover/focus of the label
  tooltip?: string
  // Optional classnames to customize the tooltip content appearance (trigger is standardized)
  tooltipContentClassName?: string
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, tooltip, children, tooltipContentClassName, ...props }, ref) => (
  <label ref={ref} className={cn("inline-flex items-center gap-2", className)} {...props}>
    <span className={cn("text-sm font-medium leading-none text-zinc-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-70")}>
      {children}
    </span>
    {tooltip ? (
      <Tooltip>
        <TooltipTrigger tabIndex={0} className="ui-info-trigger">i</TooltipTrigger>
        <TooltipContent className={cn("ui-right ui-prominent", tooltipContentClassName)}>{tooltip}</TooltipContent>
      </Tooltip>
    ) : null}
  </label>
))
Label.displayName = "Label"

export { Label }
