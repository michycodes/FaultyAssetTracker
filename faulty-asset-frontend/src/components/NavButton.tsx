const NavButton = ({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
      active
        ? 'bg-background/50 text-secondary '
        : 'text-gray-400 hover:bg-background/70 hover:text-white'
    }`}
  >
    {children}
  </button>
);
export default NavButton;
