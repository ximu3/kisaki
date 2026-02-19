/**
 * UI Components Aggregation for Plugin SDK
 *
 * This file aggregates all UI components for injection into the plugin global.
 * DO NOT import from this file in app code - use direct imports from components/ui/*.
 */

// Alert Dialog
export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from '../../components/ui/alert-dialog'

// Button Group
export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants
} from '../../components/ui/button-group'

// Card
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction
} from '../../components/ui/card'

// Collapsible
export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleGroup,
  collapsibleGroupVariants,
  CollapsibleGroupTrigger,
  collapsibleGroupTriggerVariants,
  CollapsibleGroupToggle,
  collapsibleGroupToggleVariants,
  CollapsibleGroupLabel,
  CollapsibleGroupCount,
  CollapsibleGroupContent,
  collapsibleGroupContentVariants
} from '../../components/ui/collapsible'

// Command
export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  useCommand,
  provideCommandContext,
  useCommandGroup,
  provideCommandGroupContext
} from '../../components/ui/command'

// Context Menu
export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuGroup,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuShortcut
} from '../../components/ui/context-menu'

// Dialog
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogOverlay,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter
} from '../../components/ui/dialog'

// Dropdown Menu
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '../../components/ui/dropdown-menu'

// Empty
export {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from '../../components/ui/empty'

// Field
export {
  Field,
  FieldGroup,
  FieldContent,
  FieldLabel,
  FieldDescription,
  FieldSet,
  FieldLegend,
  FieldTitle,
  FieldSeparator,
  FieldError
} from '../../components/ui/field'

// Hover Card
export { HoverCard, HoverCardTrigger, HoverCardContent } from '../../components/ui/hover-card'

// Input Group
export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea
} from '../../components/ui/input-group'

// Popover
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from '../../components/ui/popover'

// Radio Group
export { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group'

// Resizable
export {
  ResizableLayout,
  ResizablePanel,
  ResizableHandle,
  useResizable
} from '../../components/ui/resizable'

// Segmented Control
export { SegmentedControl, SegmentedControlItem } from '../../components/ui/segmented-control'

// Select
export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton
} from '../../components/ui/select'

// Slider
export { Slider } from '../../components/ui/slider'

// Table
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption
} from '../../components/ui/table'

// Tabs
export { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs'

// Tooltip
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '../../components/ui/tooltip'

// Standalone UI Components
export { Badge } from '../../components/ui/badge'
export { Button } from '../../components/ui/button'
export { Checkbox } from '../../components/ui/checkbox'
export { DeleteConfirmDialog } from '../../components/ui/delete-confirm-dialog'
export { Form } from '../../components/ui/form'
export { HoverScaleImage } from '../../components/ui/hover-scale-image'
export { MarkdownEditor } from '../../components/ui/markdown'
export { Icon } from '../../components/ui/icon'
export { ImageCropperDialog } from '../../components/ui/image-cropper-dialog'
export { Input } from '../../components/ui/input'
export { Label } from '../../components/ui/label'
export { LocaleSelect } from '../../components/ui/locale-select'
export { Progress } from '../../components/ui/progress'
export { SectionHeader } from '../../components/ui/section-header'
export { Separator } from '../../components/ui/separator'
export { Spinner } from '../../components/ui/spinner'
export { Switch } from '../../components/ui/switch'
export { Textarea } from '../../components/ui/textarea'
export { Toaster } from '../../components/ui/toaster'
export { VirtualGrid, VirtualHorizontalScroll, VirtualList } from '../../components/ui/virtual'
export { VirtualizedCombobox } from '../../components/ui/virtualized-combobox'
