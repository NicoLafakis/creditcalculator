import * as React from "react"

// Accessible, dependency-free tooltip primitive.
// - Generates a unique id per Tooltip instance (useId) and provides it via context
// - Trigger gets `aria-describedby` pointing to the content id
// - Content becomes visible on hover and when the trigger receives focus (keyboard accessible)
// Usage:
// <Tooltip>
//   <TooltipTrigger>i</TooltipTrigger>
//   <TooltipContent>Help text</TooltipContent>
// </Tooltip>

const TooltipContext = React.createContext<{ id: string } | null>(null)

const TooltipProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <>{children}</>

const Tooltip: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
	const id = React.useId()
	return (
		<div className="group ui-tooltip-wrapper" data-tooltip-id={id}>
			<TooltipContext.Provider value={{ id }}>{children}</TooltipContext.Provider>
		</div>
	)
}

const TooltipTrigger = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(({ children, className, tabIndex, role, ...props }, ref) => {
	const ctx = React.useContext(TooltipContext)
	const described = ctx?.id
	return (
		<span
			{...props}
			ref={ref as any}
			role={role || "button"}
			tabIndex={typeof tabIndex === "number" ? tabIndex : 0}
			aria-describedby={described}
			className={"inline-flex items-center gap-2 " + (className || "")}
		>
			{children}
		</span>
	)
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, className, ...props }, ref) => {
	const ctx = React.useContext(TooltipContext)
	const id = ctx?.id
		return (
			<div
				id={id}
				ref={ref}
				role="tooltip"
				{...props}
				className={
					"ui-tooltip-content pointer-events-none absolute z-50 hidden w-max max-w-xs text-white text-sm shadow-lg text-left whitespace-normal " +
					(className || "") +
					" group-hover:block group-focus-within:block"
				}
			>
				{children}
			</div>
		)
})
TooltipContent.displayName = "TooltipContent"

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent }
