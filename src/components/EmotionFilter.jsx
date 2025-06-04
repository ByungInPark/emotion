import React from "react";

const EmotionFilter = ({ selectedEmotion, setSelectedEmotion }) => {
  return (
    <div className="flex justify-center mt-4">
      <select
        value={selectedEmotion}
        onChange={(e) => setSelectedEmotion(e.target.value)}
        className="border p-2 rounded-lg shadow"
      >
        <option value="">감정을 선택하세요</option>
        <option value="happy">행복</option>
        <option value="sad">우울</option>
        <option value="angry">짜증</option>
        <option value="tired">피곤</option>
      </select>
    </div>
  );
};

export default EmotionFilter;
