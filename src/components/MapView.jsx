import React, { useEffect, useRef, useState } from 'react';
import useLocalStorage from "@/hooks/useLocalStorage";

function MapView({ onPlaceSelect, onCreateScheduleFromPlace }) {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [keyword, setKeyword] = useState("카페");
  const [places, setPlaces] = useState([]);
  const markersRef = useRef([]);
  const infoWindowsRef = useRef([]);
  const [favorites, setFavorites] = useLocalStorage('favoritePlaces', []);

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        const container = mapRef.current;
        if (!container) return;

        // 1) 지도 초기화
        const options = {
          center: new window.kakao.maps.LatLng(37.5665, 126.9780),
          level: 5,
        };

        const map = new window.kakao.maps.Map(container, options);
        setMapInstance(map);
        window.globalKakaoMapInstance = map;

        // 불필요한 지도 요소 제거 (미니맵, 로고 위치 등)
        map.setCopyrightPosition(
          window.kakao.maps.CopyrightPosition.BOTTOMRIGHT,
          false
        );

        // 2) 현재 위치 마커 및 초기 검색
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              const locPosition = new window.kakao.maps.LatLng(lat, lng);

              // 내 위치 마커 (커스텀 아이콘)
              new window.kakao.maps.Marker({
                map,
                position: locPosition,
                title: "내 위치",
                image: new window.kakao.maps.MarkerImage(
                  "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
                  new window.kakao.maps.Size(32, 32),
                  { offset: new window.kakao.maps.Point(16, 32) }
                ),
              });

              map.setCenter(locPosition);
              searchPlaces(keyword, locPosition, map);
            },
            () => {
              // 위치 비허용 시 초기 센터 기준 검색
              searchPlaces(keyword, options.center, map);
            }
          );
        } else {
          searchPlaces(keyword, options.center, map);
        }
      });
    }
  }, []);

  // 카테고리 검색 이벤트 수신 (외부에서 `trigger-category-search` 발생 시)
  useEffect(() => {
    const handler = (e) => {
      const { category, location } = e.detail;
      setKeyword(category);
      if (mapInstance) {
        searchPlaces(category, location, mapInstance);
      }
    };
    window.addEventListener("trigger-category-search", handler);
    return () => window.removeEventListener("trigger-category-search", handler);
  }, [mapInstance]);

  // 장소 검색 함수 (여러 페이지에 걸쳐 45개까지 검색)
  const searchPlaces = (keyword, location, map) => {
    // 기존 마커, InfoWindow 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    infoWindowsRef.current.forEach((iw) => iw.close());
    infoWindowsRef.current = [];

    const ps = new window.kakao.maps.services.Places();
    let collected = [];
    let page = 1;

    const searchPage = () => {
      ps.keywordSearch(
        keyword,
        (data, status, pagination) => {
          if (status === window.kakao.maps.services.Status.OK) {
            collected = [...collected, ...data];

            if (pagination.hasNextPage && page < 3) {
              page++;
              pagination.nextPage();
            } else {
              // 최종 검색 결과 렌더링
              renderMarkers(collected, map);
              setPlaces(collected);
            }
          } else {
            // 검색 실패 시 빈 배열
            setPlaces([]);
          }
        },
        {
          location,
          radius: 10000,
          page,
        }
      );
    };

    searchPage();
  };

  // 마커 및 InfoWindow 렌더링
  const renderMarkers = (data, map) => {
    const bounds = new window.kakao.maps.LatLngBounds();

    data.forEach((place, idx) => {
      const position = new window.kakao.maps.LatLng(place.y, place.x);
      const marker = new window.kakao.maps.Marker({
        map,
        position,
        title: place.place_name,
      });
      bounds.extend(position);

      // InfoWindow content: “선택” 버튼 + “일정에 추가” 버튼
      const infoHTML = `
        <div style="padding:8px; font-size:14px;">
          <strong>${place.place_name}</strong><br/>
          ${place.road_address_name || place.address_name}<br/>
          <button id="select-btn-${idx}" style="
            margin-top:5px;
            background:#10b981;
            color:white;
            padding:3px 6px;
            border:none;
            border-radius:4px;
            cursor:pointer;
          ">선택</button>
          <button id="add-btn-${idx}" style="
            margin-top:5px;
            background:#3b82f6;
            color:white;
            padding:3px 6px;
            border:none;
            border-radius:4px;
            cursor:pointer;
          ">일정에 추가</button>
        </div>
      `;
      const infoWindow = new window.kakao.maps.InfoWindow({
        content: infoHTML,
        zIndex: 3,
      });

      infoWindowsRef.current[idx] = infoWindow;

      // 마커 클릭 시 InfoWindow 열기
      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 기존에 열린 InfoWindow 닫기
        infoWindowsRef.current.forEach((win) => win.close());
        infoWindow.open(map, marker);
        map.panTo(marker.getPosition());

        // DOM이 생성된 뒤 버튼에 이벤트 바인딩 (100ms 딜레이)
        setTimeout(() => {
          // “선택” 버튼: onPlaceSelect 호출
          const selectBtn = document.getElementById(`select-btn-${idx}`);
          if (selectBtn && onPlaceSelect) {
            selectBtn.onclick = (e) => {
              e.stopPropagation();
              onPlaceSelect({
                id: place.id, // 즐겨찾기 등 비교용 ID
                name: place.place_name,
                address: place.road_address_name || place.address_name,
                latitude: place.y,
                longitude: place.x,
              });
              infoWindow.close();
            };
          }

          // “일정에 추가” 버튼: onCreateScheduleFromPlace 호출
          const addBtn = document.getElementById(`add-btn-${idx}`);
          if (addBtn && onCreateScheduleFromPlace) {
            addBtn.onclick = (e) => {
              e.stopPropagation();
              onCreateScheduleFromPlace({
                title: place.place_name,
                location: place.road_address_name || place.address_name,
                lat: place.y,
                lng: place.x,
              });
              infoWindow.close();
            };
          }
        }, 100);
      });

      markersRef.current.push(marker);
    });

    // 지도가 모든 마커를 포함하도록 범위 조정
    map.setBounds(bounds);
  };

  // 사이드바 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    if (!mapInstance) return;
    const center = mapInstance.getCenter();
    searchPlaces(keyword, center, mapInstance);
  };

  return (
    <div className="flex w-full h-full">
      {/* ────────────────────────────────────────────────────────────────────
          1) 카카오 맵 영역 (왼쪽 3/4)
         ──────────────────────────────────────────────────────────────────── */}
      <div
        id="map"
        ref={mapRef}
        className="w-3/4 h-full rounded-l-xl border shadow"
      />

      {/* ────────────────────────────────────────────────────────────────────
          2) 사이드바: 검색 및 즐겨찾기
         ──────────────────────────────────────────────────────────────────── */}
      <div className="w-1/4 h-full overflow-y-auto bg-white p-4 rounded-r-xl shadow border-l">
        {/* 검색 입력 */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="장소 검색"
            className="w-full border rounded px-2 py-1"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            검색
          </button>
        </div>

        {/* 검색 결과 리스트 */}
        {places.length > 0 ? (
          <ul className="space-y-3">
            {places.map((place, idx) => (
              <li
                key={idx}
                className="border-b pb-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  // 리스트 아이템 클릭 시 마커 InfoWindow 열기
                  window.kakao.maps.event.trigger(
                    markersRef.current[idx],
                    'click'
                  );
                }}
              >
                <p className="font-semibold">{place.place_name}</p>
                <p className="text-sm text-gray-600">
                  {place.road_address_name || place.address_name}
                </p>
                {place.phone && (
                  <p className="text-xs text-gray-400">📞 {place.phone}</p>
                )}

                <div className="mt-2 space-x-2">
                  {/* “선택” 버튼: onPlaceSelect 호출 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPlaceSelect) {
                        onPlaceSelect({
                          id: place.id,
                          name: place.place_name,
                          address: place.road_address_name || place.address_name,
                          latitude: place.y,
                          longitude: place.x,
                        });
                      }
                    }}
                    className="text-green-600 text-sm underline hover:text-green-800"
                  >
                    선택
                  </button>

                  {/* “+ 일정에 추가” 버튼: onCreateScheduleFromPlace 호출 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onCreateScheduleFromPlace) {
                        onCreateScheduleFromPlace({
                          title: place.place_name,
                          location: place.road_address_name || place.address_name,
                          lat: place.y,
                          lng: place.x,
                        });
                      }
                    }}
                    className="text-blue-600 text-sm underline hover:text-blue-800"
                  >
                    + 일정에 추가
                  </button>
                </div>

                {/* 즐겨찾기 버튼 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!favorites.some((f) => f.id === place.id)) {
                      setFavorites([
                        ...favorites,
                        {
                          id: place.id,
                          name: place.place_name,
                          address: place.road_address_name || place.address_name,
                          lat: place.y,
                          lng: place.x,
                        },
                      ]);
                    }
                  }}
                  className="block text-yellow-500 text-xs mt-1"
                >
                  ⭐ 즐겨찾기 추가
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">검색 결과가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default MapView;