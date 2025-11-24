export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white font-bold">
        V
      </div>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-slate-900">
          VSource Education
        </p>
        <p className="text-[11px] text-slate-500">Admin System</p>
      </div>
    </div>
  );
}
