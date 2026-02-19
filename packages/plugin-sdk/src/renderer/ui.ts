/**
 * Kisaki Plugin SDK - Renderer Process UI Components
 *
 * All UI components for building plugin interfaces.
 *
 * @example
 * import { Button, Dialog, DialogContent } from '@kisaki/plugin-sdk/renderer/ui'
 */

import type { KisakiRendererAPI } from '../types/renderer.plugin'

const w = (typeof window !== 'undefined' ? window : globalThis) as unknown as {
  kisaki: KisakiRendererAPI
}

// =============================================================================
// Alert Dialog
// =============================================================================

export const AlertDialog: KisakiRendererAPI['ui']['AlertDialog'] = w.kisaki.ui.AlertDialog
export const AlertDialogTrigger: KisakiRendererAPI['ui']['AlertDialogTrigger'] =
  w.kisaki.ui.AlertDialogTrigger
export const AlertDialogContent: KisakiRendererAPI['ui']['AlertDialogContent'] =
  w.kisaki.ui.AlertDialogContent
export const AlertDialogHeader: KisakiRendererAPI['ui']['AlertDialogHeader'] =
  w.kisaki.ui.AlertDialogHeader
export const AlertDialogTitle: KisakiRendererAPI['ui']['AlertDialogTitle'] =
  w.kisaki.ui.AlertDialogTitle
export const AlertDialogDescription: KisakiRendererAPI['ui']['AlertDialogDescription'] =
  w.kisaki.ui.AlertDialogDescription
export const AlertDialogFooter: KisakiRendererAPI['ui']['AlertDialogFooter'] =
  w.kisaki.ui.AlertDialogFooter
export const AlertDialogAction: KisakiRendererAPI['ui']['AlertDialogAction'] =
  w.kisaki.ui.AlertDialogAction
export const AlertDialogCancel: KisakiRendererAPI['ui']['AlertDialogCancel'] =
  w.kisaki.ui.AlertDialogCancel

// =============================================================================
// Button Group
// =============================================================================

export const ButtonGroup: KisakiRendererAPI['ui']['ButtonGroup'] = w.kisaki.ui.ButtonGroup
export const ButtonGroupSeparator: KisakiRendererAPI['ui']['ButtonGroupSeparator'] =
  w.kisaki.ui.ButtonGroupSeparator
export const ButtonGroupText: KisakiRendererAPI['ui']['ButtonGroupText'] =
  w.kisaki.ui.ButtonGroupText
export const buttonGroupVariants: KisakiRendererAPI['ui']['buttonGroupVariants'] =
  w.kisaki.ui.buttonGroupVariants

// =============================================================================
// Card
// =============================================================================

export const Card: KisakiRendererAPI['ui']['Card'] = w.kisaki.ui.Card
export const CardHeader: KisakiRendererAPI['ui']['CardHeader'] = w.kisaki.ui.CardHeader
export const CardTitle: KisakiRendererAPI['ui']['CardTitle'] = w.kisaki.ui.CardTitle
export const CardDescription: KisakiRendererAPI['ui']['CardDescription'] =
  w.kisaki.ui.CardDescription
export const CardContent: KisakiRendererAPI['ui']['CardContent'] = w.kisaki.ui.CardContent
export const CardFooter: KisakiRendererAPI['ui']['CardFooter'] = w.kisaki.ui.CardFooter
export const CardAction: KisakiRendererAPI['ui']['CardAction'] = w.kisaki.ui.CardAction

// =============================================================================
// Collapsible
// =============================================================================

export const Collapsible: KisakiRendererAPI['ui']['Collapsible'] = w.kisaki.ui.Collapsible
export const CollapsibleTrigger: KisakiRendererAPI['ui']['CollapsibleTrigger'] =
  w.kisaki.ui.CollapsibleTrigger
export const CollapsibleContent: KisakiRendererAPI['ui']['CollapsibleContent'] =
  w.kisaki.ui.CollapsibleContent
export const CollapsibleGroup: KisakiRendererAPI['ui']['CollapsibleGroup'] =
  w.kisaki.ui.CollapsibleGroup
export const collapsibleGroupVariants: KisakiRendererAPI['ui']['collapsibleGroupVariants'] =
  w.kisaki.ui.collapsibleGroupVariants
export const CollapsibleGroupTrigger: KisakiRendererAPI['ui']['CollapsibleGroupTrigger'] =
  w.kisaki.ui.CollapsibleGroupTrigger
export const collapsibleGroupTriggerVariants: KisakiRendererAPI['ui']['collapsibleGroupTriggerVariants'] =
  w.kisaki.ui.collapsibleGroupTriggerVariants
export const CollapsibleGroupToggle: KisakiRendererAPI['ui']['CollapsibleGroupToggle'] =
  w.kisaki.ui.CollapsibleGroupToggle
export const collapsibleGroupToggleVariants: KisakiRendererAPI['ui']['collapsibleGroupToggleVariants'] =
  w.kisaki.ui.collapsibleGroupToggleVariants
export const CollapsibleGroupLabel: KisakiRendererAPI['ui']['CollapsibleGroupLabel'] =
  w.kisaki.ui.CollapsibleGroupLabel
export const CollapsibleGroupCount: KisakiRendererAPI['ui']['CollapsibleGroupCount'] =
  w.kisaki.ui.CollapsibleGroupCount
export const CollapsibleGroupContent: KisakiRendererAPI['ui']['CollapsibleGroupContent'] =
  w.kisaki.ui.CollapsibleGroupContent
export const collapsibleGroupContentVariants: KisakiRendererAPI['ui']['collapsibleGroupContentVariants'] =
  w.kisaki.ui.collapsibleGroupContentVariants

// =============================================================================
// Command
// =============================================================================

export const Command: KisakiRendererAPI['ui']['Command'] = w.kisaki.ui.Command
export const CommandDialog: KisakiRendererAPI['ui']['CommandDialog'] = w.kisaki.ui.CommandDialog
export const CommandEmpty: KisakiRendererAPI['ui']['CommandEmpty'] = w.kisaki.ui.CommandEmpty
export const CommandGroup: KisakiRendererAPI['ui']['CommandGroup'] = w.kisaki.ui.CommandGroup
export const CommandInput: KisakiRendererAPI['ui']['CommandInput'] = w.kisaki.ui.CommandInput
export const CommandItem: KisakiRendererAPI['ui']['CommandItem'] = w.kisaki.ui.CommandItem
export const CommandList: KisakiRendererAPI['ui']['CommandList'] = w.kisaki.ui.CommandList
export const CommandSeparator: KisakiRendererAPI['ui']['CommandSeparator'] =
  w.kisaki.ui.CommandSeparator
export const CommandShortcut: KisakiRendererAPI['ui']['CommandShortcut'] =
  w.kisaki.ui.CommandShortcut
export const useCommand: KisakiRendererAPI['ui']['useCommand'] = w.kisaki.ui.useCommand
export const provideCommandContext: KisakiRendererAPI['ui']['provideCommandContext'] =
  w.kisaki.ui.provideCommandContext
export const useCommandGroup: KisakiRendererAPI['ui']['useCommandGroup'] =
  w.kisaki.ui.useCommandGroup
export const provideCommandGroupContext: KisakiRendererAPI['ui']['provideCommandGroupContext'] =
  w.kisaki.ui.provideCommandGroupContext

// =============================================================================
// Context Menu
// =============================================================================

export const ContextMenu: KisakiRendererAPI['ui']['ContextMenu'] = w.kisaki.ui.ContextMenu
export const ContextMenuTrigger: KisakiRendererAPI['ui']['ContextMenuTrigger'] =
  w.kisaki.ui.ContextMenuTrigger
export const ContextMenuContent: KisakiRendererAPI['ui']['ContextMenuContent'] =
  w.kisaki.ui.ContextMenuContent
export const ContextMenuItem: KisakiRendererAPI['ui']['ContextMenuItem'] =
  w.kisaki.ui.ContextMenuItem
export const ContextMenuSeparator: KisakiRendererAPI['ui']['ContextMenuSeparator'] =
  w.kisaki.ui.ContextMenuSeparator
export const ContextMenuLabel: KisakiRendererAPI['ui']['ContextMenuLabel'] =
  w.kisaki.ui.ContextMenuLabel
export const ContextMenuGroup: KisakiRendererAPI['ui']['ContextMenuGroup'] =
  w.kisaki.ui.ContextMenuGroup
export const ContextMenuSub: KisakiRendererAPI['ui']['ContextMenuSub'] = w.kisaki.ui.ContextMenuSub
export const ContextMenuSubTrigger: KisakiRendererAPI['ui']['ContextMenuSubTrigger'] =
  w.kisaki.ui.ContextMenuSubTrigger
export const ContextMenuSubContent: KisakiRendererAPI['ui']['ContextMenuSubContent'] =
  w.kisaki.ui.ContextMenuSubContent
export const ContextMenuCheckboxItem: KisakiRendererAPI['ui']['ContextMenuCheckboxItem'] =
  w.kisaki.ui.ContextMenuCheckboxItem
export const ContextMenuRadioGroup: KisakiRendererAPI['ui']['ContextMenuRadioGroup'] =
  w.kisaki.ui.ContextMenuRadioGroup
export const ContextMenuRadioItem: KisakiRendererAPI['ui']['ContextMenuRadioItem'] =
  w.kisaki.ui.ContextMenuRadioItem
export const ContextMenuShortcut: KisakiRendererAPI['ui']['ContextMenuShortcut'] =
  w.kisaki.ui.ContextMenuShortcut

// =============================================================================
// Dialog
// =============================================================================

export const Dialog: KisakiRendererAPI['ui']['Dialog'] = w.kisaki.ui.Dialog
export const DialogTrigger: KisakiRendererAPI['ui']['DialogTrigger'] = w.kisaki.ui.DialogTrigger
export const DialogContent: KisakiRendererAPI['ui']['DialogContent'] = w.kisaki.ui.DialogContent
export const DialogOverlay: KisakiRendererAPI['ui']['DialogOverlay'] = w.kisaki.ui.DialogOverlay
export const DialogHeader: KisakiRendererAPI['ui']['DialogHeader'] = w.kisaki.ui.DialogHeader
export const DialogTitle: KisakiRendererAPI['ui']['DialogTitle'] = w.kisaki.ui.DialogTitle
export const DialogDescription: KisakiRendererAPI['ui']['DialogDescription'] =
  w.kisaki.ui.DialogDescription
export const DialogBody: KisakiRendererAPI['ui']['DialogBody'] = w.kisaki.ui.DialogBody
export const DialogFooter: KisakiRendererAPI['ui']['DialogFooter'] = w.kisaki.ui.DialogFooter

// =============================================================================
// Dropdown Menu
// =============================================================================

export const DropdownMenu: KisakiRendererAPI['ui']['DropdownMenu'] = w.kisaki.ui.DropdownMenu
export const DropdownMenuTrigger: KisakiRendererAPI['ui']['DropdownMenuTrigger'] =
  w.kisaki.ui.DropdownMenuTrigger
export const DropdownMenuContent: KisakiRendererAPI['ui']['DropdownMenuContent'] =
  w.kisaki.ui.DropdownMenuContent
export const DropdownMenuItem: KisakiRendererAPI['ui']['DropdownMenuItem'] =
  w.kisaki.ui.DropdownMenuItem
export const DropdownMenuCheckboxItem: KisakiRendererAPI['ui']['DropdownMenuCheckboxItem'] =
  w.kisaki.ui.DropdownMenuCheckboxItem
export const DropdownMenuRadioGroup: KisakiRendererAPI['ui']['DropdownMenuRadioGroup'] =
  w.kisaki.ui.DropdownMenuRadioGroup
export const DropdownMenuRadioItem: KisakiRendererAPI['ui']['DropdownMenuRadioItem'] =
  w.kisaki.ui.DropdownMenuRadioItem
export const DropdownMenuLabel: KisakiRendererAPI['ui']['DropdownMenuLabel'] =
  w.kisaki.ui.DropdownMenuLabel
export const DropdownMenuSeparator: KisakiRendererAPI['ui']['DropdownMenuSeparator'] =
  w.kisaki.ui.DropdownMenuSeparator
export const DropdownMenuShortcut: KisakiRendererAPI['ui']['DropdownMenuShortcut'] =
  w.kisaki.ui.DropdownMenuShortcut
export const DropdownMenuGroup: KisakiRendererAPI['ui']['DropdownMenuGroup'] =
  w.kisaki.ui.DropdownMenuGroup
export const DropdownMenuSub: KisakiRendererAPI['ui']['DropdownMenuSub'] =
  w.kisaki.ui.DropdownMenuSub
export const DropdownMenuSubTrigger: KisakiRendererAPI['ui']['DropdownMenuSubTrigger'] =
  w.kisaki.ui.DropdownMenuSubTrigger
export const DropdownMenuSubContent: KisakiRendererAPI['ui']['DropdownMenuSubContent'] =
  w.kisaki.ui.DropdownMenuSubContent

// =============================================================================
// Empty
// =============================================================================

export const Empty: KisakiRendererAPI['ui']['Empty'] = w.kisaki.ui.Empty
export const EmptyHeader: KisakiRendererAPI['ui']['EmptyHeader'] = w.kisaki.ui.EmptyHeader
export const EmptyMedia: KisakiRendererAPI['ui']['EmptyMedia'] = w.kisaki.ui.EmptyMedia
export const EmptyTitle: KisakiRendererAPI['ui']['EmptyTitle'] = w.kisaki.ui.EmptyTitle
export const EmptyDescription: KisakiRendererAPI['ui']['EmptyDescription'] =
  w.kisaki.ui.EmptyDescription
export const EmptyContent: KisakiRendererAPI['ui']['EmptyContent'] = w.kisaki.ui.EmptyContent

// =============================================================================
// Field
// =============================================================================

export const Field: KisakiRendererAPI['ui']['Field'] = w.kisaki.ui.Field
export const FieldGroup: KisakiRendererAPI['ui']['FieldGroup'] = w.kisaki.ui.FieldGroup
export const FieldContent: KisakiRendererAPI['ui']['FieldContent'] = w.kisaki.ui.FieldContent
export const FieldLabel: KisakiRendererAPI['ui']['FieldLabel'] = w.kisaki.ui.FieldLabel
export const FieldDescription: KisakiRendererAPI['ui']['FieldDescription'] =
  w.kisaki.ui.FieldDescription
export const FieldSet: KisakiRendererAPI['ui']['FieldSet'] = w.kisaki.ui.FieldSet
export const FieldLegend: KisakiRendererAPI['ui']['FieldLegend'] = w.kisaki.ui.FieldLegend
export const FieldTitle: KisakiRendererAPI['ui']['FieldTitle'] = w.kisaki.ui.FieldTitle
export const FieldSeparator: KisakiRendererAPI['ui']['FieldSeparator'] = w.kisaki.ui.FieldSeparator
export const FieldError: KisakiRendererAPI['ui']['FieldError'] = w.kisaki.ui.FieldError

// =============================================================================
// Hover Card
// =============================================================================

export const HoverCard: KisakiRendererAPI['ui']['HoverCard'] = w.kisaki.ui.HoverCard
export const HoverCardTrigger: KisakiRendererAPI['ui']['HoverCardTrigger'] =
  w.kisaki.ui.HoverCardTrigger
export const HoverCardContent: KisakiRendererAPI['ui']['HoverCardContent'] =
  w.kisaki.ui.HoverCardContent

// =============================================================================
// Input Group
// =============================================================================

export const InputGroup: KisakiRendererAPI['ui']['InputGroup'] = w.kisaki.ui.InputGroup
export const InputGroupAddon: KisakiRendererAPI['ui']['InputGroupAddon'] =
  w.kisaki.ui.InputGroupAddon
export const InputGroupButton: KisakiRendererAPI['ui']['InputGroupButton'] =
  w.kisaki.ui.InputGroupButton
export const InputGroupText: KisakiRendererAPI['ui']['InputGroupText'] = w.kisaki.ui.InputGroupText
export const InputGroupInput: KisakiRendererAPI['ui']['InputGroupInput'] =
  w.kisaki.ui.InputGroupInput
export const InputGroupTextarea: KisakiRendererAPI['ui']['InputGroupTextarea'] =
  w.kisaki.ui.InputGroupTextarea

// =============================================================================
// Popover
// =============================================================================

export const Popover: KisakiRendererAPI['ui']['Popover'] = w.kisaki.ui.Popover
export const PopoverTrigger: KisakiRendererAPI['ui']['PopoverTrigger'] = w.kisaki.ui.PopoverTrigger
export const PopoverContent: KisakiRendererAPI['ui']['PopoverContent'] = w.kisaki.ui.PopoverContent
export const PopoverAnchor: KisakiRendererAPI['ui']['PopoverAnchor'] = w.kisaki.ui.PopoverAnchor

// =============================================================================
// Radio Group
// =============================================================================

export const RadioGroup: KisakiRendererAPI['ui']['RadioGroup'] = w.kisaki.ui.RadioGroup
export const RadioGroupItem: KisakiRendererAPI['ui']['RadioGroupItem'] = w.kisaki.ui.RadioGroupItem

// =============================================================================
// Resizable
// =============================================================================

export const ResizableLayout: KisakiRendererAPI['ui']['ResizableLayout'] =
  w.kisaki.ui.ResizableLayout
export const ResizablePanel: KisakiRendererAPI['ui']['ResizablePanel'] = w.kisaki.ui.ResizablePanel
export const ResizableHandle: KisakiRendererAPI['ui']['ResizableHandle'] =
  w.kisaki.ui.ResizableHandle
export const useResizable: KisakiRendererAPI['ui']['useResizable'] = w.kisaki.ui.useResizable

// =============================================================================
// Segmented Control
// =============================================================================

export const SegmentedControl: KisakiRendererAPI['ui']['SegmentedControl'] =
  w.kisaki.ui.SegmentedControl
export const SegmentedControlItem: KisakiRendererAPI['ui']['SegmentedControlItem'] =
  w.kisaki.ui.SegmentedControlItem

// =============================================================================
// Select
// =============================================================================

export const Select: KisakiRendererAPI['ui']['Select'] = w.kisaki.ui.Select
export const SelectTrigger: KisakiRendererAPI['ui']['SelectTrigger'] = w.kisaki.ui.SelectTrigger
export const SelectValue: KisakiRendererAPI['ui']['SelectValue'] = w.kisaki.ui.SelectValue
export const SelectContent: KisakiRendererAPI['ui']['SelectContent'] = w.kisaki.ui.SelectContent
export const SelectItem: KisakiRendererAPI['ui']['SelectItem'] = w.kisaki.ui.SelectItem
export const SelectGroup: KisakiRendererAPI['ui']['SelectGroup'] = w.kisaki.ui.SelectGroup
export const SelectLabel: KisakiRendererAPI['ui']['SelectLabel'] = w.kisaki.ui.SelectLabel
export const SelectSeparator: KisakiRendererAPI['ui']['SelectSeparator'] =
  w.kisaki.ui.SelectSeparator
export const SelectScrollUpButton: KisakiRendererAPI['ui']['SelectScrollUpButton'] =
  w.kisaki.ui.SelectScrollUpButton
export const SelectScrollDownButton: KisakiRendererAPI['ui']['SelectScrollDownButton'] =
  w.kisaki.ui.SelectScrollDownButton

// =============================================================================
// Slider
// =============================================================================

export const Slider: KisakiRendererAPI['ui']['Slider'] = w.kisaki.ui.Slider

// =============================================================================
// Table
// =============================================================================

export const Table: KisakiRendererAPI['ui']['Table'] = w.kisaki.ui.Table
export const TableHeader: KisakiRendererAPI['ui']['TableHeader'] = w.kisaki.ui.TableHeader
export const TableBody: KisakiRendererAPI['ui']['TableBody'] = w.kisaki.ui.TableBody
export const TableFooter: KisakiRendererAPI['ui']['TableFooter'] = w.kisaki.ui.TableFooter
export const TableRow: KisakiRendererAPI['ui']['TableRow'] = w.kisaki.ui.TableRow
export const TableHead: KisakiRendererAPI['ui']['TableHead'] = w.kisaki.ui.TableHead
export const TableCell: KisakiRendererAPI['ui']['TableCell'] = w.kisaki.ui.TableCell
export const TableCaption: KisakiRendererAPI['ui']['TableCaption'] = w.kisaki.ui.TableCaption

// =============================================================================
// Tabs
// =============================================================================

export const Tabs: KisakiRendererAPI['ui']['Tabs'] = w.kisaki.ui.Tabs
export const TabsList: KisakiRendererAPI['ui']['TabsList'] = w.kisaki.ui.TabsList
export const TabsTrigger: KisakiRendererAPI['ui']['TabsTrigger'] = w.kisaki.ui.TabsTrigger
export const TabsContent: KisakiRendererAPI['ui']['TabsContent'] = w.kisaki.ui.TabsContent

// =============================================================================
// Tooltip
// =============================================================================

export const Tooltip: KisakiRendererAPI['ui']['Tooltip'] = w.kisaki.ui.Tooltip
export const TooltipTrigger: KisakiRendererAPI['ui']['TooltipTrigger'] = w.kisaki.ui.TooltipTrigger
export const TooltipContent: KisakiRendererAPI['ui']['TooltipContent'] = w.kisaki.ui.TooltipContent
export const TooltipProvider: KisakiRendererAPI['ui']['TooltipProvider'] =
  w.kisaki.ui.TooltipProvider

// =============================================================================
// Standalone Components
// =============================================================================

export const Badge: KisakiRendererAPI['ui']['Badge'] = w.kisaki.ui.Badge
export const Button: KisakiRendererAPI['ui']['Button'] = w.kisaki.ui.Button
export const Checkbox: KisakiRendererAPI['ui']['Checkbox'] = w.kisaki.ui.Checkbox
export const DeleteConfirmDialog: KisakiRendererAPI['ui']['DeleteConfirmDialog'] =
  w.kisaki.ui.DeleteConfirmDialog
export const Form: KisakiRendererAPI['ui']['Form'] = w.kisaki.ui.Form
export const HoverScaleImage: KisakiRendererAPI['ui']['HoverScaleImage'] =
  w.kisaki.ui.HoverScaleImage
export const MarkdownEditor: KisakiRendererAPI['ui']['MarkdownEditor'] = w.kisaki.ui.MarkdownEditor
export const Icon: KisakiRendererAPI['ui']['Icon'] = w.kisaki.ui.Icon
export const ImageCropperDialog: KisakiRendererAPI['ui']['ImageCropperDialog'] =
  w.kisaki.ui.ImageCropperDialog
export const Input: KisakiRendererAPI['ui']['Input'] = w.kisaki.ui.Input
export const Label: KisakiRendererAPI['ui']['Label'] = w.kisaki.ui.Label
export const LocaleSelect: KisakiRendererAPI['ui']['LocaleSelect'] = w.kisaki.ui.LocaleSelect
export const Progress: KisakiRendererAPI['ui']['Progress'] = w.kisaki.ui.Progress
export const SectionHeader: KisakiRendererAPI['ui']['SectionHeader'] = w.kisaki.ui.SectionHeader
export const Separator: KisakiRendererAPI['ui']['Separator'] = w.kisaki.ui.Separator
export const Spinner: KisakiRendererAPI['ui']['Spinner'] = w.kisaki.ui.Spinner
export const Switch: KisakiRendererAPI['ui']['Switch'] = w.kisaki.ui.Switch
export const Textarea: KisakiRendererAPI['ui']['Textarea'] = w.kisaki.ui.Textarea
export const Toaster: KisakiRendererAPI['ui']['Toaster'] = w.kisaki.ui.Toaster
export const VirtualGrid: KisakiRendererAPI['ui']['VirtualGrid'] = w.kisaki.ui.VirtualGrid
export const VirtualHorizontalScroll: KisakiRendererAPI['ui']['VirtualHorizontalScroll'] =
  w.kisaki.ui.VirtualHorizontalScroll
export const VirtualList: KisakiRendererAPI['ui']['VirtualList'] = w.kisaki.ui.VirtualList
export const VirtualizedCombobox: KisakiRendererAPI['ui']['VirtualizedCombobox'] =
  w.kisaki.ui.VirtualizedCombobox
