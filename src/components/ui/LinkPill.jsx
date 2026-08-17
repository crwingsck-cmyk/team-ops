import { Link as LinkIcon, HardDrive, Youtube, Video, ClipboardList, FileText } from "lucide-react";

const LINK_TYPE_ICONS = {
  webpage: LinkIcon,
  google_form: FileText,
  google_drive: HardDrive,
  youtube: Youtube,
  zoom: Video,
  registration: ClipboardList,
  other: LinkIcon,
};

export default function LinkPill({ link, size = 18 }) {
  const Icon = LINK_TYPE_ICONS[link.type] || LinkIcon;
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="flex items-center gap-1.5 text-lg text-indigo-600 font-bold min-w-0 max-w-full"
    >
      <Icon size={size} className="shrink-0" />
      <span className="truncate min-w-0">{link.label || link.url}</span>
    </a>
  );
}
