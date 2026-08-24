/**
 * Lucide-backed icon compatibility layer for the dsh Web UI.
 *
 * Public export names and `{ size, className }` stay stable so every existing
 * consumer keeps its contract. The session-tree corner remains exact product
 * geometry because it is a connector, not a semantic glyph.
 */
import {
  Archive,
  ArrowUpRight,
  BookOpenCheck,
  Brain,
  Braces,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  CircleX,
  Code2,
  Copy,
  Database,
  Download,
  Ellipsis,
  FolderClosed,
  FolderOpen,
  FolderPlus,
  FolderSearch,
  GitBranch,
  Globe,
  Link,
  ListChecks,
  ListOrdered,
  ListTodo,
  LoaderCircle,
  Maximize,
  MessageCirclePlus,
  MonitorCog,
  Moon,
  PanelLeft,
  Paperclip,
  Pause,
  Pencil,
  Play,
  PlugZap,
  Plus,
  RefreshCw,
  ScanSearch,
  Search,
  Send,
  Settings,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Square,
  Sun,
  Target,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  TriangleAlert,
  User,
  WandSparkles,
  Workflow,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { IconProps } from './props.ts'

export type { IconProps } from './props.ts'

interface LucideAdapterOptions {
  /** Fill a glyph whose legacy export represents a selected or solid state. */
  fill?: boolean
}

function lucideIcon(
  Glyph: LucideIcon,
  defaultSize: number,
  options: LucideAdapterOptions = {},
) {
  return function DshLucideIcon({ size = defaultSize, className }: IconProps) {
    return (
      <Glyph
        size={size}
        className={className}
        aria-hidden={false}
        {...options.fill === true ? { fill: 'currentColor' } : {}}
      />
    )
  }
}

/** Start a new conversation. */
export const IconNewChatOutline16 = lucideIcon(MessageCirclePlus, 16)
/** Search. */
export const IconSearchOutline16 = lucideIcon(Search, 16)
/** Web or global scope. */
export const IconGlobeOutline14 = lucideIcon(Globe, 14)
/** Settings at 14 px. */
export const IconSettingsOutline14 = lucideIcon(Settings, 14)
/** Settings at 16 px. */
export const IconSettingsOutline16 = lucideIcon(Settings, 16)
/** Left panel. */
export const IconPanelLeftOutline16 = lucideIcon(PanelLeft, 16)
/** More actions. */
export const IconEllipsisOutline16 = lucideIcon(Ellipsis, 16)
/** Add. */
export const IconPlusOutline16 = lucideIcon(Plus, 16)
/** Check at 16 px. */
export const IconCheckOutline16 = lucideIcon(Check, 16)
/** Check at 14 px. */
export const IconCheckOutline14 = lucideIcon(Check, 14)
/** Branch or fork. */
export const IconBranchOutline16 = lucideIcon(GitBranch, 16)
/** Expand downward. */
export const IconChevronDownOutline14 = lucideIcon(ChevronDown, 14)
/** Navigate left. */
export const IconChevronLeftOutline14 = lucideIcon(ChevronLeft, 14)
/** Navigate right. */
export const IconChevronRightOutline14 = lucideIcon(ChevronRight, 14)
/** Filled right-pointing disclosure. */
export const IconTriangleRightFill14 = lucideIcon(Play, 14, { fill: true })
/** Collapse upward. */
export const IconChevronUpOutline14 = lucideIcon(ChevronUp, 14)
/** Close. */
export const IconCloseOutline16 = lucideIcon(X, 16)
/** Close in a bounded circle. */
export const IconCloseFill14 = lucideIcon(CircleX, 14)
/** Copy. */
export const IconCopyOutline16 = lucideIcon(Copy, 16)
/** Refresh at 16 px. */
export const IconRefreshOutline16 = lucideIcon(RefreshCw, 16)
/** Refresh at 14 px. */
export const IconRefreshOutline14 = lucideIcon(RefreshCw, 14)
/** Positive feedback. */
export const IconLikeOutline16 = lucideIcon(ThumbsUp, 16)
/** Selected positive feedback. */
export const IconLikeFill16 = lucideIcon(ThumbsUp, 16, { fill: true })
/** Negative feedback. */
export const IconDislikeOutline16 = lucideIcon(ThumbsDown, 16)
/** Selected negative feedback. */
export const IconDislikeFill16 = lucideIcon(ThumbsDown, 16, { fill: true })
/** Share. */
export const IconShareOutline16 = lucideIcon(Share2, 16)
/** Edit. */
export const IconEditOutline16 = lucideIcon(Pencil, 16)
/** Reasoning at 14 px. */
export const IconThinkOutline14 = lucideIcon(Brain, 14)
/** Reasoning at 16 px. */
export const IconThinkOutline16 = lucideIcon(Brain, 16)
/** Agent preset composition. */
export const IconAgentPresetOutline16 = lucideIcon(Workflow, 16)
/** Browse files. */
export const IconBrowseOutline16 = lucideIcon(FolderSearch, 16)
/** Link at 14 px. */
export const IconLinkOutline14 = lucideIcon(Link, 14)
/** Link at 16 px. */
export const IconLinkOutline16 = lucideIcon(Link, 16)
/** Open an external target at compact size. */
export const IconRightUpOutline14 = lucideIcon(ArrowUpRight, 8)
/** Open an external target. */
export const IconRightUpOutline16 = lucideIcon(ArrowUpRight, 16)
/** Enhance content. */
export const IconEnhanceOutline16 = lucideIcon(WandSparkles, 16)
/** Delete. */
export const IconTrashOutline16 = lucideIcon(Trash2, 16)
/** Warning. */
export const IconWarningOutline16 = lucideIcon(TriangleAlert, 14)
/** User. */
export const IconUserOutline16 = lucideIcon(User, 16)
/** Send at 16 px. */
export const IconSendOutline16 = lucideIcon(Send, 16)
/** Stop. */
export const IconStopFill16 = lucideIcon(Square, 16, { fill: true })
/** Attach a file. */
export const IconPaperclipOutline16 = lucideIcon(Paperclip, 16)
/** Loading. */
export const IconLoadingOutline16 = lucideIcon(LoaderCircle, 16)
/** Download. */
export const IconDownloadOutline16 = lucideIcon(Download, 16)
/** Play. */
export const IconPlayOutline16 = lucideIcon(Play, 16)
/** Pause. */
export const IconPauseOutline16 = lucideIcon(Pause, 16)
/** Fullscreen. */
export const IconFullscreenOutline16 = lucideIcon(Maximize, 16)
/** Source code. */
export const IconCodeOutline16 = lucideIcon(Code2, 16)
/** Cordis plugin. */
export const IconCordisPluginOutline14 = lucideIcon(PlugZap, 14)
/** API or structured call. */
export const IconApiOutline14 = lucideIcon(Braces, 14)
/** Personalization controls. */
export const IconPersonalizationOutline16 = lucideIcon(SlidersHorizontal, 16)
/** Add a project. */
export const IconProjectAddOutline16 = lucideIcon(FolderPlus, 16)
/** Open folder. */
export const IconFolderOpenOutline16 = lucideIcon(FolderOpen, 16)
/** Open folder in the workspace tree. */
export const IconFolderOpen16 = lucideIcon(FolderOpen, 16)
/** Closed folder. */
export const IconFolderClose16 = lucideIcon(FolderClosed, 16)

/** Exact session-tree corner connector; not a semantic Lucide glyph. */
export const IconTreeCorner8x10 = ({ size = 10, className }: IconProps) => (
  <svg width={(size * 8) / 10} height={size} className={className} viewBox="-0.5 0 8.5 10.5" fill="none">
    <path d="M0 0L-0.5 0L-0.5 7L0 7L0.5 7L0.5 0L0 0ZM3 10L3 10.5L8 10.5L8 10L8 9.5L3 9.5L3 10ZM0 7L-0.5 7C-0.5 8.933 1.067 10.5 3 10.5L3 10L3 9.5C1.61929 9.5 0.5 8.38071 0.5 7L0 7Z" fill="currentColor" />
  </svg>
)

/** Light theme. */
export const IconLightOutline16 = lucideIcon(Sun, 16)
/** Dark theme. */
export const IconDarkOutline16 = lucideIcon(Moon, 16)
/** Follow the operating-system theme. */
export const IconFollowsystemOutline16 = lucideIcon(MonitorCog, 16)
/** Data storage. */
export const IconDataOutline16 = lucideIcon(Database, 16)
/** Send at 14 px. */
export const IconSendOutline14 = lucideIcon(Send, 14)
/** Queued work. */
export const IconQueueOutline14 = lucideIcon(ListOrdered, 14)
/** Checklist. */
export const IconChecklistOutline14 = lucideIcon(ListChecks, 14)
/** Editable task list. */
export const IconListPenOutline16 = lucideIcon(ListTodo, 16)
/** Goal. */
export const IconGoalOutline16 = lucideIcon(Target, 16)
/** Sparkle. */
export const IconSparkle16 = lucideIcon(Sparkles, 16)
/** Inspect. */
export const IconInspectOutline12 = lucideIcon(ScanSearch, 12)
/** Skill. */
export const IconSkillOutline16 = lucideIcon(BookOpenCheck, 16)
/** Help or question. */
export const IconQuestionOutline14 = lucideIcon(CircleHelp, 14)
/** Archive. */
export const IconArchiveOutline20 = lucideIcon(Archive, 20)
