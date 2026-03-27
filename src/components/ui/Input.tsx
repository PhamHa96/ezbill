import { cn } from "../../lib/cn";

type Props = {
  icon?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ icon, className, ...props }: Props) {
  return (
    <div
      className="
        flex items-center gap-3
        rounded-2xl border border-[#ffd1dc]
        bg-card-soft px-4 py-3
        focus-within:shadow-[0_0_0_2px_var(--primary-glow)]
        transition
      "
    >
      {icon}
      <input
        {...props}
        className={cn(
          'w-full bg-transparent text-sm text-white placeholder:text-muted focus:outline-none',
          className
        )}
      />
    </div>
  );
}
