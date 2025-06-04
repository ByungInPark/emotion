import { useState, useEffect } from 'react';
import useLocalStorage from '@/hooks/useLocalStorage';

const FavoritePlaces = ({ onSelect }) => {
  const [favorites, setFavorites] = useLocalStorage('favoritePlaces', []);

  return (
    <div>
      <h3 className="font-semibold mb-2">⭐ 즐겨찾는 장소</h3>
      <div className="flex flex-wrap gap-2">
        {favorites.map((place, i) => (
          <button key={i} onClick={() => onSelect(place)} className="text-sm bg-blue-100 px-2 py-1 rounded">
            {place.name}
          </button>
        ))}
      </div>
    </div>
  );
};
export default FavoritePlaces;