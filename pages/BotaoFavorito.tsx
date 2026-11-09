import React, { useState } from 'react';

interface BotaoFavoritoProps {
  imovelId?: string;
}

export const BotaoFavorito: React.FC<BotaoFavoritoProps> = ({ imovelId }) => {
  const [favoritado, setFavoritado] = useState(false);

  const alternarFavorito = () => {
    setFavoritado(!favoritado);
  };

  return (
    <button
      onClick={alternarFavorito}
      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all text-2xl"
    >
      {favoritado ? (
        <span style={{ color: 'red' }}>❤️</span>
      ) : (
        <span style={{ color: 'gray' }}>🤍</span>
      )}
    </button>
  );
};