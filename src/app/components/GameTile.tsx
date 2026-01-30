interface GameTileProps {
  value: number;
}

export function GameTile({ value }: GameTileProps) {
  const getTileColor = (value: number) => {
    const colors: { [key: number]: string } = {
      2: 'bg-[#e9d5ff] text-[#6b21a8]',
      4: 'bg-[#d8b4fe] text-[#6b21a8]',
      8: 'bg-[#c084fc] text-white',
      16: 'bg-[#a855f7] text-white',
      32: 'bg-[#9333ea] text-white',
      64: 'bg-[#7e22ce] text-white',
      128: 'bg-[#6b21a8] text-white',
      256: 'bg-[#581c87] text-white',
      512: 'bg-[#4c1d95] text-white',
      1024: 'bg-[#3b0764] text-white',
      2048: 'bg-[#2e1065] text-white',
    };
    return colors[value] || 'bg-[#a78bfa]/20 text-white';
  };

  const getFontSize = (value: number) => {
    if (value >= 1024) return 'text-3xl';
    if (value >= 128) return 'text-4xl';
    return 'text-5xl';
  };

  return (
    <div
      className={`
        w-full h-full rounded-md flex items-center justify-center
        font-bold transition-all duration-200 ease-out
        ${value ? getTileColor(value) : 'bg-[#cdc1b4]/20'}
        ${value ? getFontSize(value) : ''}
        ${value ? 'scale-100' : 'scale-95'}
      `}
    >
      {value > 0 && value}
    </div>
  );
}