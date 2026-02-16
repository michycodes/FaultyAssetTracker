const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) => {
  const colors: any = {
    gray: 'border-gray-700 text-gray-100',
    yellow: 'border-yellow-500/50 text-yellow-500',
    blue: 'border-blue-500/50 text-blue-500',
    green: 'border-green-500/50 text-green-500',
    red: 'border-orange-500/50 text-orange-500',
    orange: 'border-orange-500/50 text-orange-500',
    purple: 'border-violet-500/50 text-violet-400',
  };
  return (
    <div
      className={`p-6 bg-neutral-900/40 border rounded-2xl ${
        colors[color] ?? colors.gray
      } w-full`}
    >
      <p className="text-xs uppercase tracking-widest opacity-60 font-bold mb-1">
        {label}
      </p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
};
export default StatCard;
