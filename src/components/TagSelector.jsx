import React from "react";

const TAG_COLORS = {
  공부: "bg-blue-100 text-blue-700",
  운동: "bg-green-100 text-green-700",
  데이트: "bg-pink-100 text-pink-700",
  약속: "bg-purple-100 text-purple-700",
  여행: "bg-yellow-100 text-yellow-700",
  기타: "bg-gray-100 text-gray-700",
};

const TagSelector = ({ tag, setTag }) => {
  const tags = Object.keys(TAG_COLORS);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">카테고리 태그</label>
      <select
        value={tag}
        onChange={(e) => setTag(e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="">선택 안함</option>
        {tags.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TagSelector;