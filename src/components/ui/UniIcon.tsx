/**
 * Famille d'icônes UniFlow (spécification : `docs/icones-uniflow.md`).
 *
 * Phosphor Icons, parce que la même bibliothèque existe sur le mobile et le
 * desktop Flutter : un nom sémantique (`dashboard`, `schedule`…) désigne la
 * même icône sur les trois plateformes. Graisses : `duotone` par défaut,
 * `fill` pour l'entrée de navigation active, `bold` pour le chrome.
 *
 * Trois composants :
 * - `UniIcon`     : icône par nom sémantique ;
 * - `SubjectIcon` : icône d'une matière dérivée de son nom (`subjectIconName`) ;
 * - `IconTile`    : tuile colorée animée (variantes `filled` / `soft`, 36/44/56 px).
 */
import type { CSSProperties, ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  AddressBook, AndroidLogo, AppleLogo, ArrowLeft, ArrowRight, ArrowSquareOut, ArrowsClockwise, Atom, Barbell, BellRinging, BellSlash, BookBookmark, BookOpen, BookOpenText,
  Books, Brain, Broadcast, Buildings, CalendarBlank, CalendarCheck, Camera, CaretDown, CaretLeft, CaretRight, Chalkboard,
  ChalkboardTeacher, ChartBar, ChartLine, ChartLineUp, ChatsCircle, Check, CheckCircle, CheckSquare, CircleNotch, ClipboardText,
  Clock, Cloud, Code, Coins, CreditCard, Database, Desktop, DeviceMobile, Dna, Door, DownloadSimple, Envelope, Eye, EyeSlash, Feather,
  FileText, FilmSlate, FirstAid, Flask, FloppyDisk, Funnel, GearSix, Globe, GlobeHemisphereWest, GraduationCap, HardDrives, House, Info,
  Kanban, Key, Lightning, LinuxLogo, List, LockKey, MagnifyingGlass, MapPin, MathOperations, Medal, Megaphone, Moon, MusicNotes, Network,
  Palette, Paperclip, PencilSimple, Play, Plus, PlusCircle, Printer, Pulse, QrCode, Question, Rocket, Scales, Scroll,
  ShieldCheck, SignOut, Sparkle, SpeakerHigh, SpeakerSlash, SquaresFour, Stack, Star, Terminal, Translate, Trash, Trophy,
  UploadSimple, User, UserCircle, UserGear, Users, UsersFour, UsersThree, VideoCamera, Warning, WarningCircle, WifiHigh,
  WifiSlash, WindowsLogo, X, XCircle,
  type Icon, type IconProps, type IconWeight,
} from '@phosphor-icons/react'
import { cn } from '../../utils/cn'
import { darkenHex, hexWithAlpha, subjectIconName, type SubjectIconName } from '../../lib/subjectIcon'

export type { Icon as UniIconComponent, IconWeight as UniIconWeight }

/** Table sémantique commune aux trois plateformes, plus le chrome (retour, fermer, actualiser…). */
export const UNI_ICONS = {
  // Table de la spécification
  dashboard: SquaresFour,
  schedule: CalendarBlank,
  courses: BookOpenText,
  courseUnit: BookBookmark,
  assignments: ClipboardText,
  grades: ChartLineUp,
  attendance: QrCode,
  messages: ChatsCircle,
  forum: UsersThree,
  library: Books,
  directory: AddressBook,
  accounts: UserGear,
  students: GraduationCap,
  teachers: Chalkboard,
  teacher: ChalkboardTeacher,
  billing: CreditCard,
  settings: GearSix,
  badges: Medal,
  assistant: Sparkle,
  video: VideoCamera,
  notifications: BellRinging,
  profile: UserCircle,
  agenda: CalendarCheck,
  tasks: CheckSquare,
  university: Buildings,
  room: Door,
  time: Clock,
  stats: ChartBar,
  team: UsersFour,
  help: Question,
  about: Info,
  security: ShieldCheck,
  search: MagnifyingGlass,
  add: PlusCircle,
  logout: SignOut,
  back: ArrowLeft,
  // Chrome et états (hors table, mais même famille)
  home: House,
  menu: List,
  close: X,
  plus: Plus,
  forward: ArrowRight,
  chevronRight: CaretRight,
  chevronLeft: CaretLeft,
  chevronDown: CaretDown,
  refresh: ArrowsClockwise,
  spinner: CircleNotch,
  check: Check,
  success: CheckCircle,
  warning: Warning,
  error: XCircle,
  alert: WarningCircle,
  download: DownloadSimple,
  upload: UploadSimple,
  trash: Trash,
  edit: PencilSimple,
  save: FloppyDisk,
  filter: Funnel,
  eye: Eye,
  eyeOff: EyeSlash,
  camera: Camera,
  mail: Envelope,
  globe: Globe,
  moon: Moon,
  lock: LockKey,
  key: Key,
  bellOff: BellSlash,
  sound: SpeakerHigh,
  soundOff: SpeakerSlash,
  wifi: WifiHigh,
  wifiOff: WifiSlash,
  online: WifiHigh,
  offline: WifiSlash,
  star: Star,
  lightning: Lightning,
  trophy: Trophy,
  megaphone: Megaphone,
  pin: MapPin,
  user: User,
  users: Users,
  play: Play,
  film: FilmSlate,
  document: FileText,
  paperclip: Paperclip,
  print: Printer,
  layers: Stack,
  activity: Pulse,
  database: Database,
  cloud: Cloud,
  code: Code,
  network: Network,
  brain: Brain,
  coins: Coins,
  audience: Broadcast,
  server: HardDrives,
  externalLink: ArrowSquareOut,
  // Plateformes des applications à télécharger (landing, pied de page, admin).
  android: AndroidLogo,
  mobile: DeviceMobile,
  desktop: Desktop,
  windows: WindowsLogo,
  linux: LinuxLogo,
  apple: AppleLogo,
} as const satisfies Record<string, Icon>

export type UniIconName = keyof typeof UNI_ICONS

/** Icônes de matière : mêmes noms que `subjectIconName` renvoie. */
export const SUBJECT_ICONS: Record<SubjectIconName, Icon> = {
  MathOperations, Atom, Flask, Dna, Network, Database, Globe, DeviceMobile, ShieldCheck, Brain, Cloud, ChartLine,
  Translate, Rocket, Kanban, Terminal, Code, Coins, Scales, Scroll, GlobeHemisphereWest, Lightning, MusicNotes, Palette,
  Barbell, FirstAid, Broadcast, Feather, BookOpen,
}

type BaseIconProps = Omit<IconProps, 'ref' | 'weight'> & { weight?: IconWeight }

/**
 * Les icônes sont décoratives (le libellé est toujours à côté) : `aria-hidden`
 * par défaut. Passer `alt` pour une icône porteuse de sens (Phosphor rend un
 * `<title>`), ce qui lève le masquage.
 */
function accessibility(props: BaseIconProps) {
  return props.alt || props['aria-label'] ? {} : { 'aria-hidden': true as const, focusable: 'false' as const }
}

export interface UniIconProps extends BaseIconProps {
  name: UniIconName
}

export function UniIcon({ name, weight = 'duotone', ...props }: UniIconProps) {
  const Component = UNI_ICONS[name]
  return <Component weight={weight} {...accessibility(props)} data-icon={name} {...props} />
}

export interface SubjectIconProps extends BaseIconProps {
  /** Nom de la matière ou du cours ; l'icône en est dérivée. */
  subject: string | null | undefined
  code?: string | null
}

export function SubjectIcon({ subject, code, weight = 'duotone', ...props }: SubjectIconProps) {
  const iconName = subjectIconName(subject, code)
  const Component = SUBJECT_ICONS[iconName]
  return <Component weight={weight} {...accessibility(props)} data-icon={iconName} {...props} />
}

export interface NavIconProps {
  name: UniIconName
  active: boolean
  size?: number
  className?: string
}

/**
 * Icône de navigation : `fill` quand l'entrée est active, `bold` sinon. Le
 * changement de graisse remplace les tracés SVG (rien à interpoler) ; c'est le
 * léger ressort d'échelle qui rend la bascule visible.
 */
export function NavIcon({ name, active, size = 18, className }: NavIconProps) {
  const reducedMotion = useReducedMotion()
  return (
    <motion.span
      className={cn('inline-flex shrink-0 items-center justify-center', className)}
      animate={{ scale: active ? 1.1 : 1 }}
      transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 22 }}
    >
      <UniIcon name={name} weight={active ? 'fill' : 'bold'} size={size} />
    </motion.span>
  )
}

export type IconTileVariant = 'filled' | 'soft'
export type IconTileSize = 36 | 44 | 56

export interface IconTileProps {
  /** Icône par nom sémantique… */
  name?: UniIconName
  /** …ou composant Phosphor explicite (prioritaire)… */
  icon?: Icon
  /** …ou matière dont l'icône est dérivée du nom. */
  subject?: string | null
  subjectCode?: string | null
  /** Couleur `#RRGGBB` de la tuile (dégradé sur `filled`, teinte sur `soft`). */
  color: string
  variant?: IconTileVariant
  size?: IconTileSize
  /** Position dans une liste : décale l'apparition de 40 ms par index. */
  index?: number
  weight?: IconWeight
  className?: string
  /** Contenu superposé (pastille, compteur). */
  children?: ReactNode
  title?: string
}

const TILE_RADIUS: Record<IconTileSize, number> = { 36: 14, 44: 14, 56: 16 }
const TILE_ICON: Record<IconTileSize, number> = { 36: 18, 44: 22, 56: 28 }

/** Courbe « easeOutBack » douce : léger dépassement avant de se poser, comme sur mobile et desktop. */
const EASE_OUT_BACK: [number, number, number, number] = [0.34, 1.56, 0.64, 1]

export function IconTile({ name, icon, subject, subjectCode, color, variant = 'filled', size = 44, index = 0, weight = 'duotone', className, children, title }: IconTileProps) {
  const reducedMotion = useReducedMotion()
  const Component: Icon = icon ?? (name ? UNI_ICONS[name] : SUBJECT_ICONS[subjectIconName(subject, subjectCode)])
  const iconName = icon ? undefined : name ?? subjectIconName(subject, subjectCode)
  const restingShadow = variant === 'filled' ? `0 8px 20px -6px ${hexWithAlpha(color, 0.25)}` : 'none'
  const hoverShadow = variant === 'filled' ? `0 14px 26px -8px ${hexWithAlpha(color, 0.45)}` : `0 8px 18px -8px ${hexWithAlpha(color, 0.3)}`

  const style: CSSProperties = {
    width: size,
    height: size,
    borderRadius: TILE_RADIUS[size],
    boxShadow: restingShadow,
    ...(variant === 'filled'
      ? { backgroundImage: `linear-gradient(135deg, ${color} 0%, ${darkenHex(color, 0.28)} 100%)`, color: '#ffffff' }
      : { backgroundColor: hexWithAlpha(color, 0.14), color }),
  }

  return (
    <motion.span
      data-variant={variant}
      data-size={size}
      data-icon={iconName}
      title={title}
      className={cn('uni-icon-tile relative inline-flex shrink-0 items-center justify-center overflow-hidden', className)}
      style={style}
      initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reducedMotion ? { duration: 0 } : { delay: index * 0.04, duration: 0.45, ease: EASE_OUT_BACK }}
      whileHover={reducedMotion ? undefined : { y: -2, boxShadow: hoverShadow }}
    >
      <Component size={TILE_ICON[size]} weight={weight} aria-hidden="true" focusable="false" />
      {children}
    </motion.span>
  )
}
