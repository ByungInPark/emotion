import { useEffect } from 'react';

export default function MapComponent() {
  useEffect(() => {
    const container = document.getElementById('map');
    const options = {
      center: new window.kakao.maps.LatLng(37.5665, 126.9780),
      level: 3,
    };
    const map = new window.kakao.maps.Map(container, options);
  }, []);

  return <div id="map" style={{ width: '100%', height: '400px' }}></div>;
}