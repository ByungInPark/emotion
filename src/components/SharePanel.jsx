import React from "react";
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
} from "react-share";

const SharePanel = ({ shareUrl }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-lg font-bold">📤 일정 공유</h2>

      <div className="flex gap-4 items-center">
        <FacebookShareButton url={shareUrl}>
          <FacebookIcon size={32} round />
        </FacebookShareButton>
        <TwitterShareButton url={shareUrl}>
          <TwitterIcon size={32} round />
        </TwitterShareButton>
        <button
          className="text-blue-500 underline"
          onClick={() => {
            navigator.clipboard.writeText(shareUrl);
            alert("링크가 복사되었습니다!");
          }}
        >
          🔗 링크 복사
        </button>
      </div>
    </div>
  );
};

export default SharePanel;