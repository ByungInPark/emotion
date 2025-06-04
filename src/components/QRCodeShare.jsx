import React from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRCodeShare({ value }) {
  return <QRCodeCanvas value={value} />;
}