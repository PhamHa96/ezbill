type SocialButtonProps = {
  label: string;
  light?: boolean;
};

export function SocialButton({ label, light }: SocialButtonProps) {
  return (
    <button
      className={`
        flex w-full items-center justify-center gap-2
        rounded-xl py-3 text-sm font-medium
        ${light
          ? 'bg-white text-black'
          : 'bg-black text-white border border-white/10'}
      `}
    >
      {label}
    </button>
  );
}
