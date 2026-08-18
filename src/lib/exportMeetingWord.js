import { ACTION_ITEM_STATUS } from "../constants/categoryStyles";

function esc(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function section(title, bodyHtml) {
  if (!bodyHtml) return "";
  return `<h2 style="font-size:16pt;color:#4338ca;margin:20px 0 8px;">${esc(title)}</h2>${bodyHtml}`;
}

export function exportMeetingToWord(meeting, actionItems = []) {
  const parts = [];

  parts.push(`<h1 style="font-size:22pt;margin-bottom:4px;">${esc(meeting.title)}</h1>`);

  const infoLines = [];
  infoLines.push(`日期：${esc(meeting.date)}${meeting.startTime ? ` ${esc(meeting.startTime)}${meeting.endTime ? `-${esc(meeting.endTime)}` : ""}` : ""}`);
  if (meeting.location) infoLines.push(`地點：${esc(meeting.location)}`);
  if (meeting.meetingLink) infoLines.push(`會議連結：${esc(meeting.meetingLink)}`);
  if (meeting.hostName) infoLines.push(`主持人：${esc(meeting.hostName)}`);
  if (meeting.recorderName) infoLines.push(`記錄人：${esc(meeting.recorderName)}`);
  parts.push(`<p style="font-size:11pt;color:#444;">${infoLines.join("<br/>")}</p>`);

  if (meeting.attendeeNamesSnapshot?.length > 0) {
    parts.push(`<p style="font-size:11pt;">出席者：${esc(meeting.attendeeNamesSnapshot.join("、"))}</p>`);
  }
  if (meeting.absenteeNamesSnapshot?.length > 0) {
    parts.push(`<p style="font-size:11pt;color:#666;">請假 / 缺席：${esc(meeting.absenteeNamesSnapshot.join("、"))}</p>`);
  }

  if (meeting.purpose) {
    parts.push(section("會議主旨", `<div style="font-size:11pt;">${meeting.purpose}</div>`));
  }

  if (meeting.agendaItems?.length > 0) {
    const items = meeting.agendaItems.map((item, i) => `
      <div style="margin-bottom:14px;">
        <p style="font-weight:bold;font-size:12pt;">${i + 1}. ${esc(item.topic)}</p>
        ${item.summary ? `<div style="font-size:11pt;">${item.summary}</div>` : ""}
        ${item.decision ? `<div style="font-size:11pt;color:#555;">決議：${item.decision}</div>` : ""}
      </div>
    `).join("");
    parts.push(section("議程與討論摘要", items));
  }

  if (meeting.otherNotes) {
    parts.push(section("待搜集資訊 / 待外部確認事項", `<div style="font-size:11pt;">${meeting.otherNotes}</div>`));
  }

  if (meeting.nextMeetingDate || meeting.nextMeetingTime || meeting.nextMeetingTopic) {
    const nextLines = [];
    if (meeting.nextMeetingDate) nextLines.push(esc(meeting.nextMeetingDate));
    if (meeting.nextMeetingTime) nextLines.push(esc(meeting.nextMeetingTime));
    let body = `<p style="font-size:11pt;">${nextLines.join(" ")}</p>`;
    if (meeting.nextMeetingTopic) body += `<div style="font-size:11pt;">${meeting.nextMeetingTopic}</div>`;
    parts.push(section("下次會議暫定", body));
  }

  if (actionItems.length > 0) {
    const rows = actionItems.map((item) => `
      <tr>
        <td style="border:1px solid #ccc;padding:6px;">${esc(item.description)}</td>
        <td style="border:1px solid #ccc;padding:6px;">${esc(ACTION_ITEM_STATUS[item.status]?.label || "")}</td>
        <td style="border:1px solid #ccc;padding:6px;">${esc(item.assigneeName)}</td>
        <td style="border:1px solid #ccc;padding:6px;">${esc(item.dueDate)}</td>
      </tr>
    `).join("");
    const table = `
      <table style="border-collapse:collapse;width:100%;font-size:10.5pt;">
        <thead>
          <tr>
            <th style="border:1px solid #ccc;padding:6px;text-align:left;background:#f3f4f6;">事項</th>
            <th style="border:1px solid #ccc;padding:6px;text-align:left;background:#f3f4f6;">狀態</th>
            <th style="border:1px solid #ccc;padding:6px;text-align:left;background:#f3f4f6;">負責人</th>
            <th style="border:1px solid #ccc;padding:6px;text-align:left;background:#f3f4f6;">期限</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    parts.push(section("行動任務清單", table));
  }

  const bodyHtml = parts.join("\n");

  const doc = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        body { font-family: "Microsoft JhengHei", "PingFang TC", sans-serif; }
      </style>
    </head>
    <body>${bodyHtml}</body>
    </html>
  `;

  const blob = new Blob(["﻿", doc], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `會議記錄-${meeting.title}-${meeting.date}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
