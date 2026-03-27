export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type="submit"
      className="w-full bg-[#ff85a1] hover:bg-primary-hover text-white
                 font-extrabold py-4 rounded-3xl shadow-lg
                 transition-all active:scale-95 mt-4 text-lg"
    />
  );
}
